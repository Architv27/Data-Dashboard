# app/routers/products.py

from fastapi import APIRouter, Body, HTTPException
from fastapi.encoders import jsonable_encoder
from typing import List
import logging

from app.models import Product, ProductCreate
from app.database import product_collection
from bson import ObjectId

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/products",
    tags=["products"],
)

# Create Product
@router.post("/", response_description="Add new product", response_model=Product)
async def create_product(product: ProductCreate = Body(...)):
    product_data = jsonable_encoder(product)
    new_product = await product_collection.insert_one(product_data)
    created_product = await product_collection.find_one({"_id": new_product.inserted_id})
    # Log the creation
    logger.info(f"New product created with ID: {new_product.inserted_id}")
    return Product(**created_product)

# Get All Products
@router.get("/", response_description="List all products", response_model=List[Product])
async def list_products():
    products = []
    async for product in product_collection.find():
        products.append(Product(**product))
    return products

# Get Product by ID
@router.get("/{id}", response_description="Get a single product", response_model=Product)
async def show_product(id: str):
    if (product := await product_collection.find_one({"_id": ObjectId(id)})) is not None:
        return Product(**product)
    raise HTTPException(status_code=404, detail=f"Product {id} not found")

# Update Product
@router.put("/{id}", response_description="Update a product", response_model=Product)
async def update_product(id: str, product: ProductCreate = Body(...)):
    product_data = {k: v for k, v in product.dict().items() if v is not None}
    if len(product_data) >= 1:
        update_result = await product_collection.update_one(
            {"_id": ObjectId(id)}, {"$set": product_data}
        )
        if update_result.modified_count == 1:
            updated_product = await product_collection.find_one({"_id": ObjectId(id)})
            if updated_product is not None:
                # Log the edit
                logger.info(f"Product {id} updated with data: {product_data}")
                return Product(**updated_product)
    existing_product = await product_collection.find_one({"_id": ObjectId(id)})
    if existing_product is not None:
        return Product(**existing_product)
    raise HTTPException(status_code=404, detail=f"Product {id} not found")

# Delete Product
@router.delete("/{id}", response_description="Delete a product")
async def delete_product(id: str):
    delete_result = await product_collection.delete_one({"_id": ObjectId(id)})
    if delete_result.deleted_count == 1:
        # Log the deletion
        logger.info(f"Product {id} deleted")
        return {"detail": f"Product {id} deleted"}
    raise HTTPException(status_code=404, detail=f"Product {id} not found")
