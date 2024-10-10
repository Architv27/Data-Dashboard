# app/schemas.py

from pydantic import BaseModel
from typing import Optional, List

class ReviewBase(BaseModel):
    review_title: str
    review_content: str
    product_id: int
    user_id: int

class ReviewCreate(ReviewBase):
    pass

class Review(ReviewBase):
    review_id: int

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    user_name: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    user_id: int
    reviews: List[Review] = []

    class Config:
        orm_mode = True

class ProductBase(BaseModel):
    product_name: str
    category: str
    discounted_price: float
    actual_price: float
    discount_percentage: float
    rating: float
    rating_count: int
    about_product: Optional[str]
    img_link: Optional[str]
    product_link: Optional[str]

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    product_id: int
    reviews: List[Review] = []

    class Config:
        orm_mode = True
