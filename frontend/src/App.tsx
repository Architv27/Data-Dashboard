// src/App.tsx

import React from 'react';
import { Layout } from 'antd';
import { createGlobalStyle } from 'styled-components';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import DataTable from './components/DataTable';
import UserReviews from './components/UserReviews';
import './App.css';

const { Header, Content, Footer } = Layout;

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Poppins', sans-serif;
    background-color: #F1FAEE;
    margin: 0;
    padding: 0;
  }

  .ant-layout-header {
    background-color: #1D3557;
    padding: 0 20px;
  }

  .header-title {
    color: #fff;
    line-height: 64px;
    margin: 0;
    font-size: 24px;
  }

  .ant-layout-content {
    margin: 0;
    padding: 20px;
  }

  .ant-layout-footer {
    background-color: #1D3557;
    color: #fff;
    text-align: center;
  }
`;

const App: React.FC = () => {
  return (
    <>
      <GlobalStyle />
      <Layout>
        {/* Header */}
        <Header>
          <div className="header-title">Fintech Product Dashboard</div>
        </Header>

        {/* Content */}
        <Content>
          <AnalyticsDashboard />
          <DataTable />
        </Content>

        {/* Footer */}
        <Footer>
          Fintech Product Dashboard ©2024 Created by Your Company Name
        </Footer>
      </Layout>
    </>
  );
};

export default App;
