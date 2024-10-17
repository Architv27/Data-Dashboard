// src/components/HelpSection.tsx

import React from 'react';
import { Collapse, Typography, Anchor, Card } from 'antd';
import {
  InfoCircleOutlined,
  SettingOutlined,
  MessageOutlined,
  PlusCircleOutlined,
  ExportOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import './HelpSection.css';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;
const { Link } = Anchor;

const HelpSection: React.FC = () => {
  return (
    <div className="help-section" id="help-section">
      <Card className="help-card">
        <Title level={2}>Help & Support</Title>
        <Paragraph>
          Welcome to the Fintech Product Dashboard. This help section will guide you through the features and functionalities of the dashboard.
        </Paragraph>

        {/* Table of Contents */}
        <Anchor affix={false} className="help-anchor">
          <Link href="#using-the-dashboard" title="Using the Dashboard" />
          <Link href="#faq" title="Frequently Asked Questions" />
        </Anchor>

        {/* Using the Dashboard */}
        <Title level={3} id="using-the-dashboard">
          Using the Dashboard
        </Title>
        <Paragraph>
          The dashboard provides an overview of key metrics and allows you to manage products and view user reviews.
        </Paragraph>
        <Collapse accordion>
          <Panel
            header={
              <span>
                <BarChartOutlined /> Analytics Dashboard
              </span>
            }
            key="1"
          >
            <Paragraph>
              The Analytics Dashboard displays key performance indicators (KPIs) such as total sales, revenue, and profit. Click on the charts to enlarge them for more detailed analysis.
            </Paragraph>
          </Panel>
          <Panel
            header={
              <span>
                <SettingOutlined /> Managing Products
              </span>
            }
            key="2"
          >
            <Paragraph>
              The Data Table allows you to view, add, edit, and delete products. Use the search and filter options to find specific products.
            </Paragraph>
          </Panel>
          <Panel
            header={
              <span>
                <MessageOutlined /> User Reviews
              </span>
            }
            key="3"
          >
            <Paragraph>
              View customer feedback in the User Reviews section. You can filter reviews by rating and search for specific comments.
            </Paragraph>
          </Panel>
        </Collapse>

        {/* FAQ */}
        <Title level={3} id="faq">
          Frequently Asked Questions
        </Title>
        <Collapse accordion>
          <Panel
            header={
              <span>
                <PlusCircleOutlined /> How do I add a new product?
              </span>
            }
            key="4"
          >
            <Paragraph>
              Go to the Data Table section and click on the "Add Product" button. Fill in the product details and submit the form.
            </Paragraph>
          </Panel>
          <Panel
            header={
              <span>
                <ExportOutlined /> Can I export the data?
              </span>
            }
            key="5"
          >
            <Paragraph>
              Yes, you can export the data by clicking on the "Export" button in the Data Table section.
            </Paragraph>
          </Panel>
          <Panel
            header={
              <span>
                <BarChartOutlined /> How do I view detailed analytics?
              </span>
            }
            key="6"
          >
            <Paragraph>
              Click on any chart in the Analytics Dashboard to open it in an enlarged view with more interactive options.
            </Paragraph>
          </Panel>
        </Collapse>
      </Card>
    </div>
  );
};

export default HelpSection;
