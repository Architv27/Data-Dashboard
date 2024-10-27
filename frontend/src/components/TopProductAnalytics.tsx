import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Spin, Alert, Typography, Row, Col, Card, Statistic } from 'antd';
import { Line } from '@ant-design/charts';

const { Title } = Typography;

const TopProductsAnalytics: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchTopProductsDetailed();
  }, []);

  const fetchTopProductsDetailed = async () => {
    try {
      const response = await axios.get('http://localhost:8000/analytics/top_products_detailed', {
        params: {
          page: 1,
          page_size: 10,
          sort_by: 'popularity_score',
        },
      });
      setData(response.data.products);
      setTotalCount(response.data.total_count);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch top products analytics data.');
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Product Name',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => rating.toFixed(1),
    },
    {
      title: 'Total Sales',
      dataIndex: 'total_sales',
      key: 'total_sales',
      render: (sales: number) => `₹${sales.toFixed(2)}`,
    },
    {
      title: 'Profit',
      dataIndex: 'profit',
      key: 'profit',
      render: (profit: number) => `₹${profit.toFixed(2)}`,
    },
    {
      title: 'Popularity Score',
      dataIndex: 'popularity_score',
      key: 'popularity_score',
      render: (score: number) => score.toFixed(2),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" tip="Loading top products analytics..." />
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
      <Title level={3}>Top Products Analytics</Title>
      <Table
        dataSource={data}
        columns={columns}
        pagination={false}
        rowKey="product_id"
        style={{ marginBottom: '20px' }}
      />
    </div>
  );
};

export default TopProductsAnalytics;
