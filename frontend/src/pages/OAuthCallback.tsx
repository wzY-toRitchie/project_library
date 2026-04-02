import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { message } from 'antd';

const OAuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
            message.error('登录失败，请重试');
            navigate('/login');
            return;
        }

        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                login({
                    id: payload.sub ? Number(payload.sub) : 0,
                    username: payload.username || '',
                    email: payload.email || '',
                    roles: payload.roles || [],
                    accessToken: token,
                    tokenType: 'Bearer'
                });
                message.success('登录成功！');
                navigate('/');
            } catch {
                message.error('登录信息解析失败');
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
    }, [searchParams, login, navigate]);

    return (
        <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
    );
};

export default OAuthCallback;
