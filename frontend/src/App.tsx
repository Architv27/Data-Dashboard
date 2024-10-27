// frontend/src/App.tsx

import React from 'react';
import { Layout, Tooltip, Button, } from 'antd';
import {
  QuestionCircleOutlined,
  UserAddOutlined,
  LoginOutlined,
} from '@ant-design/icons';
import { Card, Typography } from 'antd';
import { createGlobalStyle } from 'styled-components';
import SignUpModal from './components/SignUpForm';
import SignInModal from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';
import Logout from './components/Logout';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import './App.css';

const {Header, Content, Footer } = Layout;
const { Title } = Typography;

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Poppins', sans-serif;
    background-color: #f0f2f5; /* Light Gray Background */
    margin: 0;
    padding: 0;
    color: #1D3557; /* Primary Text Color */
  }

  .ant-layout-header {
    background-color: #1D3557; /* Dark Blue */
    padding: 0 50px;
  }

  .header-title {
    color: #FFFFFF;
    line-height: 64px;
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }

  .ant-layout-content {
    margin: 0;
    padding: 20px 50px;
    min-height: calc(100vh - 134px); /* Adjust for header and footer */
  }

  .ant-layout-footer {
    background-color: #1D3557; /* Dark Blue */
    color: #FFFFFF;
    text-align: center;
    padding: 20px 50px;
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

  .header-icons a,
  .header-icons button {
    margin-left: 15px;
    color: #FFFFFF;
    font-size: 18px;
  }

  .ant-btn-primary {
    background-color: #457B9D;
    border-color: #457B9D;
  }

  .ant-btn-primary:hover {
    background-color: #1D3557;
    border-color: #1D3557;
  }
`;

const App: React.FC = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const state = location.state as { backgroundLocation?: Location };

  return (
    <>
      <GlobalStyle />
      <Layout>
        {/* Header */}
        <Header>
          <div className="header-content">
            <Link to="/" className="header-title">
              Fintech Product Dashboard
            </Link>
            {/* Navigation Icons */}
            <div className="header-icons">
              <Tooltip title="Help">
                <a href="#help-section">
                  <QuestionCircleOutlined />
                </a>
              </Tooltip>
              {!currentUser ? (
                <>
                  <Link
                    to="/signin"
                    state={{ backgroundLocation: location }}
                  >
                    <Button
                      type="link"
                      icon={<LoginOutlined />}
                      style={{ color: '#FFFFFF' }}
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link
                    to="/signup"
                    state={{ backgroundLocation: location }}
                  >
                    <Button
                      type="primary"
                      icon={<UserAddOutlined />}
                    >
                      Sign Up
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/profile">
                    <Button
                      type="link"
                      style={{ color: '#FFFFFF' }}
                    >
                      Profile
                    </Button>
                  </Link>
                  <Logout />
                </>
              )}
            </div>
          </div>
        </Header>

        {/* Content */}
        <Content>
          <Routes location={state?.backgroundLocation || location}>
            {/* Public Routes */}
            <Route path="/signin" element={<Navigate to="/" />} />
            <Route path="/signup" element={<Navigate to="/" />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />

            {/* Redirect root to dashboard if authenticated, else to sign-in */}
            <Route
              path="/"
              element={
                currentUser ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <div style={{ textAlign: 'center', paddingTop: '50px' }}>
                    <Title level={2}>
                      Welcome to the Fintech Product Dashboard
                    </Title>
                    <p>
                      Please <Link to="/signin">Sign In</Link> or{' '}
                      <Link to="/signup">Sign Up</Link> to continue.
                    </p>
                  </div>
                )
              }
            />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>

          {/* Modal Routes */}
          {state?.backgroundLocation && (
            <Routes>
              <Route
                path="/signup"
                element={<SignUpModal />}
              />
              <Route
                path="/signin"
                element={<SignInModal />}
              />
            </Routes>
          )}
        </Content>

        {/* Footer */}
        <Footer>
          Fintech Product Dashboard ©{new Date().getFullYear()} Created by Archit Verma
        </Footer>
      </Layout>
    </>
  );
};

export default App;
