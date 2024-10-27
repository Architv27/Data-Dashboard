// frontend/src/pages/SignIn.tsx

import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Typography, Alert } from 'antd';

const { Title } = Typography;

const SignIn: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    const { email, password } = values;
    setLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Optionally, fetch user data from backend here
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      // Optionally, fetch or store user data in backend here
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: '40px 0' }}>
      <Title level={2} style={{ textAlign: 'center' }}>Sign In</Title>
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 20 }} />}
      <Form layout="vertical" onFinish={onFinish}>
        {/* Form Items */}
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
            }
          ]}
        >
          <Input.Password placeholder="Enter your password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Sign In
          </Button>
        </Form.Item>
      </Form>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <Button type="default" onClick={handleGoogleSignIn} block loading={loading}>
          Sign In with Google
        </Button>
      </div>
      <div style={{ textAlign: 'center' }}>
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </div>
    </div>
  );
};

export default SignIn;
