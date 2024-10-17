// src/components/AnalyticsChart.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Spin,
  Alert,
  Card,
  Statistic,
  Row,
  Col,
  Table,
} from 'antd';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import './AnalyticsChart.css'; // Import CSS for styling

interface CategoryStat {
  total_products: number;
  average_discount: number;
  total_sales: number;
}

interface TopSellingProduct {
  product_id: string;
  product_name: string;
  sales: number;
}

interface LowStockProduct {
  product_id: string;
  product_name: string;
  inventory: number;
}

interface RatingStat {
  product_id: string;
  product_name: string;
  rating: number;
  rating_count: number;
}

interface SalesData {
  date: string;
  sales: number;
}

interface SummaryResponse {
  total_products: number;
  total_sales: number;
  total_revenue: number;
  total_profit: number;
  category_stats: {
    [key: string]: CategoryStat;
  };
  top_selling_products: TopSellingProduct[];
  low_stock_products: LowStockProduct[];
  rating_stats: RatingStat[];
  sales_over_time: SalesData[];
}

const AnalyticsChart: React.FC = () => {
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get<SummaryResponse>('http://localhost:8000/analytics/summary')
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError('Failed to fetch analytics summary.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container">
        <Spin size="large" tip="Loading analytics..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="dashboard-container">
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  // Prepare data for charts
  const categoryData = Object.entries(data.category_stats).map(
    ([category, stats]) => ({
      category,
      total_products: stats.total_products,
      average_discount: stats.average_discount,
      total_sales: stats.total_sales,
    })
  );

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#845EC2', '#D65DB1'];

  // Columns for Low Stock Products Table
  const lowStockColumns = [
    {
      title: 'Product ID',
      dataIndex: 'product_id',
      key: 'product_id',
    },
    {
      title: 'Product Name',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: 'Inventory',
      dataIndex: 'inventory',
      key: 'inventory',
    },
  ];

  // Columns for Top Selling Products Table (Optional)
  const topSellingColumns = [
    {
      title: 'Product ID',
      dataIndex: 'product_id',
      key: 'product_id',
    },
    {
      title: 'Product Name',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: 'Sales',
      dataIndex: 'sales',
      key: 'sales',
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
  ];

  return (
    <div className="dashboard-container">
      {/* Key Performance Indicators */}
      <Row gutter={16} style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card className="card">
            <Statistic title="Total Products" value={data.total_products} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="card">
            <Statistic
              title="Total Sales"
              value={data.total_sales}
              precision={2}
              prefix="₹"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="card">
            <Statistic
              title="Total Revenue"
              value={data.total_revenue}
              precision={2}
              prefix="₹"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="card">
            <Statistic
              title="Total Profit"
              value={data.total_profit}
              precision={2}
              prefix="₹"
            />
          </Card>
        </Col>
      </Row>

      {/* Sales Revenue Over Time (Assuming data is available) */}
      {data.sales_over_time && data.sales_over_time.length > 0 && (
        <Card title="Sales Revenue Over Time" className="card">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.sales_over_time}>
              <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#0D47A1"
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      <Row gutter={16} style={{ marginTop: '20px' }}>
        {/* Category-wise Sales Distribution */}
        <Col xs={24} md={12}>
          <Card title="Category-wise Sales Distribution" className="card">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="total_sales" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Average Discount per Category */}
        <Col xs={24} md={12}>
          <Card title="Average Discount per Category" className="card">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="average_discount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#82ca9d"
                  label={(entry) =>
                    `${entry.category}: ${entry.average_discount.toFixed(2)}%`
                  }
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number | string | Array<number | string>) => {
                    if (typeof value === 'number') {
                      return `${value.toFixed(2)}%`;
                    } else if (typeof value === 'string') {
                      const parsedValue = parseFloat(value);
                      if (!isNaN(parsedValue)) {
                        return `${parsedValue.toFixed(2)}%`;
                      } else {
                        return `${value}%`;
                      }
                    } else if (Array.isArray(value)) {
                      // Handle array of numbers or strings
                      const formattedValues = value.map((v) => {
                        const num = typeof v === 'number' ? v : parseFloat(v);
                        return !isNaN(num) ? `${num.toFixed(2)}%` : `${v}%`;
                      });
                      return formattedValues.join(', ');
                    } else {
                      return `${value}%`;
                    }
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: '20px' }}>
        {/* Top Selling Products */}
        <Col xs={24} md={12}>
          <Card title="Top Selling Products" className="card">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.top_selling_products}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product_name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="sales" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Average Rating per Product */}
        <Col xs={24} md={12}>
          <Card title="Average Rating per Product" className="card">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.rating_stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product_name" />
                <YAxis domain={[0, 5]} />
                <Tooltip formatter={(value: number) => `${value} Stars`} />
                <Legend />
                <Bar dataKey="rating" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Low Stock Products Table */}
      <Card title="Low Stock Products" className="card" style={{ marginTop: '20px' }}>
        <Table
          dataSource={data.low_stock_products}
          columns={lowStockColumns}
          rowKey="product_id"
        />
      </Card>
    </div>
  );
};

export default AnalyticsChart;
