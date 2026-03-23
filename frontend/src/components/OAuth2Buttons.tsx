import React from 'react';

interface OAuthProvider {
    id: string;
    name: string;
    icon: string;
    bgColor: string;
    hoverColor: string;
}

const providers: OAuthProvider[] = [
    { id: 'github', name: 'GitHub', icon: 'code', bgColor: 'bg-gray-800', hoverColor: 'hover:bg-gray-900' },
    { id: 'google', name: 'Google', icon: 'globe', bgColor: 'bg-blue-500', hoverColor: 'hover:bg-blue-600' },
    { id: 'gitee', name: 'Gitee', icon: 'git_branch', bgColor: 'bg-red-600', hoverColor: 'hover:bg-red-700' },
    { id: 'xiaomi', name: '小米', icon: 'smartphone', bgColor: 'bg-orange-500', hoverColor: 'hover:bg-orange-600' },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const OAuth2Buttons: React.FC = () => {
    const handleOAuthLogin = (providerId: string) => {
        window.location.href = `${API_BASE_URL}/api/oauth2/authorization/${providerId}`;
    };

    return (
        <div className="mt-6">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">其他登录方式</span>
                </div>
            </div>
            <div className="mt-6 grid grid-cols-4 gap-3">
                {providers.map((provider) => (
                    <button
                        key={provider.id}
                        onClick={() => handleOAuthLogin(provider.id)}
                        className={`w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm ${provider.bgColor} text-white text-sm font-medium ${provider.hoverColor} transition-colors`}
                        title={`使用 ${provider.name} 登录`}
                    >
                        <span className="material-symbols-outlined text-lg">{provider.icon}</span>
                    </button>
                ))}
            </div>
            <div className="mt-3 text-center text-xs text-gray-500">
                点击按钮将跳转到第三方平台进行授权
            </div>
        </div>
    );
};

export default OAuth2Buttons;
