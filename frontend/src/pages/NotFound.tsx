import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4">
            <div className="text-center">
                <div className="text-9xl font-black text-primary/20 mb-4">404</div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    页面未找到
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
                    抱歉，您访问的页面不存在或已被移除。请检查URL是否正确，或返回首页继续浏览。
                </p>
                <div className="flex gap-4 justify-center">
                    <Link
                        to="/"
                        className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                    >
                        返回首页
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        返回上一页
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
