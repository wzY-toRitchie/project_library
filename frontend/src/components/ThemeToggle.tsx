import React, { useEffect, useState } from 'react';

const ThemeToggle: React.FC = () => {
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            return document.documentElement.classList.contains('dark') || 
                   localStorage.getItem('theme') === 'dark' ||
                   (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        return false;
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    return (
        <button 
            onClick={() => setIsDark(!isDark)}
            className="fixed bottom-6 right-6 z-50 p-3 bg-white dark:bg-slate-800 shadow-lg rounded-full text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors border border-slate-200 dark:border-slate-700"
            type="button"
            title={isDark ? "切换到亮色模式" : "切换到暗色模式"}
        >
            <span className={`material-symbols-outlined block ${isDark ? 'hidden' : 'block'}`}>dark_mode</span>
            <span className={`material-symbols-outlined hidden ${isDark ? 'block' : 'hidden'}`}>light_mode</span>
        </button>
    );
};

export default ThemeToggle;
