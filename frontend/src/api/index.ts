import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Module-level cache for JWT token (avoids repeated localStorage reads)
let cachedToken: string | null = null;
let tokenChecked = false;

function getToken(): string | null {
    if (!tokenChecked) {
        tokenChecked = true;
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                cachedToken = user?.accessToken ?? null;
            }
        } catch {
            localStorage.removeItem('user');
            cachedToken = null;
        }
    }
    return cachedToken;
}

// Call this from AuthContext login/logout to keep cache in sync
export function clearTokenCache(): void {
    cachedToken = null;
    tokenChecked = false;
}

// Request interceptor - 自动附加 JWT Token
api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - 处理认证失败
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token 过期或无效，清除本地存储并跳转登录
            clearTokenCache();
            localStorage.removeItem('user');
            // 避免在登录页重复跳转
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
