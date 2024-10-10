# app/routers/users.py

from fastapi import APIRouter, Body, HTTPException
from fastapi.encoders import jsonable_encoder
from typing import List

from app.models import User, UserCreate
from app.database import user_collection
from bson import ObjectId

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

# Create User
@router.post("/", response_description="Add new user", response_model=User)
async def create_user(user: UserCreate = Body(...)):
    user = jsonable_encoder(user)
    new_user = await user_collection.insert_one(user)
    created_user = await user_collection.find_one({"_id": new_user.inserted_id})
    return User(**created_user)

# Get All Users
@router.get("/", response_description="List all users", response_model=List[User])
async def list_users():
    users = []
    async for user in user_collection.find():
        users.append(User(**user))
    return users

# ... Implement other CRUD operations similarly
