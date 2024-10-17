// src/App.tsx

import React from 'react';
import { Layout, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { createGlobalStyle } from 'styled-components';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import DataTable from './components/DataTable';
import UserReviews from './components/UserReviews';
import HelpSection from './components/HelpSection'; // Import HelpSection component
import './App.css';

const { Header, Content, Footer } = Layout;

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Poppins', sans-serif;
    background-color: #F1FAEE; /* Off-White Background */
    margin: 0;
    padding: 0;
    color: #1D3557; /* Primary Text Color */
  }

  .ant-layout-header {
    background-color: #1D3557; /* Dark Blue */
    padding: 0 20px;
  }

  .header-title {
    color: #FFFFFF;
    line-height: 64px;
    margin: 0;
    font-size: 28px;
    font-weight: 600;
  }

  .ant-layout-content {
    margin: 0;
    padding: 40px 20px;
  }

  .ant-layout-footer {
    background-color: #1D3557; /* Dark Blue */
    color: #FFFFFF;
    text-align: center;
  }

  /* Additional Styles */
  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .header-icons {
    display: flex;
    align-items: center;
  }
`;

const App: React.FC = () => {
  return (
    <>
      <GlobalStyle />
      <Layout>
        {/* Header */}
        <Header>
          <div className="header-content">
            <div className="header-title">Fintech Product Dashboard</div>
            {/* Help Icon */}
            <div className="header-icons">
              <Tooltip title="Help">
                <a href="#help-section">
                  <QuestionCircleOutlined
                    style={{
                      fontSize: '24px',
                      color: '#FFFFFF',
                      marginRight: '20px',
                    }}
                  />
                </a>
              </Tooltip>
            </div>
          </div>
        </Header>

        {/* Content */}
        <Content>
          <AnalyticsDashboard />
          <DataTable />
          <UserReviews />
          <HelpSection /> {/* Include HelpSection component */}
        </Content>

        {/* Footer */}
        <Footer>
          Fintech Product Dashboard ©2024 Created by Archit Verma
        </Footer>
      </Layout>
    </>
  );
};

export default App;
