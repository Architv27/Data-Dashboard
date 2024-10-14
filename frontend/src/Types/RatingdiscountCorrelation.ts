// src/types/RatingDiscountCorrelation.ts

  export interface RatingDiscountCorrelationResponse {
    actual_price: { [key: string]: number };
    discounted_price: { [key: string]: number };
    discount_percentage: { [key: string]: number };
    rating: { [key: string]: number };
    rating_count: { [key: string]: number };
  }
  