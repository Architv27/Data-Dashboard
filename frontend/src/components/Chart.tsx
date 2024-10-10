// src/components/Chart.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Spin } from 'antd';

interface Product {
  category: string;
}

interface ChartData {
  category: string;
  count: number;
  percentage: number;
}

const COLORS = [
  '#1E88E5', '#D32F2F', '#7CB342', '#FDD835',
  '#5E35B1', '#F4511E', '#039BE5', '#C0CA33',
  '#FB8C00', '#6D4C41', '#26A69A', '#546E7A',
];

const Chart: React.FC = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get<Product[]>('http://localhost:8000/products/')
      .then((response) => {
        const totalProducts = response.data.length;

        const categoryCounts = response.data.reduce((acc: any, product) => {
          const mainCategory = product.category ? product.category.split('|')[0] : 'Unknown';
          acc[mainCategory] = (acc[mainCategory] || 0) + 1;
          return acc;
        }, {});

        // Group small categories into 'Other'
        const chartData: ChartData[] = [];
        let otherCount = 0;

        for (const [category, count] of Object.entries(categoryCounts)) {
          const percentage = (count as number) / totalProducts;
          if (percentage >= 0.05) {
            chartData.push({
              category,
              count: count as number,
              percentage: percentage * 100,
            });
          } else {
            otherCount += count as number;
          }
        }

        if (otherCount > 0) {
          chartData.push({
            category: 'Other',
            count: otherCount,
            percentage: (otherCount / totalProducts) * 100,
          });
        }

        setData(chartData);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError('Failed to fetch data');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" tip="Loading chart..." />
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div style={{ width: '100%', height: 400, backgroundColor: '#fff', padding: '20px', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', marginBottom: '20px' }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={130}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any, name: any) => [`${value}`, `${name}`]}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '6px', border: 'none', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
            itemStyle={{ fontSize: 14, color: '#333' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;