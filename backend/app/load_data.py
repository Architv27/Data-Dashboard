# backend/load_data.py

import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

# MongoDB connection details
MONGO_DETAILS = "mongodb://localhost:27017"
DATABASE_NAME = "amazon"
COLLECTION_NAME = "amazon-sales"

async def load_data():
    # Read the CSV file
    df = pd.read_csv('./amazon.csv')

    # Convert DataFrame to list of dictionaries
    data = df.to_dict(orient='records')

    # Create a Motor client
    client = AsyncIOMotorClient(MONGO_DETAILS)
    db = client[DATABASE_NAME]
    collection = db[COLLECTION_NAME]

    # Insert data into MongoDB
    result = await collection.insert_many(data)
    print(f"Inserted {len(result.inserted_ids)} documents.")

    # Close the connection
    client.close()

# Run the async function
if __name__ == '__main__':
    asyncio.run(load_data())
