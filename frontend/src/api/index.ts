import axios from 'axios';

const LOGIN_PATH = '/login';
const REDIRECT_PARAM = 'redirect';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    timeout: 120000,  // AI 推荐可能需要较长时间
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
            clearTokenCache();
            localStorage.removeItem('user');

            if (window.location.pathname !== LOGIN_PATH) {
                const redirectTarget = `${window.location.pathname}${window.location.search}${window.location.hash}`;
                const loginUrl = new URL(LOGIN_PATH, window.location.origin);
                loginUrl.searchParams.set(REDIRECT_PARAM, redirectTarget);
                window.location.assign(loginUrl.toString());
            }
        }
        return Promise.reject(error);
    }
);

export default api;
