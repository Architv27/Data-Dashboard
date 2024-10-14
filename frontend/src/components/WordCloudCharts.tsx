// src/components/WordCloudChart.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactWordcloud from 'react-wordcloud';
import { Spin, Alert } from 'antd';
import { SentimentWordCloudResponse, WordCloudData } from '../Types/SentimentWordCloudResponse'; // Corrected casing

const WordCloudChart: React.FC = () => {
  const [positiveWords, setPositiveWords] = useState<WordCloudData[]>([]);
  const [negativeWords, setNegativeWords] = useState<WordCloudData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get<SentimentWordCloudResponse>('http://localhost:8000/analytics/sentiment_wordcloud')
      .then((response) => {
        setPositiveWords(response.data.positive);
        setNegativeWords(response.data.negative);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError('Failed to fetch word cloud data.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" tip="Loading word clouds..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        height: 500,
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px',
      }}
    >
      <div style={{ width: '48%', height: '100%' }}>
        <h3>Positive Reviews Word Cloud</h3>
        <ReactWordcloud
          words={positiveWords}
          options={{
            rotations: 2,
            rotationAngles: [-90, 0],
            fontSizes: [20, 60],
          }}
        />
      </div>
      <div style={{ width: '48%', height: '100%' }}>
        <h3>Negative Reviews Word Cloud</h3>
        <ReactWordcloud
          words={negativeWords}
          options={{
            rotations: 2,
            rotationAngles: [-90, 0],
            fontSizes: [20, 60],
          }}
        />
      </div>
    </div>
  );
};

export default WordCloudChart;
