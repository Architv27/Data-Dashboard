// src/types/SentimentWordCloudResponse.ts

export interface WordCloudData {
    text: string;
    value: number;
  }
  
  export interface SentimentWordCloudResponse {
    positive: WordCloudData[];
    negative: WordCloudData[];
  }
  