# app/routers/analytics.py

from fastapi import APIRouter, HTTPException, Query
from app.database import product_collection  # No separate review_collection
import pandas as pd
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import accuracy_score, classification_report
import re
from typing import Optional, Union, List
from collections import Counter
import logging
import math

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def clean_number(number_input: Optional[Union[str, int, float]]) -> Optional[float]:
    """
    Cleans a string representing a number by removing currency symbols, commas, and percentage signs.
    Converts the cleaned string to a float. Returns None if conversion fails or input is invalid.

    Parameters:
        number_input (Optional[Union[str, int, float]]): The input to clean and convert.

    Returns:
        Optional[float]: The cleaned float value or None.
    """
    if not number_input:
        return None

    # If the input is not a string, attempt to convert it to a string
    if not isinstance(number_input, str):
        try:
            number_str = str(number_input)
        except Exception as e:
            logger.error(f"Error converting input to string: {e}")
            return None
    else:
        number_str = number_input

    # Remove currency symbols, commas, percentage signs, and whitespace
    cleaned_str = re.sub(r'[₹%,]', '', number_str).strip()

    # Remove any remaining non-numeric characters except the decimal point
    cleaned_str = re.sub(r'[^\d\.]', '', cleaned_str)

    # If the cleaned string is empty, return None
    if not cleaned_str:
        logger.warning(f"clean_number: Cleaned string is empty after cleaning '{number_str}'. Setting to None.")
        return None

    try:
        return float(cleaned_str)
    except ValueError:
        logger.error(f"ValueError: Cannot convert '{cleaned_str}' to float.")
        return None


def safe_float_conversion(value: Optional[Union[str, int, float]]) -> Optional[float]:
    """
    Safely converts a value to float. Returns None if conversion fails.

    Parameters:
        value (Optional[Union[str, int, float]]): The value to convert.

    Returns:
        Optional[float]: The converted float value or None.
    """
    if not value:
        return None
    try:
        float_value = float(value)
        if not math.isfinite(float_value):
            logger.warning(f"safe_float_conversion: Non-finite float '{float_value}'. Setting to None.")
            return None
        return float_value
    except (ValueError, TypeError):
        logger.error(f"safe_float_conversion: Cannot convert '{value}' to float.")
        return None


def clean_text(text: str) -> str:
    """
    Cleans review text by removing special characters and digits, keeping only alphabets and spaces.
    Converts text to lowercase.

    Parameters:
        text (str): The review text to clean.

    Returns:
        str: The cleaned text.
    """
    return re.sub(r'[^a-zA-Z\s]', '', text.lower())


@router.get("/reviews")
async def extract_reviews(product: dict) -> List[dict]:
    """
    Extracts individual reviews from a product document.

    Parameters:
        product (dict): The product document containing embedded reviews.

    Returns:
        List[dict]: A list of individual review dictionaries.
    """
    user_ids = product.get("user_id", "").split(",")
    user_names = product.get("user_name", "").split(",")
    review_ids = product.get("review_id", "").split(",")
    review_titles = product.get("review_title", "").split(",")
    review_contents = product.get("review_content", "").split(",")

    # Handle 'helpful_count' if it exists; else default to 0
    if "helpful_count" in product and product["helpful_count"]:
        helpful_counts = product.get("helpful_count", "").split(",")
    else:
        helpful_counts = ["0"] * len(review_ids)  # Default to 0 if not present

    # Determine the minimum number of reviews to prevent IndexError
    num_reviews = min(len(user_ids), len(user_names), len(review_ids), len(review_titles), len(review_contents), len(helpful_counts))

    if num_reviews < len(review_ids):
        logger.warning(f"Product ID {product.get('product_id', 'Unknown')} has mismatched review counts. Expected {num_reviews}, got {len(review_ids)}.")

    reviews = []
    for i in range(num_reviews):
        try:
            review_id = review_ids[i].strip()
            product_id = product.get("product_id", "").strip()
            user_id = user_ids[i].strip()
            user_name = user_names[i].strip()
            review_title = review_titles[i].strip()
            review_content = review_contents[i].strip()
            rating = safe_float_conversion(product.get("rating", 0))
            review_date = product.get("review_date", "")  # Adjust if 'review_date' exists
            helpful_count_str = helpful_counts[i].strip() if i < len(helpful_counts) else "0"
            helpful_count = clean_number(helpful_count_str) if helpful_count_str else 0

            if rating is None:
                logger.warning(f"Product ID {product_id}, Review ID {review_id}: Invalid rating '{product.get('rating')}'. Setting to None.")
            if helpful_count is None:
                logger.warning(f"Product ID {product_id}, Review ID {review_id}: Invalid helpful_count '{helpful_count_str}'. Setting to 0.")

            review = {
                "review_id": review_id,
                "product_id": product_id,
                "user_id": user_id,
                "user_name": user_name,
                "review_title": review_title,
                "review_content": review_content,
                "rating": rating,
                "review_date": review_date.isoformat() if isinstance(review_date, pd.Timestamp) else review_date,
                "helpful_count": helpful_count if helpful_count is not None else 0
            }
            reviews.append(review)
        except Exception as e:
            logger.error(f"Error processing review index {i} for Product ID {product.get('product_id', 'Unknown')}: {e}")

    return reviews

