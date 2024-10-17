# app/routers/analytics.py

from fastapi import APIRouter, HTTPException, Query, Body, Path
from app.database import product_collection  # No separate review_collection
import pandas as pd
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import accuracy_score, classification_report
import re
from typing import Optional, Union, List
from collections import Counter, defaultdict
import logging
import math
import random  # Don't forget to import random
from app.models import Review  # Ensure you import the Review model

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

@router.get("/summary")
async def get_summary():
    """
    Returns comprehensive analytics data for the dashboard.
    """
    try:
        # Fetch all products from the database
        products = await product_collection.find().to_list(length=None)

        total_products = len(products)
        total_sales = 0
        total_revenue = 0
        total_profit = 0
        category_stats = defaultdict(lambda: {
            'total_products': 0,
            'total_discount': 0,
            'product_count': 0,
            'total_sales': 0,
            'total_revenue': 0,
            'total_profit': 0
        })
        top_selling_products = []
        low_stock_products = []
        rating_stats = []
        
        for product in products:
            # Clean and extract necessary fields
            category = product.get('category', 'Unknown').split('|')[0].strip()
            actual_price = clean_number(product.get('actual_price'))
            discounted_price = clean_number(product.get('discounted_price'))
            discount_percentage = clean_number(product.get('discount_percentage'))
            rating = product.get('rating', 0)
            rating_count = clean_number(product.get('rating_count'))
            inventory = product.get('inventory', 100)  # Assuming default inventory
            cost_price = product.get('cost_price', actual_price * 0.7)  # Assuming cost price is 70% of actual price

            # Update category stats
            category_stats[category]['total_products'] += 1
            if discount_percentage is not None:
                category_stats[category]['total_discount'] += discount_percentage
                category_stats[category]['product_count'] += 1

            # Calculate total sales and revenue
            if discounted_price is not None and rating_count is not None:
                sales = discounted_price * rating_count
                revenue = sales
                profit = (discounted_price - cost_price) * rating_count
                total_sales += sales
                total_revenue += revenue
                total_profit += profit
                category_stats[category]['total_sales'] += sales
                category_stats[category]['total_revenue'] += revenue
                category_stats[category]['total_profit'] += profit

                # Add to top selling products list
                top_selling_products.append({
                    'product_id': product.get('product_id'),
                    'product_name': product.get('product_name'),
                    'sales': sales
                })

            # Add to rating stats
            rating_stats.append({
                'product_id': product.get('product_id'),
                'product_name': product.get('product_name'),
                'rating': rating,
                'rating_count': rating_count
            })

            # Check for low stock
            if inventory < 10:
                low_stock_products.append({
                    'product_id': product.get('product_id'),
                    'product_name': product.get('product_name'),
                    'inventory': inventory
                })

        # Calculate average discount per category
        for category, stats in category_stats.items():
            if stats['product_count'] > 0:
                stats['average_discount'] = stats['total_discount'] / stats['product_count']
            else:
                stats['average_discount'] = 0
            # Remove unnecessary fields
            del stats['total_discount']
            del stats['product_count']

        # Get top 5 selling products
        top_selling_products = sorted(top_selling_products, key=lambda x: x['sales'], reverse=True)[:5]

        summary = {
            'total_products': total_products,
            'total_sales': total_sales,
            'total_revenue': total_revenue,
            'total_profit': total_profit,
            'category_stats': dict(category_stats),
            'top_selling_products': top_selling_products,
            'low_stock_products': low_stock_products,
            'rating_stats': rating_stats
        }

        return summary

    except Exception as e:
        logger.error(f"Error fetching summary analytics: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

def extract_reviews_from_product(product: dict) -> List[dict]:
    """
    Extracts individual reviews from a product document.
    """
    user_ids = product.get("user_id", "").split(",")
    user_names = product.get("user_name", "").split(",")
    review_ids = product.get("review_id", "").split(",")
    review_titles = product.get("review_title", "").split(",")
    review_contents = product.get("review_content", "").split(",")
    ratings = [product.get("rating")] * len(review_ids)  # Use product rating for all reviews
    review_dates = [product.get("review_date", "")] * len(review_ids)  # If available
    product_name = product.get("product_name", "Unknown")
    product_id = product.get("product_id", "")

    # Handle 'helpful_count'
    if "helpful_count" in product and product["helpful_count"]:
        helpful_counts = product.get("helpful_count", "").split(",")
    else:
        helpful_counts = ["0"] * len(review_ids)  # Default to 0 if not present

    # Ensure all lists are of the same length
    num_reviews = min(
        len(user_ids),
        len(user_names),
        len(review_ids),
        len(review_titles),
        len(review_contents),
        len(ratings),
        len(helpful_counts),
    )

    reviews = []
    for i in range(num_reviews):
        rating = safe_float_conversion(ratings[i])
        helpful_count = int(helpful_counts[i]) if helpful_counts[i].isdigit() else 0
        review = {
            "review_id": review_ids[i].strip(),
            "product_id": product_id.strip(),
            "product_name": product_name.strip(),
            "user_id": user_ids[i].strip(),
            "user_name": user_names[i].strip(),
            "review_title": review_titles[i].strip(),
            "review_content": review_contents[i].strip(),
            "rating": rating,
            "review_date": review_dates[i],  # Adjust if you have actual review dates
            "helpful_count": helpful_count,
        }
        reviews.append(review)

    return reviews

@router.post("/reviews/{review_id}/helpful")
async def update_helpful_count(review_id: str = Path(...), change: int = Body(...)):
    """
    Updates the helpful count for a review.
    """
    try:
        # Find the product containing the review
        product = await product_collection.find_one({
            "review_id": {"$regex": f"\\b{re.escape(review_id)}\\b"}
        })

        if not product:
            raise HTTPException(status_code=404, detail="Review not found")

        # Extract the existing helpful counts
        review_ids = product.get("review_id", "").split(",")
        helpful_counts_str = product.get("helpful_count", "")
        if helpful_counts_str:
            helpful_counts = helpful_counts_str.split(",")
        else:
            helpful_counts = ["0"] * len(review_ids)

        # Find the index of the review
        try:
            index = review_ids.index(review_id)
        except ValueError:
            raise HTTPException(status_code=404, detail="Review not found")

        # Update the helpful_count
        current_count = int(helpful_counts[index]) if helpful_counts[index].isdigit() else 0
        new_count = max(0, current_count + change)  # Ensure count doesn't go negative
        helpful_counts[index] = str(new_count)

        # Update the 'helpful_count' field in the product document
        updated_helpful_counts_str = ",".join(helpful_counts)
        result = await product_collection.update_one(
            {"_id": product["_id"]},
            {"$set": {"helpful_count": updated_helpful_counts_str}}
        )

        if result.modified_count == 1:
            return {"message": "Helpful count updated successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to update helpful count")

    except Exception as e:
        logger.error(f"Error updating helpful count: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.get("/reviews", response_model=List[Review])
async def get_reviews(
    min_rating: Optional[float] = Query(None, ge=0.0, le=5.0, description="Minimum rating"),
    max_rating: Optional[float] = Query(None, ge=0.0, le=5.0, description="Maximum rating"),
    limit: Optional[int] = Query(100, ge=1, description="Number of reviews to return")
):
    """
    Returns reviews, optionally filtered by rating.
    """
    try:
        # Fetch products that have reviews
        products_with_reviews = await product_collection.find({
            "review_id": {"$exists": True, "$ne": ""}
        }).to_list(length=None)

        all_reviews = []

        # Extract reviews from each product
        for product in products_with_reviews:
            product_reviews = extract_reviews_from_product(product)
            all_reviews.extend(product_reviews)

        # If no reviews found, return an empty list
        if not all_reviews:
            return []

        # Convert to DataFrame
        df = pd.DataFrame(all_reviews)

        # Clean and convert 'rating' to float
        df['rating'] = df['rating'].apply(safe_float_conversion)

        # Drop rows with missing 'rating'
        df = df.dropna(subset=['rating'])

        # Apply rating filters
        if min_rating is not None:
            df = df[df['rating'] >= min_rating]
        if max_rating is not None:
            df = df[df['rating'] <= max_rating]

        # Shuffle the DataFrame
        df = df.sample(frac=1).reset_index(drop=True)

        # Limit the number of reviews returned
        df = df.head(limit)

        # Convert DataFrame back to list of dictionaries
        reviews = df.to_dict(orient='records')

        # Convert to list of Review models
        reviews = [Review(**review) for review in reviews]

        return reviews

    except Exception as e:
        logger.error(f"Error fetching reviews: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
        
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
            reviews = extract_reviews_from_product(product)
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
    Retrieves the distribution of sentiments across main categories and subcategories.
    Includes average rating per category.

    Returns:
        list of dict: Each dict contains main_category, subcategory, sentiment counts, percentages, and average_rating.
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

    # Assign sentiment based on updated thresholds
    df['sentiment'] = df['rating_numeric'].apply(
        lambda x: 'positive' if x >= 4.0 else ('neutral' if x > 3.3 else 'negative')
    )

    # Extract main category and subcategory
    df['categories'] = df['category'].apply(
        lambda x: x.split('|') if isinstance(x, str) else ['Unknown']
    )
    df['main_category'] = df['categories'].apply(lambda x: x[0].strip() if len(x) > 0 else 'Unknown')
    df['subcategory'] = df['categories'].apply(lambda x: x[1].strip() if len(x) > 1 else 'Unknown')

    # Group by main_category, subcategory, and sentiment
    sentiment_counts = df.groupby(['main_category', 'subcategory', 'sentiment']).size().reset_index(name='count')

    # Pivot the data to have sentiments as columns
    sentiment_pivot = sentiment_counts.pivot_table(
        index=['main_category', 'subcategory'],
        columns='sentiment',
        values='count',
        fill_value=0
    )

    # Ensure all sentiment columns are present
    for sentiment in ['positive', 'neutral', 'negative']:
        if sentiment not in sentiment_pivot.columns:
            sentiment_pivot[sentiment] = 0

    # Calculate total counts per category
    sentiment_pivot['total'] = sentiment_pivot[['positive', 'neutral', 'negative']].sum(axis=1)

    # Calculate percentages
    for sentiment in ['positive', 'neutral', 'negative']:
        sentiment_pivot[f'{sentiment}_percentage'] = (
            sentiment_pivot[sentiment] / sentiment_pivot['total'] * 100
        )

    # Calculate average rating per category
    avg_rating = df.groupby(['main_category', 'subcategory'])['rating_numeric'].mean()

    # Combine data
    sentiment_pivot = sentiment_pivot.merge(avg_rating, left_index=True, right_index=True)

    # Rename 'rating_numeric' to 'average_rating'
    sentiment_pivot = sentiment_pivot.rename(columns={'rating_numeric': 'average_rating'})

    # Reset index to get 'main_category' and 'subcategory' as columns
    sentiment_pivot = sentiment_pivot.reset_index()

    # Convert to dict
    result = sentiment_pivot.to_dict(orient='records')

    return result



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
            reviews = extract_reviews_from_product(product)
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
    - Calculates average and median discount percentage per price range.
    - Counts the number of products per price range.
    - Calculates the correlation between actual price and discount percentage.
    - Provides overall discount statistics.

    Returns:
        dict: Contains per_price_range_stats and overall_stats.
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
    bins = [0, 5000, 10000, 15000, 20000, 25000, 30000, df['actual_price'].max()]
    labels = ['0-5k', '5k-10k', '10k-15k', '15k-20k', '20k-25k', '25k-30k', f'30k-{int(df["actual_price"].max())}k']
    df['price_range'] = pd.cut(df['actual_price'], bins=bins, labels=labels, include_lowest=True)

    # Calculate statistics per price range
    try:
        price_discount_stats = df.groupby('price_range', observed=True).agg({
            'discount_percentage': ['mean', 'median', 'std'],
            'actual_price': 'count'
        }).reset_index()
        price_discount_stats.columns = ['price_range', 'average_discount_percentage', 'median_discount_percentage', 'std_discount_percentage', 'product_count']
    except Exception as e:
        logger.error(f"Error during groupby operation in price_discount_analysis: {e}")
        raise HTTPException(status_code=500, detail="Failed to perform groupby operation.")

    # Calculate overall discount statistics
    overall_stats = {
        'average_discount_percentage': df['discount_percentage'].mean(),
        'median_discount_percentage': df['discount_percentage'].median(),
        'min_discount_percentage': df['discount_percentage'].min(),
        'max_discount_percentage': df['discount_percentage'].max(),
        'std_discount_percentage': df['discount_percentage'].std(),
        'total_products': len(df)
    }

    # Calculate correlation between actual price and discount percentage
    correlation = df[['actual_price', 'discount_percentage']].corr().to_dict()

    return {
        "per_price_range_stats": price_discount_stats.to_dict(orient='records'),
        "overall_stats": overall_stats,
        "price_discount_correlation": correlation
    }


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
    max_rating: Optional[float] = Query(None, ge=0.0, le=5.0, description="Maximum rating"),
    sort_by: Optional[str] = Query('popularity_score', description="Sort by 'popularity_score', 'total_sales', or 'profit'"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Number of products per page")
):
    """
    Determines the top products based on various metrics.
    Supports filtering by categories and rating range, sorting, and pagination.

    Args:
        categories (List[str], optional): List of categories to filter products.
        min_rating (float, optional): Minimum rating to filter products.
        max_rating (float, optional): Maximum rating to filter products.
        sort_by (str, optional): Metric to sort by ('popularity_score', 'total_sales', 'profit').
        page (int, optional): Page number for pagination.
        page_size (int, optional): Number of products per page.

    Returns:
        dict: Contains total_count and list of products with detailed metrics.
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

    logger.info(f"Query: {query}")

    # Fetch filtered products from MongoDB
    products = []
    try:
        async for product in product_collection.find(query):
            # Clean numeric fields
            product['rating'] = safe_float_conversion(product.get('rating'))
            product['rating_count'] = clean_number(product.get('rating_count'))
            product['discount_percentage'] = clean_number(product.get('discount_percentage'))
            product['actual_price'] = clean_number(product.get('actual_price'))
            product['discounted_price'] = clean_number(product.get('discounted_price'))
            # Estimate sales and profit
            if product['discounted_price'] is not None and product['rating_count'] is not None:
                product['total_sales'] = product['discounted_price'] * product['rating_count']
                # Assume cost price is 70% of actual price
                cost_price = product['actual_price'] * 0.7 if product['actual_price'] else 0
                product['profit'] = (product['discounted_price'] - cost_price) * product['rating_count']
            else:
                product['total_sales'] = 0
                product['profit'] = 0
            products.append(product)
        logger.info(f"Fetched {len(products)} products from MongoDB.")
    except Exception as e:
        logger.error(f"Error fetching products from MongoDB: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch products from the database.")

    # Filter products by rating range after converting 'rating' to float
    if min_rating is not None:
        products = [p for p in products if p['rating'] is not None and p['rating'] >= min_rating]
    if max_rating is not None:
        products = [p for p in products if p['rating'] is not None and p['rating'] <= max_rating]

    logger.info(f"Products after rating filter: {len(products)}")

    # Convert to DataFrame
    df = pd.DataFrame(products)
    logger.info(f"DataFrame created with {len(df)} records.")

    # Check required columns
    required_columns = ['product_name', 'rating', 'rating_count', 'total_sales', 'profit']
    for col in required_columns:
        if col not in df.columns:
            raise HTTPException(status_code=500, detail=f"'{col}' data not found.")

    # Drop rows with missing required data
    df = df.dropna(subset=required_columns)
    logger.info(f"DataFrame after dropping NaNs: {len(df)} records.")

    if df.empty:
        logger.info("No valid data available after applying filters.")
        return {"total_count": 0, "products": []}

    # Define popularity based on rating and rating_count
    df['popularity_score'] = df['rating'] * df['rating_count']

    # Sort products based on sort_by parameter
    if sort_by not in ['popularity_score', 'total_sales', 'profit']:
        sort_by = 'popularity_score'
    df = df.sort_values(by=sort_by, ascending=False)

    # Pagination
    total_count = len(df)
    start = (page - 1) * page_size
    end = start + page_size
    df = df.iloc[start:end]

    # Select relevant fields
    top_products = df[[
        'product_id',
        'product_name',
        'category',
        'actual_price',
        'discounted_price',
        'discount_percentage',
        'rating',
        'rating_count',
        'popularity_score',
        'total_sales',
        'profit'
    ]]

    logger.info("Returning top products with additional metrics.")
    return {"total_count": total_count, "products": top_products.to_dict(orient='records')}
