import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { message, Spin } from 'antd';

const OAuthCallback: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const userId = searchParams.get('userId');
        const username = searchParams.get('username');
        const email = searchParams.get('email');

        if (token && userId) {
            const userData = {
                id: Number(userId),
                username: username || '',
                email: email || '',
                accessToken: token,
                tokenType: 'Bearer',
                roles: ['ROLE_USER'],
            };

            login(userData);
            message.success('登录成功');
            navigate('/');
        } else {
            message.error('OAuth 登录失败，请重试');
            navigate('/login');
        }
    }, [searchParams, login, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <Spin size="large" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">正在完成登录...</p>
            </div>
        </div>
    );
};

export default OAuthCallback;
