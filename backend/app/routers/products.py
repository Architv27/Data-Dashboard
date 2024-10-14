# app/routers/products.py

from fastapi import APIRouter, Body, HTTPException, Query
from typing import List, Optional
import logging
import re
import math  # Ensure math is imported

from app.models import Product, ProductCreate, ProductsResponse
from app.database import product_collection
from bson import ObjectId
from bson.errors import InvalidId

# Configure logging with a specific format
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/products",
    tags=["products"],
)

def convert_objectid_to_str(product: dict) -> dict:
    """
    Converts MongoDB's ObjectId to string and assigns it to 'id' field.
    Removes the original '_id' field.
    """
    if "_id" in product:
        product["id"] = str(product["_id"])
        del product["_id"]
    return product

# Create Product
@router.post("/", response_description="Add new product", response_model=Product)
async def create_product(product: ProductCreate = Body(...)):
    product_data = product.dict(exclude_unset=True)
    try:
        new_product = await product_collection.insert_one(product_data)
        created_product = await product_collection.find_one({"_id": new_product.inserted_id})
        if created_product:
            created_product = convert_objectid_to_str(created_product)
            logger.info(f"New product created with ID: {new_product.inserted_id}")
            return Product(**created_product)
        else:
            logger.error("Failed to retrieve the created product.")
            raise HTTPException(status_code=500, detail="Failed to create product.")
    except Exception as e:
        logger.error(f"Error creating product: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while creating the product.")

# Get All Products with Optional Filters and Pagination
@router.get("/", response_description="List all products", response_model=ProductsResponse)
async def list_products(
    categories: Optional[List[str]] = Query(None, description="Filter by product categories"),
    min_rating: Optional[float] = Query(None, ge=0.0, le=5.0, description="Minimum rating"),
    max_rating: Optional[float] = Query(None, ge=0.0, le=5.0, description="Maximum rating"),
    page: Optional[int] = Query(1, ge=1, description="Page number for pagination"),
    page_size: Optional[int] = Query(20, ge=1, le=100, description="Number of products per page")
):
    """
    Retrieves a paginated list of products with optional filtering by categories and rating range.
    
    Args:
        categories (List[str], optional): List of categories to filter products.
        min_rating (float, optional): Minimum rating to filter products.
        max_rating (float, optional): Maximum rating to filter products.
        page (int, optional): Page number for pagination.
        page_size (int, optional): Number of products per page.
    
    Returns:
        ProductsResponse: Contains total count, current page, page size, and list of products.
    """
    query = {}
    
    # Apply category filter if provided using regex
    if categories:
        # Escape categories to handle any special regex characters
        escaped_categories = [re.escape(category) for category in categories]
        # Join categories with '|' to create an OR regex pattern
        regex_pattern = '|'.join(escaped_categories)
        query['category'] = {'$regex': regex_pattern, '$options': 'i'}  # 'i' for case-insensitive
        logger.info(f"Applied category regex filter: {regex_pattern}")
    
    # Apply rating range filter if provided
    if min_rating is not None and max_rating is not None:
        query['rating'] = {'$gte': min_rating, '$lte': max_rating}
    elif min_rating is not None:
        query['rating'] = {'$gte': min_rating}
    elif max_rating is not None:
        query['rating'] = {'$lte': max_rating}

    logger.info(f"Query: {query}")

    # Pagination calculations
    skip = (page - 1) * page_size
    limit = page_size

    logger.info(f"Pagination - Page: {page}, Page Size: {page_size}, Skip: {skip}, Limit: {limit}")

    # Fetch filtered products from MongoDB with pagination
    try:
        cursor = product_collection.find(query).skip(skip).limit(limit)
        products = []
        async for product in cursor:
            product = convert_objectid_to_str(product)
            
            # Safeguard against 'NaN' in 'rating_count'
            if 'rating_count' in product:
                if isinstance(product['rating_count'], float) and math.isnan(product['rating_count']):
                    product['rating_count'] = None
                    logger.warning(f"Product ID {product.get('id')} has 'rating_count' as NaN. Setting to None.")
            
            products.append(Product(**product))
        logger.info(f"Fetched {len(products)} products from MongoDB for page {page}.")

        # Get total count of matching documents
        total_count = await product_collection.count_documents(query)
        logger.info(f"Total matching products: {total_count}")

        return ProductsResponse(
            total=total_count,
            page=page,
            page_size=page_size,
            products=products
        )
    except Exception as e:
        logger.error(f"Error fetching products from MongoDB: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch products from the database.")

