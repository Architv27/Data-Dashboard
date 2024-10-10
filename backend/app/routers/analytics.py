# app/routers/analytics.py

from fastapi import APIRouter, HTTPException
from app.database import product_collection
import pandas as pd
from sklearn.linear_model import LinearRegression

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
)

def clean_price(price_str):
    if price_str is None:
        return None
    # Remove currency symbols, commas, and percentage signs
    cleaned_str = price_str.replace('₹', '').replace(',', '').replace('%', '').strip()
    try:
        return float(cleaned_str)
    except ValueError:
        return None

@router.get("/price_trend")
async def get_price_trend():
    products = []
    async for product in product_collection.find():
        # Clean the price fields before adding to the list
        product['actual_price'] = clean_price(product.get('actual_price'))
        product['discounted_price'] = clean_price(product.get('discounted_price'))
        products.append(product)

    df = pd.DataFrame(products)
    if 'actual_price' not in df.columns or 'discounted_price' not in df.columns:
        raise HTTPException(status_code=500, detail="Price data not found.")

    # Drop rows with missing or invalid data
    df = df.dropna(subset=['actual_price', 'discounted_price'])

    if df.empty:
        raise HTTPException(status_code=500, detail="No valid price data available.")

    X = df[['actual_price']]
    y = df['discounted_price']

    model = LinearRegression()
    model.fit(X, y)

    # Predict discounted price for a range of actual prices
    future_actual_prices = pd.DataFrame({'actual_price': range(1000, 20000, 1000)})
    predicted_discounted_prices = model.predict(future_actual_prices)

    future_trends = future_actual_prices.copy()
    future_trends['predicted_discounted_price'] = predicted_discounted_prices

    return future_trends.to_dict(orient='records')
