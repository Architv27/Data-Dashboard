// src/components/SentimentDistributionChart.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Spin } from 'antd';

interface SentimentData {
  main_category: string;
  positive: number;
  neutral: number;
  negative: number;
}

const SentimentDistributionChart: React.FC = () => {
  const [data, setData] = useState<SentimentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get<SentimentData[]>('http://localhost:8000/analytics/sentiment_distribution')
      .then((response) => {
        // Transform data to have separate keys for each sentiment
        const transformedData = response.data.reduce((acc: any, item: any) => {
          const category = item.main_category;
          const sentiment = item.sentiment;
          const count = item.count;

          if (!acc[category]) {
            acc[category] = { main_category: category, positive: 0, neutral: 0, negative: 0 };
          }

          acc[category][sentiment] += count;

          return acc;
        }, {});

        setData(Object.values(transformedData));
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError('Failed to fetch sentiment distribution.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" tip="Loading sentiment distribution..." />
      </div>
    );
  }

  if (error) {
    return <div style={{ textAlign: 'center', color: 'red' }}>{error}</div>;
  }

  return (
    <div
      style={{
        width: '100%',
        height: 500,
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px',
      }}
    >
      <h3>Sentiment Distribution Across Categories</h3>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="main_category" type="category" />
          <Tooltip />
          <Legend />
          <Bar dataKey="positive" stackId="a" fill="#4CAF50" />
          <Bar dataKey="neutral" stackId="a" fill="#FFC107" />
          <Bar dataKey="negative" stackId="a" fill="#F44336" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SentimentDistributionChart;
