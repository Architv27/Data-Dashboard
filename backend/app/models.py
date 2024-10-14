from typing import Optional, List
from bson import ObjectId
from pydantic import BaseModel, Field, ConfigDict, field_validator, ValidationInfo
from pydantic_core import core_schema
import logging
import math  # Import math module

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Custom ObjectId validator
class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler):
        return core_schema.general_plain_validator_function(cls.validate)
    
    @classmethod
    def validate(cls, v, info: ValidationInfo):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)
    
    @classmethod
    def __get_pydantic_json_schema__(cls, schema, handler):
        json_schema = handler(schema)
        json_schema.update(type="string")
        return json_schema

class ProductBase(BaseModel):
    product_name: str
    category: str
    discounted_price: Optional[float] = None
    actual_price: Optional[float] = None
    discount_percentage: Optional[float] = None
    rating: Optional[float] = None  # Make rating optional
    rating_count: Optional[int] = None
    about_product: Optional[str] = None
    img_link: Optional[str] = None
    product_link: Optional[str] = None

    # Custom validators
    @field_validator('discounted_price', 'actual_price', 'discount_percentage', mode='before')
    @classmethod
    def parse_float_fields(cls, value):
        if value is None:
            return None
        if isinstance(value, str):
            value = value.replace('₹', '').replace(',', '').replace('%', '').strip()
            try:
                return float(value)
            except ValueError:
                logger.warning(f"Cannot convert '{value}' to float. Setting to None.")
                return None  # Set to None instead of raising
        if isinstance(value, (float, int)):
            return float(value)
        logger.warning(f"Invalid type for float field: {type(value)}. Setting to None.")
        return None

    @field_validator('rating', mode='before')
    @classmethod
    def parse_rating_field(cls, value):
        if value is None:
            return None
        if isinstance(value, str):
            value = value.strip()
            if value == '|':
                logger.warning("Encountered invalid 'rating' value '|'. Setting to None.")
                return None  # Handle specific invalid value
            try:
                return float(value)
            except ValueError:
                logger.warning(f"Cannot convert '{value}' to float. Setting to None.")
                return None
        if isinstance(value, (float, int)):
            if isinstance(value, float) and not math.isfinite(value):
                logger.warning(f"'rating' is not finite: {value}. Setting to None.")
                return None
            return float(value)
        logger.warning(f"Invalid type for 'rating': {type(value)}. Setting to None.")
        return None

    @field_validator('rating_count', mode='before')
    @classmethod
    def parse_int_fields(cls, value):
        if value is None:
            return None
        if isinstance(value, str):
            value = value.replace(',', '').strip()
            try:
                return int(value)
            except ValueError:
                logger.warning(f"Cannot convert '{value}' to int. Setting to None.")
                return None
        if isinstance(value, float):
            if not math.isfinite(value):
                logger.warning(f"'rating_count' is not finite: {value}. Setting to None.")
                return None
            return int(value)
        if isinstance(value, int):
            return value
        logger.warning(f"Invalid type for 'rating_count': {type(value)}. Setting to None.")
        return None

    model_config = ConfigDict(
        populate_by_name=True,  # Updated key
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

class ProductsResponse(BaseModel):
    total: int
    page: int
    page_size: int
    products: List[Product]

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

# User Models
class UserBase(BaseModel):
    user_name: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    reviews: List[str] = []

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

# Review Models
class ReviewBase(BaseModel):
    review_title: str
    review_content: str
    product_id: str
    user_id: str

class ReviewCreate(ReviewBase):
    pass

class Review(ReviewBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
