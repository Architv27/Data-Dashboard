// src/components/AnalyticsDashboard.tsx

import React from 'react';
import { Card, Typography } from 'antd';
import Tabs from './Tabs';
import AnalyticsChart from './AnalyticsChart';
import SentimentDistributionChart from './SentimentDistributionChart';
import PriceDiscountAnalysisChart from './PriceDiscountanalysis';
import TopProductsChart from './TopProductCharts';
import SalesTrendChart from './SalesTrendChart'; // New Chart
import UserReviews from './UserReviews';
import './AnalyticsDashboard.css';

const { Title } = Typography;

const AnalyticsDashboard: React.FC = () => {
  const tabsData = [
    {
      title: 'Analytics Overview',
      value: 'analytics-overview',
      content: <AnalyticsChart />,
    },
    {
      title: 'Sentiment Distribution',
      value: 'sentiment-distribution',
      content: <SentimentDistributionChart />,
    },
    {
      title: 'Price & Discount Analysis',
      value: 'price-discount-analysis',
      content: <PriceDiscountAnalysisChart />,
    },
    {
      title: 'Top Performing Products',
      value: 'top-performing-products',
      content: <TopProductsChart />,
    },
    {
      title: 'User Reviews',
      value: 'user-reviews',
      content: <UserReviews />,
    },
  ];

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <Title level={2} className="dashboard-title">
          Analytics Dashboard
        </Title>
      </div>
      <Card className="dashboard-card">
        <Tabs tabs={tabsData} />
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