@router.get("/sentiment_analysis")
async def sentiment_analysis():
    """
    Performs sentiment analysis on product reviews.
    - Cleans the review text.
    - Assigns sentiment labels based on ratings.
    - Trains a Logistic Regression model to classify sentiment.
    - Returns model accuracy, classification report, an example prediction, and sentiment distribution.

    Returns:
        dict: Contains accuracy, classification report, example prediction, and sentiment distribution.
    """
    all_reviews = []
    try:
        async for product in product_collection.find():
            reviews = extract_reviews(product)
            all_reviews.extend(reviews)
    except Exception as e:
        logger.error(f"Error fetching products for sentiment analysis: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch product data for sentiment analysis.")

    if not all_reviews:
        raise HTTPException(status_code=500, detail="No reviews available for sentiment analysis.")

    # Convert to DataFrame
    df = pd.DataFrame(all_reviews)

    # Drop rows with missing review content or rating
    df = df.dropna(subset=['review_content', 'rating'])

    if df.empty:
        raise HTTPException(status_code=500, detail="No valid review data available after cleaning.")

    # Clean the review content
    df['cleaned_review'] = df['review_content'].apply(clean_text)

    # Assign sentiment labels based on rating
    df['sentiment'] = df['rating'].apply(
        lambda x: 'positive' if x >= 4.0 else ('neutral' if x == 3.0 else 'negative')
    )

    # Prepare features and labels
    X = df['cleaned_review']
    y = df['sentiment']

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Vectorize text
    vectorizer = TfidfVectorizer(max_features=5000)
    X_train_vectorized = vectorizer.fit_transform(X_train)
    X_test_vectorized = vectorizer.transform(X_test)

    # Train model
    model = LogisticRegression(max_iter=1000)
    model.fit(X_train_vectorized, y_train)

    # Predictions
    y_pred = model.predict(X_test_vectorized)

    # Evaluate
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, output_dict=True)

    # Example prediction
    example_review = X_test.iloc[0]
    example_sentiment = y_pred[0]

    # Sentiment Distribution
    sentiment_distribution = df['sentiment'].value_counts().to_dict()

    return {
        "accuracy": accuracy,
        "classification_report": report,
        "example_prediction": {
            "review": example_review,
            "predicted_sentiment": example_sentiment
        },
        "sentiment_distribution": sentiment_distribution
    }


