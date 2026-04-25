import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { message } from 'antd';
import { resolveAssetUrl } from '../utils/url';

function decodeJwtPayload(token: string) {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) {
        throw new Error('Invalid token payload');
    }

    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(atob(padded));
}

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
                const payload = decodeJwtPayload(token);
                login({
                    id: payload.id ? Number(payload.id) : 0,
                    username: payload.sub || payload.username || '',
                    email: payload.email || '',
                    roles: payload.roles || ['ROLE_USER'],
                    accessToken: token,
                    tokenType: 'Bearer',
                    fullName: payload.fullName || '',
                    phoneNumber: payload.phoneNumber || '',
                    address: payload.address || '',
                    avatar: resolveAssetUrl(payload.avatar) || ''
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
