// src/components/AnalyticsDashboard.tsx

import React from 'react';
import { Row, Col, Card } from 'antd';
import AnalyticsChart from './AnalyticsChart';
import SentimentDistributionChart from './SentimentDistributionChart';
import PriceDiscountAnalysisChart from './PriceDiscountanalysis';
import TopProductsChart from './TopProductCharts';
import UserReviews from './UserReviews';  // Import the new UserReviews component

const AnalyticsDashboard: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      {/* Row 1: Analytics Chart */}
      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Card title="Analytics Overview" bordered={false}>
            <AnalyticsChart />
          </Card>
        </Col>
      </Row>

      {/* Row 2: Sentiment Distribution and Price Discount Analysis */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="Sentiment Distribution" bordered={false}>
            <SentimentDistributionChart />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Price & Discount Analysis" bordered={false}>
            <PriceDiscountAnalysisChart />
          </Card>
        </Col>
      </Row>

      {/* Row 3: Top Products */}
      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Card title="Top Performing Products" bordered={false}>
            <TopProductsChart />
          </Card>
        </Col>
      </Row>

      {/* Row 4: User Reviews */}
      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Card title="User Reviews" bordered={false}>
            <UserReviews />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AnalyticsDashboard;
