// src/components/AnalyticsChart.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Spin, Alert } from 'antd';
import { PriceTrendResponse, TrendData } from '../Types/PriceTrendResponse';

const AnalyticsChart: React.FC = () => {
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get<PriceTrendResponse>('http://localhost:8000/analytics/price_trend')
      .then((response) => {
        setData(response.data.future_trends);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError('Failed to fetch price trends.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" tip="Loading analytics..." />
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
        width: '100%',
        height: 400,
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px',
      }}
    >
      <h3>Pricing Trends</h3>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
          <XAxis
            dataKey="actual_price"
            label={{ value: 'Actual Price (INR)', position: 'insideBottom', offset: -5 }}
            tickFormatter={(value) => `₹${value / 1000}k`}
          />
          <YAxis
            label={{ value: 'Predicted Discounted Price (INR)', angle: -90, position: 'insideLeft' }}
            tickFormatter={(value) => `₹${value / 1000}k`}
          />
          <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
          <Legend verticalAlign="top" height={36}/>
          <Line type="monotone" dataKey="predicted_discounted_price" stroke="#0D47A1" strokeWidth={2} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticsChart;
