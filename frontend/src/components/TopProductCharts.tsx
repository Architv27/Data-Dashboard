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
import { Spin, Alert, Select, Slider, Row, Col, Button } from 'antd';
import { TopProductsResponse, TopProduct } from '../Types/TopProductsResponse'; // Corrected import path
import { DownOutlined, UpOutlined } from '@ant-design/icons';

const { Option } = Select;

const TopProductsChart: React.FC = () => {
  const [data, setData] = useState<TopProductsResponse>([]);
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

  // State to manage filter panel visibility
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    // Fetch top products based on current filters
    fetchTopProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, ratingRange]);

  const fetchTopProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (categories.length > 0) {
        params.categories = categories;
      }
      if (ratingRange) {
        params.min_rating = ratingRange[0];
        params.max_rating = ratingRange[1];
      }

      const response = await axios.get<TopProductsResponse>('http://localhost:8000/analytics/top_products', { params });
      setData(response.data);
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
  };

  const handleRatingChange = (value: number | number[]) => {
    if (Array.isArray(value) && value.length === 2) {
      setRatingRange([value[0], value[1]]);
    }
  };

  // Toggle filter panel visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Reset filters
  const resetFilters = () => {
    setCategories([]);
    setRatingRange([0, 5]);
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
          <h3>Top 10 Products by Popularity</h3>
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
            <Col xs={24} sm={12} md={8}>
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
            <Col xs={24} sm={12} md={8}>
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

            {/* Reset Filters Button */}
            <Col xs={24} sm={12} md={8} style={{ display: 'flex', alignItems: 'end' }}>
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
        <ResponsiveContainer width="100%" height={500}>
          <BarChart
            data={processedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 150 }} // Increased bottom margin for rotated labels
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="truncated_name" // Use truncated names for labels
              tick={{ fontSize: 12 }}
              tickLine={false}
              interval={0} // Display all labels
              angle={-45} // Rotate labels by -45 degrees
              textAnchor="end" // Align text to the end to match rotation
              height={150} // Increase height to accommodate rotated labels
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="rating" fill="#82ca9d" name="Rating" />
            <Bar dataKey="rating_count" fill="#8884d8" name="Review Count" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default TopProductsChart;
