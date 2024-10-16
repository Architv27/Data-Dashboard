// src/App.tsx

import React, { useRef } from 'react';
import { Layout, Typography, Button } from 'antd';
import { createGlobalStyle } from 'styled-components';
import { PlusOutlined } from '@ant-design/icons';
import Chart from './components/Chart';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import DataTable, { DataTableRef } from './components/DataTable';
import './App.css';
import styled from 'styled-components'; // Import styled-components

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

// Global Styles
const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Poppins', sans-serif;
    background-color: #F5F7FA;
    margin: 0;
    padding: 0;
  }

  /* Ant Design Overrides */
  .ant-layout-header {
    background-color: #1D3557;
    display: flex;
    align-items: center;
    padding: 0 20px;
  }

  .ant-typography-title {
    color: #fff;
    line-height: 64px;
    margin: 0;
  }

  .ant-layout-content {
    margin: 20px;
    padding-bottom: 60px; /* To ensure content is not hidden behind FAB */
  }

  .ant-layout-footer {
    background-color: #1D3557;
    color: #fff;
    text-align: center;
  }
`;

// Styled Components for FAB
const FloatingButton = styled(Button)`
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  background-color: #1D3557;
  border-color: #1D3557;
  color: #fff; /* Ensure the icon color is visible */

  &:hover,
  &:focus {
    background-color: #457B9D;
    border-color: #457B9D;
    color: #fff; /* Maintain icon color on hover */
  }
`;

const App: React.FC = () => {
  const dataTableRef = useRef<DataTableRef>(null);

  return (
    <>
      <GlobalStyle />
      <Layout style={{ minHeight: '100vh', position: 'relative' }}>
        {/* Header */}
        <Header>
          <div className="logo">
            {/* Replace with your company logo */}
            {/* <img src="/path-to-logo.png" alt="Company Logo" style={{ height: '40px' }} /> */}
          </div>
          <Title level={3} style={{ marginLeft: '10px' }}>Fintech Product Dashboard</Title>
        </Header>

        {/* Content */}
        <Content>
          <Chart />
          <AnalyticsDashboard />
          <DataTable ref={dataTableRef} />
        </Content>

        {/* Floating Action Button */}
        <FloatingButton
          type="primary"
          shape="circle"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => {
            dataTableRef.current?.handleAdd();
          }}
          aria-label="Add New Product"
        />

        {/* Footer */}
        <Footer>
          Fintech Product Dashboard ©2024 Created by Your Company Name
        </Footer>
      </Layout>
    </>
  );
};

export default App;
