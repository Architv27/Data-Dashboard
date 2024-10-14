// src/types/PriceTrendResponse.ts

export interface TrendData {
    actual_price: number;
    predicted_discounted_price: number;
  }
  
  export interface CorrelationMatrix {
    actual_price: Record<string, number>;
    discounted_price: Record<string, number>;
    discount_percentage: Record<string, number>;
    rating: Record<string, number>;
    rating_count: Record<string, number>;
  }
  
  export interface PriceTrendResponse {
    future_trends: TrendData[];
    correlation_matrix: CorrelationMatrix;
  }
  