# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.products import router as products_router
from app.routers.users import router as users_router
from app.routers.reviews import router as reviews_router
from app.routers.data import router as data_router  # Import the data router directly
from app.routers.analytics import router as analytics_router

app = FastAPI()

# CORS settings (adjust as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust this to your frontend's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(products_router)
app.include_router(users_router)
app.include_router(reviews_router)
app.include_router(data_router)  # Include the data router
app.include_router(analytics_router)
