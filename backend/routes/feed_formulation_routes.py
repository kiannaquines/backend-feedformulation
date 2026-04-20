from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from schema.schema import *
from core.authentication import *
import numpy as np
from db.database import get_db
from models.models import FeedFormulation

feed_formulation_router = APIRouter(tags=["Feed Formulation"])

@feed_formulation_router.post("/feed/formulate")
async def feed_formulator(
    formulation_request: FeedFormulationRequest,
    auth_user: dict = Depends(verify_jwt_token)
):
    """Dynamic feed formulation endpoint (protected by JWT token)"""

    from scipy.optimize import linprog

    if not formulation_request.ingredients:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one ingredient must be provided"
        )

    ingredients = [ing.name for ing in formulation_request.ingredients]
    costs = np.array([ing.cost_per_kg for ing in formulation_request.ingredients])

    nutrient_matrix = np.array([
        [ing.protein_percent    for ing in formulation_request.ingredients],
        [ing.energy_me          for ing in formulation_request.ingredients],
        [ing.calcium_percent    for ing in formulation_request.ingredients],
        [ing.phosphorus_percent for ing in formulation_request.ingredients]
    ])

    nutrient_req = np.array([
        formulation_request.nutrient_requirements.protein_percent,
        formulation_request.nutrient_requirements.energy_me,
        formulation_request.nutrient_requirements.calcium_percent,
        formulation_request.nutrient_requirements.phosphorus_percent
    ])

    NUTRIENT_LABELS = ["protein_percent", "energy_me", "calcium_percent", "phosphorus_percent"]

    ingredient_min = np.array([ing.min_percentage for ing in formulation_request.ingredients])
    ingredient_max = np.array([ing.max_percentage for ing in formulation_request.ingredients])

    if any(ingredient_min < 0) or any(ingredient_max > 1):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ingredient percentages must be between 0 and 1"
        )

    if any(ingredient_min > ingredient_max):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Minimum percentage cannot be greater than maximum percentage"
        )

    # ── Pre-solve feasibility analysis (lock-aware) ──────────────────────────
    n = len(ingredients)

    locked_idx = [i for i in range(n) if ingredient_min[i] == ingredient_max[i]]
    free_idx   = [i for i in range(n) if ingredient_min[i] != ingredient_max[i]]

    locked_pct = float(sum(ingredient_min[i] for i in locked_idx))
    locked_nutrients = np.array([
        sum(nutrient_matrix[j][i] * ingredient_min[i] for i in locked_idx)
        for j in range(len(nutrient_req))
    ])

    remaining_pct       = 1.0 - locked_pct
    remaining_nutrients = nutrient_req - locked_nutrients

    free_min_sum = float(sum(ingredient_min[i] for i in free_idx))
    free_max_sum = float(sum(ingredient_max[i] for i in free_idx))
    sum_feasible = free_min_sum <= remaining_pct <= free_max_sum

    nutrient_gaps = []
    for j, label in enumerate(NUTRIENT_LABELS):
        min_ach  = float(sum(nutrient_matrix[j][i] * ingredient_min[i] for i in free_idx))
        max_ach  = float(sum(nutrient_matrix[j][i] * ingredient_max[i] for i in free_idx))
        req      = float(remaining_nutrients[j])
        feasible = min_ach <= req <= max_ach
        gap = round(req - max_ach, 6) if req > max_ach else (round(req - min_ach, 6) if req < min_ach else 0.0)
        nutrient_gaps.append({
            "nutrient": label,
            "residual_required": round(req, 6),
            "min_achievable":    round(min_ach, 6),
            "max_achievable":    round(max_ach, 6),
            "feasible": feasible,
            "gap": gap
        })

    suggestions = []
    if not sum_feasible:
        deficit = round(remaining_pct - free_max_sum, 4)
        excess  = round(free_min_sum - remaining_pct, 4)
        if deficit > 0 and free_idx:
            c_i = min(free_idx, key=lambda i: ingredient_max[i])
            suggestions.append({
                "action": "increase_max", "ingredient": ingredients[c_i],
                "field": "max_percentage",
                "current_value": round(float(ingredient_max[c_i]), 4),
                "suggested_value": round(float(ingredient_max[c_i]) + deficit, 4),
                "reason": f"Free ingredient ceilings ({round(free_max_sum*100,2)}%) cannot fill the remaining {round(remaining_pct*100,2)}%."
            })
        if excess > 0 and free_idx:
            c_i = max(free_idx, key=lambda i: ingredient_min[i])
            suggestions.append({
                "action": "reduce_min", "ingredient": ingredients[c_i],
                "field": "min_percentage",
                "current_value": round(float(ingredient_min[i]), 4),
                "suggested_value": round(max(0.0, float(ingredient_min[c_i]) - excess), 4),
                "reason": f"Free ingredient floors ({round(free_min_sum*100,2)}%) exceed the remaining {round(remaining_pct*100,2)}%."
            })

    for gap_info in nutrient_gaps:
        if gap_info["feasible"] or not free_idx:
            continue
        j = NUTRIENT_LABELS.index(gap_info["nutrient"])
        if gap_info["gap"] < 0:  # shortfall — need more of this nutrient
            best_i = max(free_idx, key=lambda i: nutrient_matrix[j][i])
            nudge  = abs(gap_info["gap"]) / max(float(nutrient_matrix[j][best_i]), 0.001)
            suggestions.append({
                "action": "increase_max", "ingredient": ingredients[best_i],
                "field": "max_percentage",
                "current_value": round(float(ingredient_max[best_i]), 4),
                "suggested_value": round(min(1.0, float(ingredient_max[best_i]) + nudge), 4),
                "reason": f"Cannot reach {gap_info['nutrient']} target. '{ingredients[best_i]}' has the highest content — raise its max."
            })
        else:  # surplus — need to dilute
            low_i = min(free_idx, key=lambda i: nutrient_matrix[j][i])
            suggestions.append({
                "action": "increase_max", "ingredient": ingredients[low_i],
                "field": "max_percentage",
                "current_value": round(float(ingredient_max[low_i]), 4),
                "suggested_value": round(min(1.0, float(ingredient_max[low_i]) + 0.05), 4),
                "reason": f"Locked ingredients over-contribute {gap_info['nutrient']}. Allow more of '{ingredients[low_i]}' (low in this nutrient) to dilute."
            })

    locked_names_str = ", ".join(
        f"{ingredients[i]} {round(float(ingredient_min[i])*100, 2)}%" for i in locked_idx
    ) or "none"

    locked_summary = {
        "count": len(locked_idx),
        "total_locked_percent": round(locked_pct * 100, 4),
        "remaining_percent_for_free": round(remaining_pct * 100, 4),
        "items": [
            {"name": ingredients[i], "locked_at_percent": round(float(ingredient_min[i]) * 100, 4)}
            for i in locked_idx
        ]
    }
    # ── End pre-solve ────────────────────────────────────────────────────────

    sum_constraint = np.ones((1, len(ingredients)))
    A_eq = np.vstack((sum_constraint, nutrient_matrix))
    b_eq = np.hstack(([1.0], nutrient_req))
    bounds = list(zip(ingredient_min, ingredient_max))

    try:
        result = linprog(
            costs, 
            A_eq=A_eq, 
            b_eq=b_eq, 
            bounds=bounds, 
            method=formulation_request.optimization_method
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Optimization failed: {str(e)}"
        )

    base_response = {
        "formulation_inputs": {
            "total_ingredients": len(ingredients),
            "ingredients": [
                {
                    "name": ing.name,
                    "cost_per_kg": ing.cost_per_kg,
                    "min_percentage": ing.min_percentage * 100,
                    "max_percentage": ing.max_percentage * 100,
                    "is_locked": ing.min_percentage == ing.max_percentage
                }
                for ing in formulation_request.ingredients
            ],
            "nutrient_targets": {
                "protein_percent": formulation_request.nutrient_requirements.protein_percent,
                "energy_me": formulation_request.nutrient_requirements.energy_me,
                "calcium_percent": formulation_request.nutrient_requirements.calcium_percent,
                "phosphorus_percent": formulation_request.nutrient_requirements.phosphorus_percent
            }
        }
    }

    if result.success:
        ingredient_percentages = result.x * 100
        nutrient_values = nutrient_matrix @ result.x
        costs_breakdown = costs * result.x

        base_response.update({
            "status": "success",
            "message": "Optimal feed formulation found.",
            "optimization_details": {
                "solver_status": str(result.message),
                "iterations": int(getattr(result, 'nit', 0)),
                "total_cost_per_kg": round(float(result.fun), 4)
            },
            "ingredient_composition": [
                {
                    "name": ingredients[i],
                    "percentage": round(float(ingredient_percentages[i]), 4),
                    "cost_contribution": round(float(costs_breakdown[i]), 4),
                    "included": bool(float(ingredient_percentages[i]) > 0.001),
                    "is_locked": bool(ingredient_min[i] == ingredient_max[i])
                }
                for i in range(len(ingredients))
            ],
            "nutrient_achievement": {
                "protein_percent": {
                    "achieved": round(float(nutrient_values[0]), 4),
                    "required": round(float(formulation_request.nutrient_requirements.protein_percent), 4),
                    "matched": True
                },
                "energy_me": {
                    "achieved": round(float(nutrient_values[1]), 4),
                    "required": round(float(formulation_request.nutrient_requirements.energy_me), 4),
                    "matched": True
                },
                "calcium_percent": {
                    "achieved": round(float(nutrient_values[2]), 4),
                    "required": round(float(formulation_request.nutrient_requirements.calcium_percent), 4),
                    "matched": True
                },
                "phosphorus_percent": {
                    "achieved": round(float(nutrient_values[3]), 4),
                    "required": round(float(formulation_request.nutrient_requirements.phosphorus_percent), 4),
                    "matched": True
                }
            },
            "summary": {
                "total_ingredient_percentage": round(float(sum(result.x) * 100), 6),
                "active_ingredients_count": int(sum(1 for x in ingredient_percentages if float(x) > 0.001)),
                "locked_ingredients_count": len(locked_idx),
                "cost_per_kg": round(float(result.fun), 4),
                "formulation_feasible": True
            }
        })
    else:
        base_response.update({
            "status": "failure",
            "detail": "No optimal solution found.",
            "locked_summary": locked_summary,
            "residual_targets": {
                "remaining_percent":    round(remaining_pct * 100, 4),
                "remaining_protein":    round(float(remaining_nutrients[0]), 4),
                "remaining_energy":     round(float(remaining_nutrients[1]), 4),
                "remaining_calcium":    round(float(remaining_nutrients[2]), 4),
                "remaining_phosphorus": round(float(remaining_nutrients[3]), 4)
            },
            "infeasibility_diagnosis": {
                "sum_check": {
                    "free_min_sum_percent":     round(free_min_sum * 100, 4),
                    "free_max_sum_percent":     round(free_max_sum * 100, 4),
                    "remaining_needed_percent": round(remaining_pct * 100, 4),
                    "feasible": sum_feasible,
                    "issue": (
                        f"Free ingredient ceilings ({round(free_max_sum*100,2)}%) cannot fill the remaining {round(remaining_pct*100,2)}% after locked ingredients."
                        if free_max_sum < remaining_pct else
                        f"Free ingredient floors ({round(free_min_sum*100,2)}%) exceed the remaining {round(remaining_pct*100,2)}%."
                        if free_min_sum > remaining_pct else
                        "Sum of free ingredients is feasible."
                    )
                },
                "nutrient_gaps": nutrient_gaps
            },
            "adjustment_suggestions": suggestions,
            "note": f"Locked ingredients ({locked_names_str}) are honored and were not modified in these suggestions.",
            "formulation_feasible": False
        })

    return base_response