@router.get("/price_trend")
async def get_price_trend():
    """
    Analyzes pricing trends and correlations with ratings, review counts, and discounts.
    - Cleans price-related fields.
    - Trains a Linear Regression model to predict discounted_price based on actual_price.
    - Predicts discounted prices for a range of actual prices.
    - Calculates correlation matrix.

    Returns:
        dict: Contains future_trends and correlation_matrix.
    """
    products = []
    try:
        async for product in product_collection.find():
            # Clean price fields
            product['actual_price'] = clean_number(product.get('actual_price'))
            product['discounted_price'] = clean_number(product.get('discounted_price'))
            product['discount_percentage'] = clean_number(product.get('discount_percentage'))
            product['rating_count'] = clean_number(product.get('rating_count'))
            # Ensure 'rating' is a float safely
            product['rating'] = safe_float_conversion(product.get('rating'))
            products.append(product)
    except Exception as e:
        logger.error(f"Error fetching products for price trend analysis: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch product data for price trend analysis.")

    df = pd.DataFrame(products)

    # Check required columns
    required_columns = ['actual_price', 'discounted_price', 'discount_percentage', 'rating', 'rating_count']
    for col in required_columns:
        if col not in df.columns:
            raise HTTPException(status_code=500, detail=f"{col} data not found.")

    # Drop rows with missing data
    df = df.dropna(subset=required_columns)

    if df.empty:
        raise HTTPException(status_code=500, detail="No valid pricing data available.")

    # Predict discounted_price based on actual_price using Linear Regression
    X = df[['actual_price']]
    y = df['discounted_price']

    try:
        # Initialize and train the model
        model = LinearRegression()
        model.fit(X, y)
    except Exception as e:
        logger.error(f"Error training Linear Regression model: {e}")
        raise HTTPException(status_code=500, detail="Failed to train Linear Regression model.")

    try:
        # Predict discounted prices for a range of actual prices
        actual_min = int(df['actual_price'].min())
        actual_max = int(df['actual_price'].max())
        step = 1000  # Adjust the step as needed

        future_actual_prices = pd.DataFrame({
            'actual_price': range(actual_min, actual_max + step, step)
        })
        predicted_discounted_prices = model.predict(future_actual_prices)

        future_trends = future_actual_prices.copy()
        future_trends['predicted_discounted_price'] = predicted_discounted_prices
    except Exception as e:
        logger.error(f"Error predicting future discounted prices: {e}")
        raise HTTPException(status_code=500, detail="Failed to predict future discounted prices.")

    # Correlation Matrix
    try:
        correlation_matrix = df[['actual_price', 'discounted_price', 'discount_percentage', 'rating', 'rating_count']].corr().to_dict()
    except Exception as e:
        logger.error(f"Error calculating correlation matrix: {e}")
        raise HTTPException(status_code=500, detail="Failed to calculate correlation matrix.")

    return {
        "future_trends": future_trends.to_dict(orient='records'),
        "correlation_matrix": correlation_matrix
    }


@router.get("/rating_discount_correlation")
async def rating_discount_correlation():
    """
    Calculates the correlation between discount_percentage and rating.

    Returns:
        dict: Correlation matrix between discount_percentage and rating.
    """
    products = []
    try:
        async for product in product_collection.find():
            # Clean numeric fields
            product['discount_percentage'] = clean_number(product.get('discount_percentage'))
            product['rating'] = safe_float_conversion(product.get('rating'))
            products.append(product)
    except Exception as e:
        logger.error(f"Error fetching products for correlation analysis: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch product data for correlation analysis.")

    df = pd.DataFrame(products)

    required_columns = ['discount_percentage', 'rating']
    for col in required_columns:
        if col not in df.columns:
            raise HTTPException(status_code=500, detail=f"'{col}' data not found.")

    df = df.dropna(subset=required_columns)

    if df.empty:
        raise HTTPException(status_code=500, detail="No valid data available.")

    try:
        correlation = df[['discount_percentage', 'rating']].corr().to_dict()
    except Exception as e:
        logger.error(f"Error calculating correlation matrix: {e}")
        raise HTTPException(status_code=500, detail="Failed to calculate correlation matrix.")

    return correlation


