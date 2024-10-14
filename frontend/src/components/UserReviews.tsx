// src/components/UserReviews.tsx

import React, { useEffect, useState } from 'react';
import { Card, List, Typography, Divider, Spin, Alert, Rate } from 'antd';
import axios from 'axios';
import styled from 'styled-components';

const { Title, Text } = Typography;

// Styled Components
const ReviewsContainer = styled.div`
  padding: 20px;
`;

const ReviewCard = styled(Card)`
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const UserAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
`;

const ReviewContent = styled.div`
  margin-top: 10px;
`;

type Review = {
  review_id: string;
  product_id: string;
  user_id: string;
  review_content: string;
  rating: number;
  review_date: string;
  helpful_count: number;
};

type ReviewsData = {
  top_reviews: Review[];
  bad_reviews: Review[];
};

const UserReviews: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get<ReviewsData>('http://localhost:8000/analytics/reviews');
        setReviews(response.data);
      } catch (err) {
        setError('Failed to fetch reviews. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <ReviewsContainer>
        <Spin tip="Loading Reviews..." />
      </ReviewsContainer>
    );
  }

  if (error) {
    return (
      <ReviewsContainer>
        <Alert message="Error" description={error} type="error" showIcon />
      </ReviewsContainer>
    );
  }

  return (
    <ReviewsContainer>
      <Title level={4}>Top Reviews</Title>
      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={reviews?.top_reviews}
        renderItem={(item) => (
          <List.Item>
            <ReviewCard>
              <UserInfo>
                {/* Replace with actual user avatar if available */}
                <UserAvatar src="/default-avatar.png" alt="User Avatar" />
                <div>
                  <Text strong>User ID: {item.user_id}</Text>
                  <br />
                  <Text type="secondary">{new Date(item.review_date).toLocaleDateString()}</Text>
                </div>
              </UserInfo>
              <Rate disabled defaultValue={item.rating} />
              <ReviewContent>
                <Text>{item.review_content}</Text>
              </ReviewContent>
              <Text type="secondary">Helpful Count: {item.helpful_count}</Text>
            </ReviewCard>
          </List.Item>
        )}
      />

      <Divider />

      <Title level={4}>Bad Reviews</Title>
      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={reviews?.bad_reviews}
        renderItem={(item) => (
          <List.Item>
            <ReviewCard>
              <UserInfo>
                {/* Replace with actual user avatar if available */}
                <UserAvatar src="/default-avatar.png" alt="User Avatar" />
                <div>
                  <Text strong>User ID: {item.user_id}</Text>
                  <br />
                  <Text type="secondary">{new Date(item.review_date).toLocaleDateString()}</Text>
                </div>
              </UserInfo>
              <Rate disabled defaultValue={item.rating} />
              <ReviewContent>
                <Text>{item.review_content}</Text>
              </ReviewContent>
              <Text type="secondary">Helpful Count: {item.helpful_count}</Text>
            </ReviewCard>
          </List.Item>
        )}
      />
    </ReviewsContainer>
  );
};

export default UserReviews;
