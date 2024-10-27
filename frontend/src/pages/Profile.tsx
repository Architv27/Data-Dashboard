// frontend/src/pages/Profile.tsx

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile, updatePassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Form, Input, Button, Typography, Alert } from 'antd';

const { Title } = Typography;

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const [displayName, setDisplayName] = useState<string>(currentUser?.displayName || '');
  const [newPassword, setNewPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleUpdateProfile = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      if (currentUser) {
        await updateProfile(auth.currentUser!, { displayName });
        setMessage('Profile updated successfully.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      if (currentUser) {
        await updatePassword(auth.currentUser!, newPassword);
        setMessage('Password updated successfully.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: '40px 0' }}>
      <Title level={2} style={{ textAlign: 'center' }}>Profile</Title>
      {message && <Alert message={message} type="success" showIcon style={{ marginBottom: 20 }} />}
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 20 }} />}
      <Form layout="vertical">
        <Form.Item label="Display Name">
          <Input 
            value={displayName} 
            onChange={e => setDisplayName(e.target.value)} 
            placeholder="Enter your display name" 
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleUpdateProfile} loading={loading} block>
            Update Profile
          </Button>
        </Form.Item>
        <Form.Item label="New Password">
          <Input.Password 
            value={newPassword} 
            onChange={e => setNewPassword(e.target.value)} 
            placeholder="Enter new password" 
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleUpdatePassword} loading={loading} block>
            Update Password
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Profile;