@router.get("/sentiment_distribution")
async def sentiment_distribution():
    """
    Retrieves the distribution of sentiments across main categories.

    Returns:
        list of dict: Each dict contains main_category, sentiment, and count.
    """
    products = []
    try:
        async for product in product_collection.find():
            products.append(product)
    except Exception as e:
        logger.error(f"Error fetching products for sentiment distribution: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch product data for sentiment distribution.")

    df = pd.DataFrame(products)

    required_columns = ['category', 'rating']
    for col in required_columns:
        if col not in df.columns:
            raise HTTPException(status_code=500, detail=f"'{col}' data not found.")

    # Drop rows with missing 'category' or 'rating'
    df = df.dropna(subset=required_columns)

    if df.empty:
        raise HTTPException(status_code=500, detail="No valid data available after dropping missing values.")

    # Convert 'rating' to numeric, coercing errors to NaN
    df['rating_numeric'] = pd.to_numeric(df['rating'], errors='coerce')

    # Drop rows where 'rating_numeric' conversion failed
    invalid_ratings = df['rating_numeric'].isna().sum()
    if invalid_ratings > 0:
        logger.warning(f"Warning: {invalid_ratings} records have invalid 'rating' values and will be excluded.")
        df = df.dropna(subset=['rating_numeric'])

    if df.empty:
        raise HTTPException(status_code=500, detail="No valid numeric 'rating' data available.")

    # Assign sentiment based on 'rating_numeric'
    df['sentiment'] = df['rating_numeric'].apply(
        lambda x: 'positive' if x >= 4.0 else ('neutral' if x == 3.0 else 'negative')
    )

    # Extract main category (assuming 'category' is a string containing categories separated by '|')
    df['main_category'] = df['category'].apply(
        lambda x: x.split('|')[0].strip() if isinstance(x, str) and '|' in x else (x.strip() if isinstance(x, str) else 'Unknown')
    )

    # Group by main_category and sentiment
    distribution = df.groupby(['main_category', 'sentiment']).size().reset_index(name='count')

    # Convert the DataFrame to a list of dictionaries
    return distribution.to_dict(orient='records')


@router.get("/sentiment_wordcloud")
async def sentiment_wordcloud():
    """
    Generates word frequency data for positive and negative reviews to create word clouds.

    Returns:
        dict: Contains lists of words and their frequencies for positive and negative sentiments.
    """
    all_reviews = []
    try:
        async for product in product_collection.find():
            reviews = extract_reviews(product)
            all_reviews.extend(reviews)
    except Exception as e:
        logger.error(f"Error fetching products for wordcloud: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch product data for wordcloud.")

    if not all_reviews:
        raise HTTPException(status_code=500, detail="No reviews available for wordcloud generation.")

    df = pd.DataFrame(all_reviews)

    required_columns = ['review_content', 'rating']
    for col in required_columns:
        if col not in df.columns:
            raise HTTPException(status_code=500, detail=f"{col} data not found.")

    df = df.dropna(subset=['review_content', 'rating'])

    if df.empty:
        raise HTTPException(status_code=500, detail="No valid review data available after cleaning.")

    # Assign sentiment
    df['sentiment'] = df['rating'].apply(
        lambda x: 'positive' if float(x) >= 4.0 else ('neutral' if float(x) == 3.0 else 'negative')
    )

    # Filter positive and negative reviews
    positive_reviews = df[df['sentiment'] == 'positive']['review_content'].apply(clean_text)
    negative_reviews = df[df['sentiment'] == 'negative']['review_content'].apply(clean_text)

    # Tokenize and count words
    positive_words = ' '.join(positive_reviews).split()
    negative_words = ' '.join(negative_reviews).split()

    positive_counter = Counter(positive_words)
    negative_counter = Counter(negative_words)

    # Get top 100 words
    positive_top = positive_counter.most_common(100)
    negative_top = negative_counter.most_common(100)

    # Format for wordcloud
    positive_words_wc = [{'text': word, 'value': count} for word, count in positive_top]
    negative_words_wc = [{'text': word, 'value': count} for word, count in negative_top]

    return {
        "positive": positive_words_wc,
        "negative": negative_words_wc
    }


