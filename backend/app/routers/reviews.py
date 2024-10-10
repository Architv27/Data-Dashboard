# app/routers/reviews.py

from fastapi import APIRouter, Body, HTTPException
from fastapi.encoders import jsonable_encoder
from typing import List

from app.models import Review, ReviewCreate
from app.database import review_collection
from bson import ObjectId

router = APIRouter(
    prefix="/reviews",
    tags=["reviews"],
)

# Create Review
@router.post("/", response_description="Add new review", response_model=Review)
async def create_review(review: ReviewCreate = Body(...)):
    review = jsonable_encoder(review)
    new_review = await review_collection.insert_one(review)
    created_review = await review_collection.find_one({"_id": new_review.inserted_id})
    return Review(**created_review)

# Get All Reviews
@router.get("/", response_description="List all reviews", response_model=List[Review])
async def list_reviews():
    reviews = []
    async for review in review_collection.find():
        reviews.append(Review(**review))
    return reviews

# ... Implement other CRUD operations similarly
