import React, { useRef } from 'react';
import { Layout, Typography, Affix, Button, Space } from 'antd';
import { createGlobalStyle } from 'styled-components';
import { PlusOutlined } from '@ant-design/icons';
import Chart from './components/Chart';
import AnalyticsChart from './components/AnalyticsChart';
import DataTable, { DataTableRef } from './components/DataTable';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Typography;

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Poppins', sans-serif;
    background-color: #F5F7FA;
    margin: 0;
    padding: 0;
  }
`;

const App: React.FC = () => {
  const dataTableRef = useRef<DataTableRef>(null);

  return (
    <>
      <GlobalStyle />
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ backgroundColor: '#1D3557', padding: '0 20px' }}>
          <div className="logo" />
          <Title
            level={3}
            style={{ color: '#fff', lineHeight: '64px', margin: 0 }}
          >
            Fintech Product Dashboard
          </Title>
        </Header>
        <Content style={{ margin: '20px' }}>
          <AnalyticsChart /> {/* Add the AnalyticsChart here */}
          <Chart />
          <DataTable ref={dataTableRef} />
          {/* Floating Action Button */}
          <Affix offsetTop={100} style={{position:"fixed"}}>
            <Space direction="vertical">
              <Button
                type="primary"
                shape="circle"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => {
                  dataTableRef.current?.handleAdd();
                }}
                style={{ boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)' }}
              />
            </Space>
          </Affix>
        </Content>
      </Layout>
    </>
  );
};

export default App;