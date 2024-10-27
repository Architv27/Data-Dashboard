// frontend/src/pages/Dashboard.tsx

import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Typography, Alert } from 'antd';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import DataTable from '../components/DataTable';
import UserReviews from '../components/UserReviews';
import HelpSection from '../components/HelpSection';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/${currentUser.uid}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }

          const data = await response.json();
          setUserData(data);
        } catch (err: any) {
          setError(err.message);
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  return (
    <div>
      <Title level={2}>Welcome to Your Dashboard</Title>
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 20 }} />}
      {userData ? (
        <div>
          <p><strong>Name:</strong> {userData.displayName}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          {/* Add more user-specific information if needed */}
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
      <AnalyticsDashboard />
      <DataTable />
      <UserReviews />
      <HelpSection />
    </div>
  );
};

export default Dashboard;
