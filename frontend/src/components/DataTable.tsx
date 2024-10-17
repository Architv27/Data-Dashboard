// src/components/DataTable.tsx

import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
} from 'react';
import axios from 'axios';
import {
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Popconfirm,
  message,
  Tooltip,
  Select,
  Space,
  Typography,
  Avatar,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  DesktopOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import './DataTable.css';

const { Text, Title } = Typography;
const { Option } = Select;

interface Product {
  key: string;
  _id?: string;
  product_name: string;
  category: string;
  discounted_price: string;
  actual_price: string;
  discount_percentage: string;
  rating: number;
  rating_count: string;
  about_product?: string;
  img_link?: string;
  product_link?: string;
}

export interface DataTableRef {
  handleAdd: () => void;
}

const DataTable: ForwardRefRenderFunction<DataTableRef, {}> = (props, ref) => {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    handleAdd,
  }));

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/data/`);
      const products: Product[] = response.data.map((product: any) => ({
        ...product,
        key: product._id,
        discounted_price: product.discounted_price?.toString() || '',
        actual_price: product.actual_price?.toString() || '',
        discount_percentage: product.discount_percentage?.toString() || '',
        rating_count: product.rating_count?.toString() || '',
      }));
      setData(products);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Failed to fetch products from the database.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setIsEditMode(false);
    setCurrentProduct(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (product: Product) => {
    setIsEditMode(true);
    setCurrentProduct(product);
    form.setFieldsValue({
      ...product,
      discounted_price: product.discounted_price,
      actual_price: product.actual_price,
      discount_percentage: product.discount_percentage,
      rating_count: product.rating_count,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (key: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/products/${key}`);
      message.success('Product deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
      message.error('Failed to delete product');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const processedValues = {
        ...values,
        discounted_price: values.discounted_price.toString(),
        actual_price: values.actual_price.toString(),
        discount_percentage: values.discount_percentage.toString(),
        rating_count: values.rating_count.toString(),
        rating: Math.floor(values.rating),
      };

      if (isEditMode && currentProduct) {
        await axios.put(`${API_BASE_URL}/products/${currentProduct.key}`, processedValues);
        message.success('Product updated successfully');
      } else {
        await axios.post(`${API_BASE_URL}/products/`, processedValues);
        message.success('Product added successfully');
      }
      setIsModalVisible(false);
      fetchData();
    } catch (error: any) {
      if (error.response) {
        console.error('API Error:', error.response);
        message.error(
          `Failed to ${isEditMode ? 'update' : 'add'} product: ${
            error.response.data.detail || ''
          }`
        );
      } else if (error.request) {
        console.error('No response:', error.request);
        message.error('No response from the server. Please try again later.');
      } else {
        console.error('Error:', error.message);
        message.error(`Failed to ${isEditMode ? 'update' : 'add'} product.`);
      }
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const getCategoryIcon = (category: string) => {
    const mainCategory = category.split('|')[0].trim().toLowerCase();
    switch (mainCategory) {
      case 'electronics':
        return <DesktopOutlined style={{ marginRight: 8, color: '#1E88E5' }} />;
      case 'clothing':
        return <AppstoreOutlined style={{ marginRight: 8, color: '#D32F2F' }} />;
      case 'home':
        return <ShoppingCartOutlined style={{ marginRight: 8, color: '#7CB342' }} />;
      default:
        return <AppstoreOutlined style={{ marginRight: 8, color: '#757575' }} />;
    }
  };

  const columns: ColumnsType<Product> = [
    {
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
      width: 300,
      fixed: 'left',
      sorter: (a, b) => a.product_name.localeCompare(b.product_name),
      render: (text, record) => (
        <Space size="middle">
          {record.img_link ? (
            <Avatar shape="square" size={64} src={record.img_link} />
          ) : (
            <Avatar shape="square" size={64} icon={<QuestionCircleOutlined />} />
          )}
          <Text strong style={{ fontSize: '16px' }}>
            {text}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 200,
      filters: [
        { text: 'Electronics', value: 'Electronics' },
        { text: 'Clothing', value: 'Clothing' },
        { text: 'Home', value: 'Home' },
      ],
      onFilter: (value, record) => record.category.includes(value as string),
      render: (text) => (
        <Text>
          {getCategoryIcon(text)}
          {text}
        </Text>
      ),
    },
    {
      title: 'Price',
      children: [
        {
          title: 'Discounted',
          dataIndex: 'discounted_price',
          key: 'discounted_price',
          width: 120,
          sorter: (a, b) =>
            parseFloat(a.discounted_price || '0') - parseFloat(b.discounted_price || '0'),
          render: (value) => (
            <Text style={{ color: '#1E88E5' }}>{value !== '' ? `₹${value}` : 'N/A'}</Text>
          ),
        },
        {
          title: 'Actual',
          dataIndex: 'actual_price',
          key: 'actual_price',
          width: 120,
          sorter: (a, b) =>
            parseFloat(a.actual_price || '0') - parseFloat(b.actual_price || '0'),
          render: (value) => (
            <Text delete type="secondary">
              {value !== '' ? `₹${value}` : 'N/A'}
            </Text>
          ),
        },
      ],
    },
    {
      title: 'Discount %',
      dataIndex: 'discount_percentage',
      key: 'discount_percentage',
      width: 120,
      sorter: (a, b) =>
        parseFloat(a.discount_percentage || '0') - parseFloat(b.discount_percentage || '0'),
      render: (value) => (
        <Text style={{ color: '#D32F2F' }}>{value !== '' ? `${value}%` : 'N/A'}</Text>
      ),
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: 80,
      sorter: (a, b) => (a.rating || 0) - (b.rating || 0),
      render: (value) => (
        <Text style={{ color: '#FF9800' }}>{value !== null ? `${value}★` : 'N/A'}</Text>
      ),
    },
    {
      title: 'Rating Count',
      dataIndex: 'rating_count',
      key: 'rating_count',
      width: 100,
      sorter: (a, b) => parseInt(a.rating_count || '0') - parseInt(b.rating_count || '0'),
      render: (value) => <Text>{value !== '' ? value : 'N/A'}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button
              type="link"
              icon={<EditOutlined style={{ color: '#1E88E5' }} />}
              onClick={() => handleEdit(record)}
              aria-label={`Edit ${record.product_name}`}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure to delete this product?"
              onConfirm={() => handleDelete(record.key)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="link"
                icon={<DeleteOutlined style={{ color: '#D32F2F' }} />}
                aria-label={`Delete ${record.product_name}`}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="table-container">
      {/* Header */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Title level={3} style={{ margin: 0, fontFamily: 'Arial, sans-serif' }}>
          Product Management
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Product
        </Button>
      </div>

      <Table<Product>
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          pageSizeOptions: ['10', '25', '50', '100'],
          showSizeChanger: true,
          defaultPageSize: 10,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        scroll={{ x: 1200, y: 500 }}
        rowClassName="table-row"
        bordered
        size="middle"
      />

      {/* Modal for Add/Edit */}
      <Modal
        title={
          <Title level={4} style={{ margin: 0 }}>
            {isEditMode ? 'Edit Product' : 'Add Product'}
          </Title>
        }
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={isEditMode ? 'Update' : 'Add'}
        okButtonProps={{
          type: 'primary',
          disabled: loading,
        }}
        cancelButtonProps={{
          disabled: loading,
        }}
        destroyOnClose
        centered
      >
        <Form form={form} layout="vertical" className="modal-form">
          {/* ...form items remain unchanged... */}
        </Form>
      </Modal>
    </div>
  );
};

export default forwardRef<DataTableRef, {}>(DataTable);
