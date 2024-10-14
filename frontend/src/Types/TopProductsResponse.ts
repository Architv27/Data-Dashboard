// src/types/TopProductsResponse.ts

export interface TopProduct {
    product_name: string;
    rating: number;
    rating_count: number;
    popularity_score: number;
  }
  
  export type TopProductsResponse = TopProduct[];