# Get Product by ID
@router.get("/{id}", response_description="Get a single product", response_model=Product)
async def show_product(id: str):
    """
    Retrieves a single product by its ID.
    
    Args:
        id (str): The ObjectId of the product as a string.
    
    Returns:
        Product: The product with the specified ID.
    """
    try:
        obj_id = ObjectId(id)
    except InvalidId:
        logger.error(f"Invalid product ID format: {id}")
        raise HTTPException(status_code=400, detail="Invalid product ID format.")
    
    try:
        product = await product_collection.find_one({"_id": obj_id})
        if product:
            product = convert_objectid_to_str(product)
            
            # Safeguard against 'NaN' in 'rating_count'
            if 'rating_count' in product:
                if isinstance(product['rating_count'], float) and math.isnan(product['rating_count']):
                    product['rating_count'] = None
                    logger.warning(f"Product ID {product.get('id')} has 'rating_count' as NaN. Setting to None.")
            
            return Product(**product)
        else:
            logger.warning(f"Product not found with ID: {id}")
            raise HTTPException(status_code=404, detail=f"Product {id} not found.")
    except Exception as e:
        logger.error(f"Error retrieving product {id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve the product.")

# Update Product
@router.put("/{id}", response_description="Update a product", response_model=Product)
async def update_product(id: str, product: ProductCreate = Body(...)):
    """
    Updates an existing product by its ID.
    
    Args:
        id (str): The ObjectId of the product as a string.
        product (ProductCreate): The updated product data.
    
    Returns:
        Product: The updated product.
    """
    try:
        obj_id = ObjectId(id)
    except InvalidId:
        logger.error(f"Invalid product ID format: {id}")
        raise HTTPException(status_code=400, detail="Invalid product ID format.")
    
    product_data = {k: v for k, v in product.dict().items() if v is not None}
    if not product_data:
        logger.warning("No data provided for update.")
        raise HTTPException(status_code=400, detail="No data provided for update.")
    
    try:
        update_result = await product_collection.update_one(
            {"_id": obj_id}, {"$set": product_data}
        )
        if update_result.modified_count == 1:
            updated_product = await product_collection.find_one({"_id": obj_id})
            if updated_product:
                updated_product = convert_objectid_to_str(updated_product)
                
                # Safeguard against 'NaN' in 'rating_count'
                if 'rating_count' in updated_product:
                    if isinstance(updated_product['rating_count'], float) and math.isnan(updated_product['rating_count']):
                        updated_product['rating_count'] = None
                        logger.warning(f"Product ID {updated_product.get('id')} has 'rating_count' as NaN. Setting to None.")
                
                logger.info(f"Product {id} updated with data: {product_data}")
                return Product(**updated_product)
        # If no documents were modified, check if the product exists
        existing_product = await product_collection.find_one({"_id": obj_id})
        if existing_product:
            existing_product = convert_objectid_to_str(existing_product)
            
            # Safeguard against 'NaN' in 'rating_count'
            if 'rating_count' in existing_product:
                if isinstance(existing_product['rating_count'], float) and math.isnan(existing_product['rating_count']):
                    existing_product['rating_count'] = None
                    logger.warning(f"Product ID {existing_product.get('id')} has 'rating_count' as NaN. Setting to None.")
            
            return Product(**existing_product)
        else:
            logger.warning(f"Product not found with ID: {id}")
            raise HTTPException(status_code=404, detail=f"Product {id} not found.")
    except Exception as e:
        logger.error(f"Error updating product {id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update the product.")

# Delete Product
@router.delete("/{id}", response_description="Delete a product")
async def delete_product(id: str):
    """
    Deletes a product by its ID.
    
    Args:
        id (str): The ObjectId of the product as a string.
    
    Returns:
        dict: Confirmation message upon successful deletion.
    """
    try:
        obj_id = ObjectId(id)
    except InvalidId:
        logger.error(f"Invalid product ID format: {id}")
        raise HTTPException(status_code=400, detail="Invalid product ID format.")
    
    try:
        delete_result = await product_collection.delete_one({"_id": obj_id})
        if delete_result.deleted_count == 1:
            logger.info(f"Product {id} deleted.")
            return {"detail": f"Product {id} deleted."}
        else:
            logger.warning(f"Product not found with ID: {id}")
            raise HTTPException(status_code=404, detail=f"Product {id} not found.")
    except Exception as e:
        logger.error(f"Error deleting product {id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete the product.")
