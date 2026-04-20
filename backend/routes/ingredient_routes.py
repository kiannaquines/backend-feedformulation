from fastapi import APIRouter, Depends, HTTPException, status
from core.authentication import verify_jwt_token
from core.ai_service import ai_suggester, ai_assistant, test_gemini_connection
from db.database import get_db
from models.models import Ingredient
from schema.schema import (
    IngredientCreate, IngredientResponse, IngredientSuggestionRequest, 
    IngredientSuggestionResponse, AIChatRequest, AIChatResponse, AIStatusResponse
)
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List

ingredient_router = APIRouter(tags=["Ingredients"])


@ingredient_router.get("/ingredients/ai-status", response_model=AIStatusResponse, status_code=status.HTTP_200_OK)
def check_ai_status():
    """
    Test the Gemini AI connection and return status.
    
    This endpoint checks if the Google Gemini API is accessible and working correctly.
    No authentication required for status checks.
    """
    return test_gemini_connection()


@ingredient_router.get("/ingredients/all", status_code=status.HTTP_200_OK)
def get_ingredients(db: Session = Depends(get_db), auth_user: dict = Depends(verify_jwt_token)):
    """
    Retrieve a list of all ingredients.
    """
    ingredients = db.query(Ingredient).order_by(Ingredient.created_at).all()
    
    if not ingredients:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ingredients are currently empty")
    
    return {
        "detail": f"Found {len(ingredients)} ingredients",
        "ingredients": ingredients,
    }

@ingredient_router.get("/ingredients/{ingredient_id}", status_code=status.HTTP_200_OK)
def get_specific_ingredient(ingredient_id: int, db: Session = Depends(get_db), auth_user: dict = Depends(verify_jwt_token)):
    ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    if not ingredient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ingredient not found")
    return ingredient

@ingredient_router.post("/ingredients/create", response_model=IngredientResponse, status_code=status.HTTP_201_CREATED)
def create_ingredient(ingredients: IngredientCreate, db: Session = Depends(get_db), auth_user: dict = Depends(verify_jwt_token)):

    existing = db.query(Ingredient).filter(Ingredient.name == ingredients.name).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ingredient already exists")
        
    try:
        ingredient = Ingredient(**ingredients.dict())
        db.add(ingredient)
        db.commit()
        db.refresh(ingredient)
        return ingredient
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An error occured while adding ingredient")
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Something went wrong")

@ingredient_router.put("/ingredients/update/{ingredient_id}", response_model=IngredientResponse, status_code=status.HTTP_200_OK)
def update_ingredient(ingredient_id: int, data: IngredientCreate, db: Session = Depends(get_db), auth_user: dict = Depends(verify_jwt_token)):
    ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    if not ingredient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ingredient not found")
    
    for key, value in data.dict().items():
        setattr(ingredient, key, value)
    
    db.commit()
    db.refresh(ingredient)
    return ingredient

@ingredient_router.delete("/ingredients/delete/{ingredient_id}", status_code=status.HTTP_200_OK)
def delete_ingredient(ingredient_id: int, db: Session = Depends(get_db), auth_user: dict = Depends(verify_jwt_token)):
    ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    if not ingredient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ingredient not found")

    db.delete(ingredient)
    db.commit()
    return {"detail": "Ingredient deleted successfully"}

@ingredient_router.post("/ingredients/ai-suggest", response_model=List[IngredientSuggestionResponse], status_code=status.HTTP_200_OK)
def ai_suggest_ingredients(
    request: IngredientSuggestionRequest,
    db: Session = Depends(get_db),
    auth_user: dict = Depends(verify_jwt_token)
):
    """
    AI-powered ingredient suggestions based on nutrient requirements.
    
    Uses intelligent scoring algorithms to analyze and rank ingredients
    based on how well they match the specified nutrient requirements.
    """
    try:
        # Get all available ingredients from database
        ingredients = db.query(Ingredient).all()
        
        if not ingredients:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No ingredients available in the database"
            )
        
        # Convert SQLAlchemy objects to dictionaries
        ingredients_dict = [
            {
                'id': ing.id,
                'name': ing.name,
                'crude_protein': ing.crude_protein,
                'metabolized_energy': ing.metabolized_energy,
                'calcium': ing.calcium,
                'total_phosphorus': ing.total_phosphorus,
                'price': ing.price,
                'is_available': ing.is_available
            }
            for ing in ingredients
        ]
        
        # Prepare requirements dictionary
        requirements = {
            'protein_percent': request.protein_percent,
            'energy_me': request.energy_me,
            'calcium_percent': request.calcium_percent,
            'phosphorus_percent': request.phosphorus_percent
        }
        
        # Validate requirements
        if all(v == 0 for v in requirements.values()):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one nutrient requirement must be greater than 0"
            )
        
        # Get AI suggestions
        suggestions = ai_suggester.suggest_ingredients(
            available_ingredients=ingredients_dict,
            requirements=requirements,
            excluded_names=request.excluded_ingredient_names or [],
            top_n=request.top_n or 5
        )
        
        if not suggestions:
            return []
        
        return suggestions
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating AI suggestions: {str(e)}"
        )

@ingredient_router.post("/ingredients/ai-chat", response_model=AIChatResponse, status_code=status.HTTP_200_OK)
def ai_chat_assistant(
    request: AIChatRequest,
    db: Session = Depends(get_db),
    auth_user: dict = Depends(verify_jwt_token)
):
    """
    AI-powered chat assistant for feed formulation.
    
    Allows natural language conversation to get recommendations and add ingredients.
    Can understand requests like "Add corn to my formulation" or "What about soybean meal?"
    """
    try:
        # Get all available ingredients
        ingredients = db.query(Ingredient).all()
        
        if not ingredients:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No ingredients available in the database"
            )
        
        # Convert to dictionary format
        ingredients_dict = [
            {
                'id': ing.id,
                'name': ing.name,
                'crude_protein': ing.crude_protein,
                'metabolized_energy': ing.metabolized_energy,
                'calcium': ing.calcium,
                'total_phosphorus': ing.total_phosphorus,
                'price': ing.price,
                'is_available': ing.is_available
            }
            for ing in ingredients
        ]
        
        # Prepare context for AI
        context = {
            'protein_percent': request.protein_percent,
            'energy_me': request.energy_me,
            'calcium_percent': request.calcium_percent,
            'phosphorus_percent': request.phosphorus_percent,
            'selected_ingredients': [
                {'name': name} for name in (request.selected_ingredient_names or [])
            ],
            'available_ingredients': ingredients_dict
        }
        
        # Get AI response
        result = ai_assistant.chat(request.message, context)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing chat request: {str(e)}"
        )