@feed_formulation_router.post("/feed/formulation/save", status_code=status.HTTP_201_CREATED)
async def save_formulation(
    formulation: FeedFormulationWithPayloadRequest,
    db=Depends(get_db),
    auth_user: dict = Depends(verify_jwt_token)
):
    try:
        if auth_user["user_id"] != formulation.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only save formulations for your own account."
            )

        new_entry = FeedFormulation(
            formulation_name=formulation.formulation_name,
            formulation_description=formulation.formulation_description,
            user_id=formulation.user_id,
            payload=formulation.payload
        )
        
        db.add(new_entry)
        db.commit()
        db.refresh(new_entry)
                
        return {
            "detail": "Formulation saved successfully.",
        }

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error occurred: {str(e)}"
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@feed_formulation_router.get('/feed/formulation/all', status_code=status.HTTP_200_OK)
async def get_all_formulation(db=Depends(get_db), auth_user: dict = Depends(verify_jwt_token)):
    formulations = db.query(FeedFormulation).all()
    return formulations

@feed_formulation_router.delete('/feed/formulation/remove/{formulation_id}', status_code=status.HTTP_200_OK)
async def remove_formulation(formulation_id: int, db=Depends(get_db), auth_user: dict = Depends(verify_jwt_token)):
    try:
        deleted = db.query(FeedFormulation).filter(FeedFormulation.id == formulation_id).delete()
        db.commit()
        if deleted:
            return {"detail": "Formulation has been successfully removed."}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Formulation not found."
            )
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error occurred: {str(e)}"
        )

