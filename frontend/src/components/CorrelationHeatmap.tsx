// src/components/CorrelationHeatmap.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Spin, Alert } from 'antd';
import { RatingDiscountCorrelationResponse } from '../Types/RatingdiscountCorrelation'; // Ensure correct casing

interface HeatmapDataPoint {
  x: string;
  y: string;
  value: number;
}

const CorrelationHeatmap: React.FC = () => {
  const [matrix, setMatrix] = useState<RatingDiscountCorrelationResponse | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get<RatingDiscountCorrelationResponse>('http://localhost:8000/analytics/rating_discount_correlation')
      .then((response) => {
        setMatrix(response.data);
        setHeatmapData(prepareHeatmapData(response.data));
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError('Failed to fetch correlation data.');
        setLoading(false);
      });
  }, []);

  const prepareHeatmapData = (matrix: RatingDiscountCorrelationResponse): HeatmapDataPoint[] => {
    const xLabels = Object.keys(matrix.discount_percentage);
    const yLabels = Object.keys(matrix.discount_percentage);

    const data: HeatmapDataPoint[] = [];

    yLabels.forEach((yLabel) => {
      xLabels.forEach((xLabel) => {
        data.push({
          x: xLabel,
          y: yLabel,
          value: matrix.discount_percentage[xLabel], // Choose the correlation metric to visualize
        });
      });
    });

    return data;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" tip="Loading correlation heatmap..." />
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

  if (!matrix) {
    return null;
  }

  // Determine color scaling based on value
  const minValue = Math.min(...heatmapData.map((d) => d.value));
  const maxValue = Math.max(...heatmapData.map((d) => d.value));

  // Create a color scale function
  const getColor = (value: number): string => {
    const ratio = (value - minValue) / (maxValue - minValue);
    const red = Math.floor(255 * (1 - ratio));
    const green = Math.floor(255 * ratio);
    return `rgb(${red}, ${green}, 0)`;
  };

  // Prepare data for the scatter plot
  const scatterData = heatmapData.map((d) => ({
    x: d.x,
    y: d.y,
    value: d.value,
    color: getColor(d.value),
  }));

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
      <h3>Correlation Heatmap</h3>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid />
          <XAxis type="category" dataKey="x" name="X" />
          <YAxis type="category" dataKey="y" name="Y" />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            formatter={(value: number) => value.toFixed(2)}
          />
          <Legend />
          <Scatter
            name="Discount Percentage Correlation"
            data={scatterData}
            fill="#8884d8"
            shape="circle"
          >
            {scatterData.map((entry, index) => (
              <circle
                key={`circle-${index}`}
                cx={0}
                cy={0}
                r={Math.abs(entry.value) * 5} // Adjust the multiplier as needed
                fill={entry.color}
                stroke="#000"
                strokeWidth={1}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CorrelationHeatmap;
