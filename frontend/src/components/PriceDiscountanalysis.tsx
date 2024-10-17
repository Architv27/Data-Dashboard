// src/components/PriceDiscountAnalysisChart.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Spin, Alert, Row, Col, Statistic } from 'antd';
import { PriceDiscountAnalysisResponse } from '../Types/PriceDiscountAnalysisResponse';

const PriceDiscountAnalysisChart: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [overallStats, setOverallStats] = useState<any>(null);
  const [correlation, setCorrelation] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get('http://localhost:8000/analytics/price_discount_analysis')
      .then((response) => {
        setData(response.data.per_price_range_stats);
        setOverallStats(response.data.overall_stats);
        const corr = response.data.price_discount_correlation.actual_price.discount_percentage;
        setCorrelation(corr);
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
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px',
      }}
    >
      <h3>Price and Discount Analysis</h3>
      <Row gutter={16} style={{ marginBottom: '20px' }}>
        <Col span={8}>
          <Statistic
            title="Correlation (Price vs Discount)"
            value={correlation?.toFixed(2)}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Average Discount (%)"
            value={overallStats.average_discount_percentage.toFixed(2)}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Median Discount (%)"
            value={overallStats.median_discount_percentage.toFixed(2)}
          />
        </Col>
      </Row>
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="price_range" />
          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#82ca9d"
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="average_discount_percentage" fill="#8884d8" name="Avg Discount (%)" />
          <Bar yAxisId="left" dataKey="median_discount_percentage" fill="#83a6ed" name="Median Discount (%)" />
          <Bar yAxisId="right" dataKey="product_count" fill="#82ca9d" name="Product Count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceDiscountAnalysisChart;
