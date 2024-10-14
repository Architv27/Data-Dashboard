// src/types/SentimentDistributionResponse.ts

export interface SentimentDistributionItem {
    main_category: string;
    sentiment: string;
    count: number;
  }
  
  export type SentimentDistributionResponse = SentimentDistributionItem[];
