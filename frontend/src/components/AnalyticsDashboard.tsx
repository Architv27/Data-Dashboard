// src/components/AnalyticsDashboard.tsx

import React from 'react';
import { Row, Col, Card, Typography, Divider } from 'antd';
import AnalyticsChart from './AnalyticsChart';
import SentimentDistributionChart from './SentimentDistributionChart';
import PriceDiscountAnalysisChart from './PriceDiscountanalysis';
import TopProductsChart from './TopProductCharts';
import UserReviews from './UserReviews'; // Import the new UserReviews component
import './AnalyticsDashboard.css'; // Import the updated CSS

const { Title } = Typography;

const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <Title level={2} className="dashboard-title">
          Analytics Dashboard
        </Title>
        <Divider />
      </div>

      {/* Parent Card Encapsulating All Analytics */}
      <Card className="parent-dashboard-card" bordered={false}>
        <Row gutter={[24, 24]} align="stretch">
          {/* Analytics Overview */}
          <Col xs={24} lg={12}>
            <div className="child-card">
              <Title level={4} className="child-card-title">
                Analytics Overview
              </Title>
              <div className="child-card-content">
                <AnalyticsChart />
              </div>
            </div>
          </Col>

          {/* Sentiment Distribution */}
          <Col xs={24} lg={12}>
            <div className="child-card">
              <Title level={4} className="child-card-title">
                Sentiment Distribution
              </Title>
              <div className="child-card-content">
                <SentimentDistributionChart />
              </div>
            </div>
          </Col>

          {/* Price & Discount Analysis */}
          <Col xs={24} lg={12}>
            <div className="child-card">
              <Title level={4} className="child-card-title">
                Price & Discount Analysis
              </Title>
              <div className="child-card-content">
                <PriceDiscountAnalysisChart />
              </div>
            </div>
          </Col>

          {/* Top Performing Products */}
          <Col xs={24} lg={12}>
            <div className="child-card">
              <Title level={4} className="child-card-title">
                Top Performing Products
              </Title>
              <div className="child-card-content">
                <TopProductsChart />
              </div>
            </div>
          </Col>

          {/* User Reviews */}
          <Col xs={24}>
            <div className="child-card">
              <Title level={4} className="child-card-title">
                User Reviews
              </Title>
              <div className="child-card-content">
                <UserReviews />
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
