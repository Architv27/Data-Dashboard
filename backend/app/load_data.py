import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import math
import logging
import re  # For regular expressions

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB connection details
MONGO_DETAILS = "mongodb://localhost:27017"
DATABASE_NAME = "amazon"
COLLECTION_NAME = "amazon-sales"

def clean_rating_count(value):
    if pd.isnull(value):
        return None
    if isinstance(value, float):
        if math.isnan(value):
            return None
        else:
            return int(value)
    if isinstance(value, str):
        # Remove commas and any surrounding whitespace
        value = value.replace(',', '').strip()
        if value == '':
            return None
        try:
            return int(value)
        except ValueError:
            logger.warning(f"Cannot convert '{value}' to int. Setting to None.")
            return None
    if isinstance(value, int):
        return value
    logger.warning(f"Unexpected type for 'rating_count': {type(value)}. Setting to None.")
    return None

def clean_rating(value):
    if pd.isnull(value):
        return None
    if isinstance(value, str):
        value = value.strip()
        if value == '|':
            logger.warning("Encountered invalid 'rating' value '|'. Setting to None.")
            return None
        try:
            return float(value)
        except ValueError:
            logger.warning(f"Cannot convert '{value}' to float. Setting to None.")
            return None
    if isinstance(value, (float, int)):
        return float(value) if math.isfinite(value) else None
    logger.warning(f"Unexpected type for 'rating': {type(value)}. Setting to None.")
    return None

def clean_price(value):
    if pd.isnull(value):
        return None
    if isinstance(value, str):
        # Remove currency symbols and commas
        value = re.sub(r'[^\d.]+', '', value).strip()
    try:
        return float(value)
    except (ValueError, TypeError):
        logger.warning(f"Cannot convert '{value}' to float. Setting to None.")
        return None

async def load_data():
    # Read the CSV file
    try:
        df = pd.read_csv('./amazon.csv')
        logger.info("CSV file loaded successfully.")
    except FileNotFoundError:
        logger.error("CSV file not found.")
        return
    except Exception as e:
        logger.error(f"Error reading CSV file: {e}")
        return

    # Clean 'rating_count'
    df['rating_count'] = df['rating_count'].apply(clean_rating_count)

    # Clean 'rating'
    df['rating'] = df['rating'].apply(clean_rating)

    # Clean price-related fields
    df['discounted_price'] = df['discounted_price'].apply(clean_price)
    df['actual_price'] = df['actual_price'].apply(clean_price)
    df['discount_percentage'] = df['discount_percentage'].apply(clean_price)

    # Additional cleaning if needed
    # For example, handle 'about_product' or other string fields

    # Convert DataFrame to list of dictionaries
    data = df.to_dict(orient='records')
    logger.info(f"Total records to insert: {len(data)}")

    # Create a Motor client
    client = AsyncIOMotorClient(MONGO_DETAILS)
    db = client[DATABASE_NAME]
    collection = db[COLLECTION_NAME]

    # Insert data into MongoDB
    try:
        if len(data) > 0:
            result = await collection.insert_many(data)
            logger.info(f"Inserted {len(result.inserted_ids)} documents.")
        else:
            logger.info("No data to insert.")
    except Exception as e:
        logger.error(f"Error inserting documents: {e}")
    finally:
        # Close the connection
        client.close()

# Run the async function
if __name__ == '__main__':
    asyncio.run(load_data())
