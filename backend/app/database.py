# app/database.py

import motor.motor_asyncio

# Updated connection string for MongoDB Atlas
MONGO_DETAILS = "mongodb+srv://architsfu:Architdisco%4027@amazon.xpmdv.mongodb.net/amazon?retryWrites=true&w=majority"

# Initialize the MongoDB client
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)

# Access the 'amazon' database
database = client["amazon"]

# Define your collections
product_collection = database.get_collection("amazon-sales")
user_collection = database.get_collection("users")
review_collection = database.get_collection("reviews")

def get_database():
    return database
