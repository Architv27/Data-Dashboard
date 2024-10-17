// src/components/UserReviews.tsx

import React, { useEffect, useState } from 'react';
import { Typography, Spin, Alert, Rate, message } from 'antd';
import axios from 'axios';
import InfiniteMovingCards from './InfiniteMovingCards';
import { LikeOutlined, DislikeOutlined } from '@ant-design/icons';
import './UserReviews.css';

const { Title, Text } = Typography;

type Review = {
  review_id: string;
  product_id: string;
  product_name?: string;
  user_id: string;
  user_name?: string;
  review_title: string;
  review_content: string;
  rating?: number;
  review_date?: string;
  helpful_count?: number;
};

const UserReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get<Review[]>('http://localhost:8000/analytics/reviews');
        setReviews(response.data);
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
      await axios.post(`http://localhost:8000/analytics/reviews/${review_id}/helpful`, change);
      setReviews((prevReviews) =>
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
      <Title level={4}>User Reviews</Title>
      <InfiniteMovingCards
        items={reviews}
        speed="normal"
        pauseOnHover={true}
        renderItem={(item: Review, index: number) => (
          <div className="review-card">
            <div className="user-info">
              {/* Replace with actual user avatar if available */}
              <img className="user-avatar" src="/default-avatar.png" alt="User Avatar" />
              <div>
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
                <button onClick={() => handleHelpful(item.review_id, 1)} className="thumb-button">
                  <LikeOutlined />
                </button>
                <button onClick={() => handleHelpful(item.review_id, -1)} className="thumb-button">
                  <DislikeOutlined />
                </button>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default UserReviews;
