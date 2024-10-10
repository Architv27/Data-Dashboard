# app/routers/data.py

from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List
import logging

from app.models import Product
from app.database import get_database

router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.get("/data/", response_model=List[Product])
async def get_all_data(db: AsyncIOMotorClient = Depends(get_database)):
    products = []
    async for product in db["amazon"]["amazon-sales"].find():
        products.append(Product(**product))
    # Log the retrieval
    logger.info(f"Retrieved {len(products)} products from database")
    return products
