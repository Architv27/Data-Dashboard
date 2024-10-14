// src/types/SentimentAnalysisResponse.ts

export interface ClassificationReport {
    precision: { [key: string]: number };
    recall: { [key: string]: number };
    f1_score: { [key: string]: number };
    support: { [key: string]: number };
  }
  
  export interface ExamplePrediction {
    review: string;
    predicted_sentiment: string;
  }
  
  export interface SentimentAnalysisResponse {
    accuracy: number;
    classification_report: ClassificationReport;
    example_prediction: ExamplePrediction;
    sentiment_distribution: { [key: string]: number };
  }
  