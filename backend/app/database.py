# app/database.py

import motor.motor_asyncio

MONGO_DETAILS = "mongodb://localhost:27017"

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)

database = client["amazon"]  # Update to match DATABASE_NAME in load_data.py

product_collection = database.get_collection("amazon-sales")
print(product_collection)
user_collection = database.get_collection("users")
review_collection = database.get_collection("reviews")

def get_database():
    return client