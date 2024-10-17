// src/components/UserReviews.tsx

import React, { useEffect, useState } from 'react';
import { Typography, Spin, Alert, Rate, message, Select, Avatar, Button, Input } from 'antd';
import axios from 'axios';
import InfiniteMovingCards from './InfiniteMovingCards';
import { LikeOutlined, DislikeOutlined, UserOutlined, SearchOutlined } from '@ant-design/icons';
import './UserReviews.css';

const { Title, Text } = Typography;
const { Option } = Select;

type Review = {
  review_id: string;
  product_id: string;
  product_name?: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
  review_title: string;
  review_content: string;
  rating?: number;
  review_date?: string;
  helpful_count?: number;
};

const UserReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get<Review[]>('http://localhost:8000/analytics/reviews');
        setReviews(response.data);
        setFilteredReviews(response.data);
      } catch (err) {
        setError('Failed to fetch reviews. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleHelpful = async (review_id: string, change: number) => {
    try {
      await axios.post(`http://localhost:8000/analytics/reviews/${review_id}/helpful`, { change });
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.review_id === review_id
            ? { ...review, helpful_count: (review.helpful_count || 0) + change }
            : review
        )
      );
      setFilteredReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.review_id === review_id
            ? { ...review, helpful_count: (review.helpful_count || 0) + change }
            : review
        )
      );
    } catch (err) {
      message.error('Failed to update helpful count. Please try again later.');
    }
  };

  const handleFilterChange = (value: number | null) => {
    setFilterRating(value);
    filterReviews(value, searchTerm);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterReviews(filterRating, term);
  };

  const filterReviews = (rating: number | null, term: string) => {
    let filtered = [...reviews];
    if (rating !== null) {
      filtered = filtered.filter(
        (review) =>
          review.rating !== undefined &&
          review.rating >= rating &&
          review.rating < rating + 1
      );
    }
    if (term.trim() !== '') {
      filtered = filtered.filter(
        (review) =>
          review.review_title.toLowerCase().includes(term.toLowerCase()) ||
          review.review_content.toLowerCase().includes(term.toLowerCase())
      );
    }
    setFilteredReviews(filtered);
  };

  if (loading) {
    return (
      <div className="reviews-container">
        <Spin tip="Loading Reviews..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="reviews-container">
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div className="reviews-container">
      <Title level={3} style={{ textAlign: 'center', marginBottom: '20px' }}>
        User Reviews
      </Title>
      {/* Filter and Search */}
      <div className="filters">
        <Select
          allowClear
          placeholder="Filter by Rating"
          style={{ width: 200, marginRight: 20 }}
          onChange={handleFilterChange}
        >
          <Option value={5}>5 Stars</Option>
          <Option value={4}>4 Stars</Option>
          <Option value={3}>3 Stars</Option>
          <Option value={2}>2 Stars</Option>
          <Option value={1}>1 Star</Option>
        </Select>
        <Input
          placeholder="Search Reviews"
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          onChange={handleSearchChange}
        />
      </div>

      <InfiniteMovingCards
        items={filteredReviews}
        speed="normal"
        pauseOnHover={true}
        renderItem={(item: Review, index: number) => (
          <div className="review-card" key={index}>
            <div className="user-info">
              <Avatar
                size={64}
                src={item.user_avatar || '/default-avatar.png'}
                icon={<UserOutlined />}
              />
              <div className="user-details">
                <Text strong>{item.user_name || `User ID: ${item.user_id}`}</Text>
                <br />
                <Text type="secondary">
                  {item.review_date ? new Date(item.review_date).toLocaleDateString() : ''}
                </Text>
              </div>
            </div>
            <div className="product-info">
              <Text strong>{item.product_name || `Product ID: ${item.product_id}`}</Text>
            </div>
            <Rate disabled defaultValue={item.rating || 0} />
            <div className="review-content">
              <Text strong>{item.review_title}</Text>
              <br />
              <Text>{item.review_content}</Text>
            </div>
            <div className="helpful-count">
              <Text type="secondary">Helpful Count: {item.helpful_count || 0}</Text>
              <div className="thumbs-icons">
                <Button
                  onClick={() => handleHelpful(item.review_id, 1)}
                  className="thumb-button"
                  type="text"
                  icon={<LikeOutlined />}
                />
                <Button
                  onClick={() => handleHelpful(item.review_id, -1)}
                  className="thumb-button"
                  type="text"
                  icon={<DislikeOutlined />}
                />
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default UserReviews;
