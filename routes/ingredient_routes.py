from fastapi import APIRouter, Depends, HTTPException, status
from core.authentication import verify_jwt_token
from db.database import get_db
from models.models import Ingredient
from schema.schema import IngredientCreate, IngredientResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

ingredient_router = APIRouter(tags=["Ingredients"])


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