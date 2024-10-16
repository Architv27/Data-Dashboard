# app/routers/data.py

from fastapi import APIRouter, Depends, HTTPException
from typing import List
import logging

from app.models import Product
from app.database import get_database
from pymongo.database import Database
from bson import ObjectId

router = APIRouter()

# Configure logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
handler.setFormatter(formatter)
if not logger.handlers:
    logger.addHandler(handler)

@router.get("/data/", response_model=List[Product])
async def get_all_data(db: Database = Depends(get_database)):
    try:
        products_cursor = db["amazon-sales"].find()
        products = await products_cursor.to_list(length=None)  # Fetch all documents

        # Convert ObjectId to string if included in the Product model
        for product in products:
            if "_id" in product:
                product["id"] = str(product["_id"])
                del product["_id"]

        logger.info(f"Retrieved {len(products)} products from database")
        return [Product(**product) for product in products]
    
    except Exception as e:
        logger.error(f"Error retrieving products: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
