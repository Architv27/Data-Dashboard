// src/types/PriceDiscountAnalysisResponse.ts

export interface PriceDiscountAnalysisItem {
    price_range: string;
    average_discount_percentage: number;
  }
  
  export type PriceDiscountAnalysisResponse = PriceDiscountAnalysisItem[];
  