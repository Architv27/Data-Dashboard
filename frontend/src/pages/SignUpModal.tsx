// frontend/src/components/SignUpModal.tsx

import React from 'react';
import { Modal } from 'antd';
import SignUpForm from '../components/SignUpForm';
import { useNavigate } from 'react-router-dom';

const SignUpModal: React.FC = () => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate(-1); // Close the modal by navigating back
  };

  return (
    <Modal
      title="Sign Up"
      open={true}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
      centered
      width={500}
    >
      <SignUpForm />
    </Modal>
  );
};

export default SignUpModal;
