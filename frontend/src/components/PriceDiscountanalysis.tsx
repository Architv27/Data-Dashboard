// src/components/PriceDiscountAnalysisChart.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Spin, Alert } from 'antd';
import { PriceDiscountAnalysisResponse, PriceDiscountAnalysisItem } from '../Types/PriceDiscountAnalysisResponse';

const PriceDiscountAnalysisChart: React.FC = () => {
  const [data, setData] = useState<PriceDiscountAnalysisResponse>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get<PriceDiscountAnalysisResponse>('http://localhost:8000/analytics/price_discount_analysis')
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError('Failed to fetch price discount analysis data.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" tip="Loading price discount analysis..." />
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
      <h3>Average Discount Percentage by Price Range</h3>
      <ResponsiveContainer>
        <ScatterChart>
          <CartesianGrid />
          <XAxis type="category" dataKey="price_range" name="Price Range" />
          <YAxis type="number" dataKey="average_discount_percentage" name="Average Discount (%)" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          <Scatter name="Discount" data={data} fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceDiscountAnalysisChart;
