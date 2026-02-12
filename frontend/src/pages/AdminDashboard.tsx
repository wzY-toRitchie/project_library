import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, message, Popconfirm, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import api from '../api';
import type { Book, Category } from '../types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AdminDashboard: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingBook, setEditingBook] = useState<Book | null>(null);
    const [form] = Form.useForm();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || !user.roles.includes('ADMIN')) {
            message.error('无权访问管理员后台');
            navigate('/');
            return;
        }
        fetchBooks();
        fetchCategories();
    }, [user, navigate]);

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const response = await api.get('/books');
            setBooks(response.data);
        } catch {
            message.error('获取图书列表失败');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleAdd = () => {
        setEditingBook(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record: Book) => {
        setEditingBook(record);
        form.setFieldsValue({
            ...record,
            categoryId: record.category?.id
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/books/${id}`);
            message.success('删除成功');
            fetchBooks();
        } catch {
            message.error('删除失败');
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const bookData = {
                ...values,
                category: categories.find(c => c.id === values.categoryId)
            };

            if (editingBook) {
                await api.put(`/books/${editingBook.id}`, bookData);
                message.success('更新成功');
            } else {
                await api.post('/books', bookData);
                message.success('添加成功');
            }
            setIsModalVisible(false);
            fetchBooks();
        } catch (error) {
            console.error('Operation failed:', error);
            message.error('操作失败');
        }
    };

    const columns: ColumnsType<Book> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: '封面',
            dataIndex: 'coverImage',
            key: 'coverImage',
            render: (text: string) => <img src={text} alt="cover" style={{ width: 40, height: 60, objectFit: 'cover' }} />,
            width: 100,
        },
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: '作者',
            dataIndex: 'author',
            key: 'author',
        },
        {
            title: '价格',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => `¥${price}`,
        },
        {
            title: '库存',
            dataIndex: 'stock',
            key: 'stock',
        },
        {
            title: '分类',
            dataIndex: 'category',
            key: 'category',
            render: (category: Category) => category?.name || '未分类',
        },
        {
            title: '操作',
            key: 'action',
            render: (_: unknown, record: Book) => (
                <Space size="middle">
                    <Button icon={<Edit size={16} />} onClick={() => handleEdit(record)}>
                        编辑
                    </Button>
                    <Popconfirm
                        title="确定要删除这本书吗?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="是"
                        cancelText="否"
                    >
                        <Button danger icon={<Trash2 size={16} />}>
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Title level={2}>图书管理</Title>
                <Button type="primary" icon={<Plus size={16} />} onClick={handleAdd}>
                    添加图书
                </Button>
            </div>

            <Table 
                columns={columns} 
                dataSource={books} 
                rowKey="id" 
                loading={loading}
                pagination={{ pageSize: 10 }} 
            />

            <Modal
                title={editingBook ? "编辑图书" : "添加图书"}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="title"
                        label="图书标题"
                        rules={[{ required: true, message: '请输入图书标题' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Space style={{ display: 'flex', width: '100%' }} size="large">
                        <Form.Item
                            name="author"
                            label="作者"
                            rules={[{ required: true, message: '请输入作者' }]}
                            style={{ flex: 1 }}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="categoryId"
                            label="分类"
                            rules={[{ required: true, message: '请选择分类' }]}
                            style={{ flex: 1 }}
                        >
                            <Select placeholder="选择分类">
                                {categories.map(c => (
                                    <Option key={c.id} value={c.id}>{c.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Space>

                    <Space style={{ display: 'flex', width: '100%' }} size="large">
                        <Form.Item
                            name="price"
                            label="价格"
                            rules={[{ required: true, message: '请输入价格' }]}
                            style={{ flex: 1 }}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => (value ?? '').replace(/¥\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                        <Form.Item
                            name="stock"
                            label="库存"
                            rules={[{ required: true, message: '请输入库存数量' }]}
                            style={{ flex: 1 }}
                        >
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                    </Space>

                    <Form.Item
                        name="description"
                        label="简介"
                    >
                        <TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="coverImage"
                        label="封面图片链接"
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminDashboard;