@router.get("/price_discount_analysis")
async def price_discount_analysis():
    """
    Analyzes how discounts are applied to products in different price ranges.
    Calculates the average discount percentage for predefined actual price ranges.

    Returns:
        list of dict: Each dict contains price_range and average_discount_percentage.
    """
    products = []
    try:
        async for product in product_collection.find():
            # Clean numeric fields
            actual_price = clean_number(product.get('actual_price'))
            discount_percentage = clean_number(product.get('discount_percentage'))
            if actual_price is not None and discount_percentage is not None:
                products.append({
                    'actual_price': actual_price,
                    'discount_percentage': discount_percentage
                })
    except Exception as e:
        logger.error(f"Error fetching products for price discount analysis: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch product data for price discount analysis.")

    df = pd.DataFrame(products)

    required_columns = ['actual_price', 'discount_percentage']
    for col in required_columns:
        if col not in df.columns:
            raise HTTPException(status_code=500, detail=f"{col} data not found.")

    # Drop rows with missing data
    df = df.dropna(subset=required_columns)

    if df.empty:
        raise HTTPException(status_code=500, detail="No valid data available.")

    # Define price ranges
    bins = [0, 5000, 10000, 15000, 20000, 25000, 30000, 35000]
    labels = ['0-5k', '5k-10k', '10k-15k', '15k-20k', '20k-25k', '25k-30k', '30k-35k']
    df['price_range'] = pd.cut(df['actual_price'], bins=bins, labels=labels, include_lowest=True)

    # Calculate average discount percentage per price range with observed=True to suppress FutureWarning
    try:
        price_discount = df.groupby('price_range', observed=True)['discount_percentage'].mean().reset_index()
    except Exception as e:
        logger.error(f"Error during groupby operation in price_discount_analysis: {e}")
        raise HTTPException(status_code=500, detail="Failed to perform groupby operation.")

    # Rename columns for clarity
    price_discount = price_discount.rename(columns={
        'discount_percentage': 'average_discount_percentage'
    })

    return price_discount.to_dict(orient='records')


@router.get("/categories")
async def get_categories():
    """
    Retrieves all distinct product categories.

    Returns:
        list of str: List containing unique product categories.
    """
    try:
        categories = await product_collection.distinct("category")
        # Optionally, clean or process category names here
        return categories
    except Exception as e:
        logger.error(f"Error fetching categories: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch categories.")
    

@router.get("/top_products")
async def top_products(
    categories: Optional[List[str]] = Query(None, description="Filter by product categories"),
    min_rating: Optional[float] = Query(None, ge=0.0, le=5.0, description="Minimum rating"),
    max_rating: Optional[float] = Query(None, ge=0.0, le=5.0, description="Maximum rating")
):
    """
    Determines the top 10 products based on popularity, defined by a combination of rating and review count.
    Supports filtering by categories and rating range.

    Args:
        categories (List[str], optional): List of categories to filter products.
        min_rating (float, optional): Minimum rating to filter products.
        max_rating (float, optional): Maximum rating to filter products.

    Returns:
        list of dict: Each dict contains product_name, rating, rating_count, and popularity_score.
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

    # Fetch filtered products from MongoDB
    products = []
    try:
        async for product in product_collection.find(query):
            # Clean numeric fields
            product['rating'] = safe_float_conversion(product.get('rating'))
            product['rating_count'] = clean_number(product.get('rating_count'))
            products.append(product)
        logger.info(f"Fetched {len(products)} products from MongoDB.")
    except Exception as e:
        logger.error(f"Error fetching products from MongoDB: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch products from the database.")

    # Convert to DataFrame
    df = pd.DataFrame(products)
    logger.info(f"DataFrame created with {len(df)} records.")

    # Check required columns
    required_columns = ['product_name', 'rating', 'rating_count']
    for col in required_columns:
        if col not in df.columns:
            raise HTTPException(status_code=500, detail=f"'{col}' data not found.")

    # Drop rows with missing product_name, rating, or rating_count
    df = df.dropna(subset=required_columns)
    logger.info(f"DataFrame after dropping NaNs: {len(df)} records.")

    if df.empty:
        logger.info("No valid data available after applying filters.")
        return []  # Return empty list instead of raising an error

    # Define popularity based on rating and rating_count
    df['popularity_score'] = df['rating'] * df['rating_count']

    # Sort products by popularity_score in descending order and select top 10
    top_products_df = df.sort_values(by='popularity_score', ascending=False).head(10)
    logger.info(f"Selected top {len(top_products_df)} products based on popularity.")

    # Select relevant fields
    top_products = top_products_df[['product_name', 'rating', 'rating_count', 'popularity_score']]

    logger.info("Returning top products.")
    return top_products.to_dict(orient='records')
