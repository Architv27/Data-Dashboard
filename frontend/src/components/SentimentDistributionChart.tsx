// src/components/SentimentDistributionChart.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  LabelList,
} from 'recharts';
import { Spin, Table, Card, Typography, Divider } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import './SentimentDistributionChart.css';

const { Title, Text } = Typography;

interface SentimentData {
  main_category: string;
  subcategory: string;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
  positive_percentage: number;
  neutral_percentage: number;
  negative_percentage: number;
  average_rating: number;
}

const COLORS = ['#4CAF50', '#FFC107', '#F44336'];

const SentimentDistributionChart: React.FC = () => {
  const [data, setData] = useState<SentimentData[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get<SentimentData[]>('http://localhost:8000/analytics/sentiment_distribution')
      .then((response) => {
        const responseData = response.data;
        setData(responseData);
        // Extract unique main categories
        const uniqueCategories = Array.from(new Set(responseData.map((item) => item.main_category)));
        setCategories(uniqueCategories);
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
      <div className="sentiment-chart-container">
        <Spin size="large" tip="Loading sentiment distribution..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="sentiment-chart-container">
        <Text type="danger">{error}</Text>
      </div>
    );
  }

  // Prepare data for main category chart
  const mainCategoryData = categories.map((category) => {
    const categoryData = data.filter((item) => item.main_category === category);
    const positive = categoryData.reduce((sum, item) => sum + item.positive, 0);
    const neutral = categoryData.reduce((sum, item) => sum + item.neutral, 0);
    const negative = categoryData.reduce((sum, item) => sum + item.negative, 0);
    const total = positive + neutral + negative;
    const averageRating =
      categoryData.reduce((sum, item) => sum + item.average_rating * item.total, 0) / total;
    return {
      main_category: category,
      positive,
      neutral,
      negative,
      total,
      averageRating: parseFloat(averageRating.toFixed(2)),
      positive_percentage: (positive / total) * 100,
      neutral_percentage: (neutral / total) * 100,
      negative_percentage: (negative / total) * 100,
    };
  });

  // Prepare data for subcategory chart
  const subcategoryData = data.map((item) => ({
    main_category: item.main_category,
    subcategory: item.subcategory,
    positive: item.positive,
    neutral: item.neutral,
    negative: item.negative,
    total: item.total,
    average_rating: parseFloat(item.average_rating.toFixed(2)),
    positive_percentage: item.positive_percentage,
    neutral_percentage: item.neutral_percentage,
    negative_percentage: item.negative_percentage,
  }));

  return (
    <div className="sentiment-chart-container">
      {/* Page Title */}
      <Title level={2} style={{ textAlign: 'center', marginBottom: '20px', fontFamily: 'Arial, sans-serif' }}>
        Sentiment Analysis Dashboard
      </Title>

      <Divider />

      {/* Main Category Sentiment Chart */}
      <Card
        title={
          <span style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>
            Sentiment Distribution Across Main Categories
            <InfoCircleOutlined
              style={{ marginLeft: '8px' }}
              title="This chart shows the overall sentiment distribution for each main category."
            />
          </span>
        }
        className="chart-card"
      >
        <ResponsiveContainer width="100%" height={500}>
          <BarChart
            data={mainCategoryData}
            layout="vertical"
            margin={{ top: 20, right: 50, left: 200, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              domain={[0, 'dataMax']}
              tickFormatter={(value) => `${value}`}
              ticks={[]}
            />
            <YAxis
              dataKey="main_category"
              type="category"
              width={180}
              tickFormatter={(value) => (value.length > 20 ? `${value.slice(0, 20)}...` : value)}
              style={{ fontSize: '14px', fontFamily: 'Arial, sans-serif' }}
            />
            <Tooltip
              formatter={(value: number, name: string) => [`${value}`, name]}
              contentStyle={{ backgroundColor: '#f5f5f5' }}
            />
            <Legend verticalAlign="top" height={36} />
            <Bar dataKey="positive" stackId="a" fill="#4CAF50" barSize={20}>
            </Bar>
            <Bar dataKey="neutral" stackId="a" fill="#FFC107" barSize={20}>

            </Bar>
            <Bar dataKey="negative" stackId="a" fill="#F44336" barSize={20}>
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Divider />

      {/* Subcategory Sentiment Chart */}
      <Card
        title={
          <span style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>
            Sentiment Distribution Across Subcategories
            <InfoCircleOutlined
              style={{ marginLeft: '8px' }}
              title="This chart shows the sentiment distribution for each subcategory."
            />
          </span>
        }
        className="chart-card"
      >
        <ResponsiveContainer width="100%" height={500}>
          <BarChart
            data={subcategoryData}
            layout="vertical"
            margin={{ top: 20, right: 50, left: 200, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              domain={[0, 'dataMax']}
              tickFormatter={(value) => `${value}`}
              ticks={[]}
            />
            <YAxis
              dataKey="subcategory"
              type="category"
              width={180}
              tickFormatter={(value) => (value.length > 20 ? `${value.slice(0, 20)}...` : value)}
              style={{ fontSize: '12px', fontFamily: 'Arial, sans-serif' }}
            />
            <Tooltip
              formatter={(value: number, name: string) => [`${value}`, name]}
              contentStyle={{ backgroundColor: '#f5f5f5' }}
            />
            <Legend verticalAlign="top" height={36} />
            <Bar dataKey="positive" stackId="a" fill="#4CAF50" barSize={20}>
            </Bar>
            <Bar dataKey="neutral" stackId="a" fill="#FFC107" barSize={20}>
            </Bar>
            <Bar dataKey="negative" stackId="a" fill="#F44336" barSize={20}>
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Divider />

      {/* Sentiment Details Table */}
      <Card
        title={
          <span style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>
            Sentiment Details
            <InfoCircleOutlined
              style={{ marginLeft: '8px' }}
              title="This table provides detailed sentiment data."
            />
          </span>
        }
        className="chart-card"
      >
        <Table
          dataSource={subcategoryData}
          columns={[
            {
              title: 'Main Category',
              dataIndex: 'main_category',
              key: 'main_category',
              render: (text) => <Text style={{ fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>{text}</Text>,
            },
            {
              title: 'Subcategory',
              dataIndex: 'subcategory',
              key: 'subcategory',
              render: (text) => <Text style={{ fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>{text}</Text>,
            },
            {
              title: 'Total Reviews',
              dataIndex: 'total',
              key: 'total',
            },
            {
              title: 'Positive (%)',
              dataIndex: 'positive_percentage',
              key: 'positive_percentage',
              render: (value) => `${value.toFixed(1)}%`,
              sorter: (a, b) => a.positive_percentage - b.positive_percentage,
            },
            {
              title: 'Neutral (%)',
              dataIndex: 'neutral_percentage',
              key: 'neutral_percentage',
              render: (value) => `${value.toFixed(1)}%`,
              sorter: (a, b) => a.neutral_percentage - b.neutral_percentage,
            },
            {
              title: 'Negative (%)',
              dataIndex: 'negative_percentage',
              key: 'negative_percentage',
              render: (value) => `${value.toFixed(1)}%`,
              sorter: (a, b) => a.negative_percentage - b.negative_percentage,
            },
            {
              title: 'Average Rating',
              dataIndex: 'average_rating',
              key: 'average_rating',
              render: (value) => value.toFixed(2),
              sorter: (a, b) => a.average_rating - b.average_rating,
            },
          ]}
          rowKey={(record) => `${record.main_category}-${record.subcategory}`}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default SentimentDistributionChart;
