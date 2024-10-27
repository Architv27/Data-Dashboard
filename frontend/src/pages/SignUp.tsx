// frontend/src/pages/SignUp.tsx

import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Typography, Alert, Modal } from 'antd';

const { Title } = Typography;

const SignUp: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // State to control Modal visibility
  const navigate = useNavigate();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onFinish = async (values: any) => {
    const { displayName, email, password } = values;
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName });
      }
      // Prepare user data
      const userData = {
        uid: userCredential.user.uid,
        displayName: displayName,
        email: userCredential.user.email,
        // Add other relevant fields
      };

      // Fetch the backend URL from environment variables
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      if (!backendUrl) {
        throw new Error("Backend URL is not defined. Please set REACT_APP_BACKEND_URL in your .env file.");
      }

      // Send user data to backend
      const response = await fetch(`${backendUrl}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await userCredential.user.getIdToken()}`
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to store user data in backend');
      }

      setIsModalOpen(false); // Close the modal on successful sign-up
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: '40px 0' }}>
      <Title level={2} style={{ textAlign: 'center' }}>Sign Up</Title>
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 20 }} />}
      <Button type="primary" onClick={showModal} block>
        Open Sign Up Modal
      </Button>
      <Modal
        title="Sign Up"
        open={isModalOpen} // Use `open` instead of `visible`
        onCancel={handleCancel}
        footer={null} // Remove default footer
      >
        <Form layout="vertical" onFinish={onFinish}>
          {/* Form Items */}
          <Form.Item
            label="Display Name"
            name="displayName"
            rules={[{ required: true, message: 'Please enter your display name' }]}
          >
            <Input placeholder="Enter your display name" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { 
                required: true, 
                message: 'Please enter your email' 
              },
              {
                type: 'email',
                message: 'Please enter a valid email'
              }
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[
              { 
                required: true, 
                message: 'Please enter your password' 
              },
              {
                min: 6,
                message: 'Password must be at least 6 characters'
              }
            ]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { 
                required: true, 
                message: 'Please confirm your password' 
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm your password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Sign Up
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center' }}>
          Already have an account? <Link to="/signin">Sign In</Link>
        </div>
      </Modal>
    </div>
  );
};

export default SignUp;
