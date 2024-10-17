// src/components/TopProductsChart.tsx

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
} from 'recharts';
import { Spin, Alert, Select, Slider, Row, Col, Button, Pagination } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';

const { Option } = Select;

type TopProduct = {
  product_id: string;
  product_name: string;
  category: string;
  actual_price: number;
  discounted_price: number;
  discount_percentage: number;
  rating: number;
  rating_count: number;
  popularity_score: number;
  total_sales: number;
  profit: number;
};

const TopProductsChart: React.FC = () => {
  const [data, setData] = useState<TopProduct[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filters
  const [categories, setCategories] = useState<string[]>([]);
  const [availableCategories] = useState<string[]>([
    'Car&Motorbike',
    'Computers&Accessories',
    'Electronics',
    'Health&PersonalCare',
    'Home&Kitchen',
    'HomeImprovement',
    'MusicalInstruments',
    'OfficeProducts',
    'Toys&Games',
  ]);
  const [ratingRange, setRatingRange] = useState<[number, number]>([0, 5]);
  const [sortBy, setSortBy] = useState<string>('popularity_score');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // State to manage filter panel visibility
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    // Fetch top products based on current filters
    fetchTopProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, ratingRange, sortBy, currentPage]);

  const fetchTopProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page: currentPage,
        page_size: pageSize,
        sort_by: sortBy,
      };
      if (categories.length > 0) {
        params.categories = categories;
      }
      if (ratingRange) {
        params.min_rating = ratingRange[0];
        params.max_rating = ratingRange[1];
      }

      const response = await axios.get('http://localhost:8000/analytics/top_products', { params });
      setData(response.data.products);
      setTotalCount(response.data.total_count);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch top products data.');
    } finally {
      setLoading(false);
    }
  };

  // Function to truncate long product names
  const truncate = (str: string, maxLength: number) => {
    return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;
  };

  // Prepare data by truncating product names
  const processedData = data.map((item) => ({
    ...item,
    truncated_name: truncate(item.product_name, 15), // Adjust maxLength as needed
  }));

  // Handle filter changes
  const handleCategoryChange = (value: string[]) => {
    setCategories(value);
    setCurrentPage(1);
  };

  const handleRatingChange = (value: number | number[]) => {
    if (Array.isArray(value) && value.length === 2) {
      setRatingRange([value[0], value[1]]);
      setCurrentPage(1);
    }
  };

  const handleSortByChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Toggle filter panel visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Reset filters
  const resetFilters = () => {
    setCategories([]);
    setRatingRange([0, 5]);
    setSortBy('popularity_score');
    setCurrentPage(1);
  };

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
      <Row justify="space-between" align="middle" style={{ marginBottom: '20px' }}>
        <Col>
          <h3>Top Products</h3>
        </Col>
        <Col>
          <Button type="primary" onClick={toggleFilters}>
            {showFilters ? <><UpOutlined /> Hide Filters</> : <><DownOutlined /> Show Filters</>}
          </Button>
        </Col>
      </Row>

      {showFilters && (
        <div style={{ marginBottom: '20px' }}>
          <Row gutter={[16, 16]}>
            {/* Category Filter */}
            <Col xs={24} sm={12} md={6}>
              <label><strong>Category:</strong></label>
              <Select
                mode="multiple"
                allowClear
                placeholder="Select categories"
                value={categories}
                onChange={handleCategoryChange}
                style={{ width: '100%' }}
              >
                {availableCategories.map((category) => (
                  <Option key={category} value={category}>
                    {category}
                  </Option>
                ))}
              </Select>
            </Col>

            {/* Rating Range Filter */}
            <Col xs={24} sm={12} md={6}>
              <label><strong>Rating Range:</strong></label>
              <Slider
                range
                min={0}
                max={5}
                step={0.1}
                marks={{
                  0: '0',
                  1: '1',
                  2: '2',
                  3: '3',
                  4: '4',
                  5: '5',
                }}
                value={ratingRange}
                onChange={handleRatingChange}
              />
            </Col>

            {/* Sort By */}
            <Col xs={24} sm={12} md={6}>
              <label><strong>Sort By:</strong></label>
              <Select
                value={sortBy}
                onChange={handleSortByChange}
                style={{ width: '100%' }}
              >
                <Option value="popularity_score">Popularity Score</Option>
                <Option value="total_sales">Total Sales</Option>
                <Option value="profit">Profit</Option>
              </Select>
            </Col>

            {/* Reset Filters Button */}
            <Col xs={24} sm={12} md={6} style={{ display: 'flex', alignItems: 'end' }}>
              <Button onClick={resetFilters} type="default" style={{ width: '100%' }}>
                Reset Filters
              </Button>
            </Col>
          </Row>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" tip="Loading top products..." />
        </div>
      ) : error ? (
        <div style={{ padding: '20px' }}>
          <Alert message="Error" description={error} type="error" showIcon />
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart
              data={processedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 150 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="truncated_name"
                tick={{ fontSize: 12 }}
                tickLine={false}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={150}
              />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff' }}
                formatter={(value: any, name: string, props: any) => {
                  if (name === 'Product Name') return [props.payload.product_name, name];
                  return [value, name];
                }}
                labelFormatter={() => ''}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="rating" fill="#8884d8" name="Rating" />
              <Bar yAxisId="left" dataKey="rating_count" fill="#83a6ed" name="Review Count" />
              <Bar yAxisId="right" dataKey="total_sales" fill="#82ca9d" name="Total Sales" />
              <Bar yAxisId="right" dataKey="profit" fill="#8dd1e1" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
          {/* Pagination */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalCount}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default TopProductsChart;
