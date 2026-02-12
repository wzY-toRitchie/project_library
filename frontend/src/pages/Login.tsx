import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { User, Lock } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

interface LoginFormValues {
    username: string;
    password: string;
}

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = React.useState(false);

    const onFinish = async (values: LoginFormValues) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/signin', values);
            login(response.data);
            message.success('登录成功！');
            navigate('/');
        } catch (error) {
            console.error('Login failed:', error);
            const errorMessage = axios.isAxiosError(error)
                ? (typeof error.response?.data === 'string' ? error.response?.data : '用户名或密码错误')
                : '用户名或密码错误';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Title level={2}>欢迎回来</Title>
                    <Text type="secondary">登录您的线上书店账号</Text>
                </div>
                
                <Form
                    name="login"
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
                        name="password"
                        rules={[{ required: true, message: '请输入密码' }]}
                    >
                        <Input.Password prefix={<Lock size={18} style={{ color: '#bfbfbf' }} />} placeholder="密码" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            登录
                        </Button>
                    </Form.Item>
                </Form>
                
                <div style={{ textAlign: 'center' }}>
                    还没有账号？ <Link to="/register">立即注册</Link>
                </div>
            </Card>
        </div>
    );
};

export default Login;
