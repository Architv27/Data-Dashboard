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
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  DesktopOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import './DataTable.css';

// Define the Product interface with appropriate types
interface Product {
  key: string;
  _id?: string;
  product_name: string;
  category: string;
  discounted_price: string; // Changed to string
  actual_price: string;     // Changed to string
  discount_percentage: string; // Changed to string
  rating: number;           // Remains as number (integer)
  rating_count: string;     // Changed to string
  about_product?: string;
  img_link?: string;
  product_link?: string;
}

// Define and export the DataTableRef interface for parent component access
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

  // Expose handleAdd to parent component via ref
  useImperativeHandle(ref, () => ({
    handleAdd,
  }));

  // Base API URL from environment variables
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  // Fetch data from the backend
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

  // CRUD Functions
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
      // Process form values
      const processedValues = {
        ...values,
        discounted_price: values.discounted_price.toString(),
        actual_price: values.actual_price.toString(),
        discount_percentage: values.discount_percentage.toString(),
        rating_count: values.rating_count.toString(),
        rating: Math.floor(values.rating), // Ensure rating is integer
      };

      if (isEditMode && currentProduct) {
        // Update existing product
        await axios.put(`${API_BASE_URL}/products/${currentProduct.key}`, processedValues);
        message.success('Product updated successfully');
      } else {
        // Add new product
        await axios.post(`${API_BASE_URL}/products/`, processedValues);
        message.success('Product added successfully');
      }
      setIsModalVisible(false);
      fetchData();
    } catch (error: any) {
      if (error.response) {
        // Server responded with a status other than 2xx
        console.error('API Error:', error.response);
        message.error(`Failed to ${isEditMode ? 'update' : 'add'} product: ${error.response.data.detail || ''}`);
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response:', error.request);
        message.error('No response from the server. Please try again later.');
      } else {
        // Something else happened
        console.error('Error:', error.message);
        message.error(`Failed to ${isEditMode ? 'update' : 'add'} product.`);
      }
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Function to get the icon based on the category
  const getCategoryIcon = (category: string) => {
    const mainCategory = category.split('|')[0].trim().toLowerCase();
    switch (mainCategory) {
      case 'electronics':
        return <DesktopOutlined style={{ marginRight: 8, color: '#1E88E5' }} />;
      case 'clothing':
        return <AppstoreOutlined style={{ marginRight: 8, color: '#D32F2F' }} />;
      case 'home':
        return <ShoppingCartOutlined style={{ marginRight: 8, color: '#7CB342' }} />;
      // Add more cases as needed
      default:
        return <AppstoreOutlined style={{ marginRight: 8, color: '#757575' }} />;
    }
  };

  // Columns with action buttons and category icons
  const columns: ColumnsType<Product> = [
    {
      title: 'Product Name',
      dataIndex: 'product_name',
      key: 'product_name',
      // Removed fixed width for responsiveness
      sorter: (a, b) => a.product_name.localeCompare(b.product_name),
      render: (text) => <span className="table-text">{text}</span>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      // Removed fixed width for responsiveness
      filters: [
        { text: 'Electronics', value: 'Electronics' },
        { text: 'Clothing', value: 'Clothing' },
        { text: 'Home', value: 'Home' },
        // Add more categories as needed
      ],
      onFilter: (value, record) => record.category.includes(value as string),
      render: (text) => (
        <span className="table-text">
          {getCategoryIcon(text)}
          {text}
        </span>
      ),
    },
    {
      title: 'Discounted Price',
      dataIndex: 'discounted_price',
      key: 'discounted_price',
      sorter: (a, b) => parseFloat(a.discounted_price || '0') - parseFloat(b.discounted_price || '0'),
      render: (value) => (
        <span className="table-text">
          {value !== '' ? `₹${value}` : 'N/A'}
        </span>
      ),
    },
    {
      title: 'Actual Price',
      dataIndex: 'actual_price',
      key: 'actual_price',
      sorter: (a, b) => parseFloat(a.actual_price || '0') - parseFloat(b.actual_price || '0'),
      render: (value) => (
        <span className="table-text">
          {value !== '' ? `₹${value}` : 'N/A'}
        </span>
      ),
    },
    {
      title: 'Discount %',
      dataIndex: 'discount_percentage',
      key: 'discount_percentage',
      sorter: (a, b) =>
        parseFloat(a.discount_percentage || '0') - parseFloat(b.discount_percentage || '0'),
      render: (value) => (
        <span className="table-text">
          {value !== '' ? `${value}%` : 'N/A'}
        </span>
      ),
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      sorter: (a, b) => (a.rating || 0) - (b.rating || 0),
      render: (value) => (
        <span className="table-text">{value !== null ? value : 'N/A'}</span>
      ),
    },
    {
      title: 'Rating Count',
      dataIndex: 'rating_count',
      key: 'rating_count',
      sorter: (a, b) => parseInt(a.rating_count || '0') - parseInt(b.rating_count || '0'),
      render: (value) => (
        <span className="table-text">{value !== '' ? value : 'N/A'}</span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <>
          <Tooltip title="Edit">
            <Button
              type="text"
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
                type="text"
                icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
                aria-label={`Delete ${record.product_name}`}
              />
            </Popconfirm>
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <div className="table-container">
      {/* Optional: Add a search bar or filters here for enhanced intuitiveness */}
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
        scroll={{ y: 500 }} // Removed horizontal scroll by not setting x
        rowClassName="table-row"
        bordered
        size="middle"
        // Removed 'x: max-content' to prevent horizontal scrolling
      />
      {/* Modal for Add/Edit */}
      <Modal
        title={isEditMode ? 'Edit Product' : 'Add Product'}
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
          <Form.Item
            name="product_name"
            label="Product Name"
            rules={[{ required: true, message: 'Please input the product name!' }]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please input the category!' }]}
          >
            <Input placeholder="Enter category (e.g., Electronics | Mobile Phones)" />
          </Form.Item>
          <Form.Item
            name="discounted_price"
            label="Discounted Price (INR)"
            rules={[
              { required: true, message: 'Please input the discounted price!' },
              { pattern: /^[0-9]+(\.[0-9]{1,2})?$/, message: 'Please enter a valid price!' },
            ]}
          >
            <Input placeholder="e.g., 29999" />
          </Form.Item>
          <Form.Item
            name="actual_price"
            label="Actual Price (INR)"
            rules={[
              { required: true, message: 'Please input the actual price!' },
              { pattern: /^[0-9]+(\.[0-9]{1,2})?$/, message: 'Please enter a valid price!' },
            ]}
          >
            <Input placeholder="e.g., 34999" />
          </Form.Item>
          <Form.Item
            name="discount_percentage"
            label="Discount Percentage"
            rules={[
              { required: true, message: 'Please input the discount percentage!' },
              {
                type: 'string',
                pattern: /^(\d{1,2}(\.\d{1,2})?)$/,
                message: 'Please enter a valid discount percentage!',
              },
            ]}
          >
            <Input placeholder="e.g., 14" />
          </Form.Item>
          <Form.Item
            name="rating"
            label="Rating"
            rules={[
              { required: true, message: 'Please input the rating!' },
              {
                type: 'number',
                min: 0,
                max: 5,
                message: 'Rating must be between 0 and 5',
              },
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={0} max={5} step={1} />
          </Form.Item>
          <Form.Item
            name="rating_count"
            label="Rating Count"
            rules={[
              { required: true, message: 'Please input the rating count!' },
              { pattern: /^[0-9]+$/, message: 'Please enter a valid rating count!' },
            ]}
          >
            <Input placeholder="e.g., 150" />
          </Form.Item>
          <Form.Item name="about_product" label="About Product">
            <Input.TextArea placeholder="Provide a brief description of the product" />
          </Form.Item>
          <Form.Item name="img_link" label="Image Link">
            <Input placeholder="http://example.com/image.jpg" />
          </Form.Item>
          <Form.Item name="product_link" label="Product Link">
            <Input placeholder="http://example.com/product" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// Export the component using forwardRef
export default forwardRef<DataTableRef, {}>(DataTable);
