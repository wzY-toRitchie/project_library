import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { User, Lock, Mail } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import api from '../api';

const { Title, Text } = Typography;

interface RegisterFormValues {
    username: string;
    email: string;
    password: string;
    confirm: string;
}

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);

    const onFinish = async (values: RegisterFormValues) => {
        setLoading(true);
        try {
            await api.post('/auth/signup', {
                username: values.username,
                email: values.email,
                password: values.password,
                role: ["user"]
            });
            message.success('注册成功，请登录！');
            navigate('/login');
        } catch (error) {
            console.error('Registration failed:', error);
            let errorMessage = '注册失败，请稍后再试';
            if (axios.isAxiosError(error)) {
                const data = error.response?.data;
                if (typeof data === 'string') {
                    errorMessage = data;
                } else if (data && typeof data.message === 'string') {
                    errorMessage = data.message;
                } else if (data && Array.isArray(data.errors) && data.errors[0]?.defaultMessage) {
                    errorMessage = data.errors[0].defaultMessage;
                }
            }
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Title level={2}>创建账号</Title>
                    <Text type="secondary">加入我们的线上书店社区</Text>
                </div>
                
                <Form
                    name="register"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: '请输入用户名' }]}
                    >
                        <Input prefix={<User size={18} style={{ color: '#bfbfbf' }} />} placeholder="用户名" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: '请输入邮箱' },
                            { type: 'email', message: '请输入有效的邮箱地址' }
                        ]}
                    >
                        <Input prefix={<Mail size={18} style={{ color: '#bfbfbf' }} />} placeholder="电子邮箱" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '请输入密码' }]}
                    >
                        <Input.Password prefix={<Lock size={18} style={{ color: '#bfbfbf' }} />} placeholder="密码" />
                    </Form.Item>

                    <Form.Item
                        name="confirm"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: '请确认密码' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('两次输入的密码不一致'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<Lock size={18} style={{ color: '#bfbfbf' }} />} placeholder="确认密码" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            注册
                        </Button>
                    </Form.Item>
                </Form>
                
                <div style={{ textAlign: 'center' }}>
                    已有账号？ <Link to="/login">立即登录</Link>
                </div>
            </Card>
        </div>
    );
};

export default Register;