@feed_formulation_router.put('/feed/formulation/update/{formulation_id}', status_code=status.HTTP_200_OK)
async def update_formulation(
    formulation_id: int,
    payload: FeedFormulationWithPayloadRequest,
    db: Session = Depends(get_db),
    auth_user: dict = Depends(verify_jwt_token)
):
    try:
        if auth_user["user_id"] != payload.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to update formulations for other users."
            )

        formulation = db.query(FeedFormulation).filter(
            FeedFormulation.id == formulation_id,
            FeedFormulation.user_id == payload.user_id
        ).first()

        if not formulation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Formulation not found."
            )
        
        formulation.payload = payload.payload
        formulation.formulation_name = payload.formulation_name
        formulation.formulation_description = payload.formulation_description

        db.commit()
        db.refresh(formulation)

        return {
            "message": "Formulation updated successfully.",
            "formulation": formulation
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while updating the formulation: {str(e)}"
        )


@feed_formulation_router.get('/my/feed/formulation/',status_code=status.HTTP_200_OK)
async def get_my_formulations(db=Depends(get_db), auth_user: dict = Depends(verify_jwt_token)):
    try:
        my_formulations = db.query(FeedFormulation).filter(FeedFormulation.user_id == auth_user['user_id']).all()
        return my_formulations
    
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error occurred: {str(e)}"
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )    