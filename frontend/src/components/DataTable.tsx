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
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  DesktopOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import './DataTable.css';

interface Product {
  key: string;
  _id?: string;
  product_name: string;
  category: string;
  discounted_price: number | null;
  actual_price: number | null;
  discount_percentage: number | null;
  rating: number | null;
  rating_count: number | null;
  about_product?: string;
  img_link?: string;
  product_link?: string;
}

// Define and export the DataTableRef interface
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

  // Fetch data from the backend
  const fetchData = () => {
    setLoading(true);
    axios
      .get('http://localhost:8000/products/')
      .then((response) => {
        const products = response.data.map((product: any) => ({
          ...product,
          key: product._id,
        }));
        setData(products);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
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
    form.setFieldsValue(product);
    setIsModalVisible(true);
  };

  const handleDelete = (key: string) => {
    axios
      .delete(`http://localhost:8000/products/${key}`)
      .then(() => {
        message.success('Product deleted successfully');
        fetchData();
      })
      .catch((error) => {
        console.error(error);
        message.error('Failed to delete product');
      });
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        if (isEditMode && currentProduct) {
          // Update existing product
          axios
            .put(`http://localhost:8000/products/${currentProduct.key}`, values)
            .then(() => {
              message.success('Product updated successfully');
              setIsModalVisible(false);
              fetchData();
            })
            .catch((error) => {
              console.error(error);
              message.error('Failed to update product');
            });
        } else {
          // Add new product
          axios
            .post('http://localhost:8000/products/', values)
            .then(() => {
              message.success('Product added successfully');
              setIsModalVisible(false);
              fetchData();
            })
            .catch((error) => {
              console.error(error);
              message.error('Failed to add product');
            });
        }
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
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
      width: 200,
      sorter: (a, b) => a.product_name.localeCompare(b.product_name),
      render: (text) => <span className="table-text">{text}</span>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 150,
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
      width: 150,
      render: (value) => (
        <span className="table-text">
          {value !== null ? `₹${value}` : 'N/A'}
        </span>
      ),
      sorter: (a, b) => (a.discounted_price || 0) - (b.discounted_price || 0),
    },
    {
      title: 'Actual Price',
      dataIndex: 'actual_price',
      key: 'actual_price',
      width: 150,
      render: (value) => (
        <span className="table-text">
          {value !== null ? `₹${value}` : 'N/A'}
        </span>
      ),
      sorter: (a, b) => (a.actual_price || 0) - (b.actual_price || 0),
    },
    {
      title: 'Discount %',
      dataIndex: 'discount_percentage',
      key: 'discount_percentage',
      width: 130,
      render: (value) => (
        <span className="table-text">
          {value !== null ? `${value}%` : 'N/A'}
        </span>
      ),
      sorter: (a, b) =>
        (a.discount_percentage || 0) - (b.discount_percentage || 0),
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: 100,
      render: (value) => (
        <span className="table-text">{value !== null ? value : 'N/A'}</span>
      ),
      sorter: (a, b) => (a.rating || 0) - (b.rating || 0),
    },
    {
      title: 'Rating Count',
      dataIndex: 'rating_count',
      key: 'rating_count',
      width: 130,
      render: (value) => (
        <span className="table-text">{value !== null ? value : 'N/A'}</span>
      ),
      sorter: (a, b) => (a.rating_count || 0) - (b.rating_count || 0),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this product?"
            onConfirm={() => handleDelete(record.key)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div className="table-container">
      <Table<Product>
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          pageSizeOptions: ['10', '25', '50'],
          showSizeChanger: true,
          defaultPageSize: 10,
        }}
        scroll={{ y: 500 }}
        rowClassName="table-row"
      />
      {/* Modal for Add/Edit */}
      <Modal
        title={isEditMode ? 'Edit Product' : 'Add Product'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={isEditMode ? 'Update' : 'Add'}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="product_name"
            label="Product Name"
            rules={[{ required: true, message: 'Please input the product name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please input the category!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="discounted_price"
            label="Discounted Price (INR)"
            rules={[
              { required: true, message: 'Please input the discounted price!' },
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item
            name="actual_price"
            label="Actual Price (INR)"
            rules={[{ required: true, message: 'Please input the actual price!' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item
            name="discount_percentage"
            label="Discount Percentage"
            rules={[
              { required: true, message: 'Please input the discount percentage!' },
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={0} max={100} />
          </Form.Item>
          <Form.Item name="rating" label="Rating">
            <InputNumber style={{ width: '100%' }} min={0} max={5} step={0.1} />
          </Form.Item>
          <Form.Item name="rating_count" label="Rating Count">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="about_product" label="About Product">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// Export the component using forwardRef
export default forwardRef<DataTableRef, {}>(DataTable);
