import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { message } from 'antd';
import { getAiRecommendations } from '../api/ai';
import type { AiRecommendation } from '../api/ai';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import type { Book } from '../types';
import { FALLBACK_COVER } from '../utils/constants';

const QUICK_SUGGESTIONS = [
    { label: 'Java进阶', icon: 'computer' },
    { label: '入门Python', icon: 'code' },
    { label: '科幻小说', icon: 'rocket_launch' },
    { label: '经典文学', icon: 'auto_stories' },
    { label: '人工智能', icon: 'smart_toy' },
    { label: '心理学', icon: 'psychology' },
    { label: '历史传记', icon: 'history_edu' },
    { label: '理财投资', icon: 'trending_up' },
];

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    recommendations?: AiRecommendation[];
}

const AiRecommend: React.FC = () => {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [chat, setChat] = useState<ChatMessage[]>([]);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat, loading]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSend = async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || loading) return;

        const userMsg: ChatMessage = { role: 'user', content: trimmed };
        setChat((prev) => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await getAiRecommendations(trimmed);
            const aiMsg: ChatMessage = {
                role: 'assistant',
                content: res.reply || res.summary || '为你找到了一些推荐书籍，希望你会喜欢。',
                recommendations: res.recommendations,
            };
            setChat((prev) => [...prev, aiMsg]);
        } catch {
            message.error('AI推荐服务暂时不可用，请稍后重试');
            const errMsg: ChatMessage = {
                role: 'assistant',
                content: '抱歉，我现在有点累了，请稍后再试。如果问题持续，请检查网络连接。',
            };
            setChat((prev) => [...prev, errMsg]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSend(input);
    };

    const handleAddToCart = (rec: AiRecommendation) => {
        if (!isAuthenticated) {
            message.warning('请先登录');
            return;
        }
        const book: Book = {
            id: rec.bookId,
            title: rec.title,
            author: rec.author,
            price: rec.price,
            coverImage: rec.coverImage,
            stock: 1,
            description: '',
            category: { id: 0, name: '' },
        };
        addToCart(book);
        message.success(`已将《${rec.title}》加入购物车`);
    };

    const lastRecommendations = [...chat]
        .reverse()
        .find((m) => m.role === 'assistant' && m.recommendations && m.recommendations.length > 0)
        ?.recommendations;

    return (
        <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-white text-xl" aria-hidden="true">auto_awesome</span>
                </div>
                <div>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">AI 智能荐书</h1>
                    <p className="text-xs text-slate-400">基于大语言模型 · 为你精准推荐</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 text-xs text-green-500">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    在线
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left panel — Chat */}
                <div className="w-full md:w-[45%] flex flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {chat.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center px-8">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-6">
                                    <span className="material-symbols-outlined text-5xl text-primary" aria-hidden="true">psychology</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">
                                    你好！我是你的AI阅读顾问 <span className="material-symbols-outlined text-base align-middle" aria-hidden="true">menu_book</span>
                                </h3>
                                <p className="text-slate-400 dark:text-slate-500 leading-relaxed mb-8 max-w-sm">
                                    告诉我你喜欢什么类型的书，或者最近想读什么方向的内容，我会根据你的阅读偏好为你精准推荐。
                                </p>
                                <div className="w-full max-w-md">
                                    <p className="text-xs text-slate-400 mb-3 text-left">试试这些热门话题：</p>
                                    <div className="flex flex-wrap gap-2">
                                        {QUICK_SUGGESTIONS.map((s) => (
                                            <button
                                                key={s.label}
                                                onClick={() => handleSend(s.label)}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">{s.icon}</span>
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {chat.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-2.5 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    {msg.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center flex-shrink-0 mt-1 shadow">
                                            <span className="material-symbols-outlined text-sm text-white" aria-hidden="true">auto_awesome</span>
                                        </div>
                                    )}
                                    {msg.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center flex-shrink-0 mt-1">
                                            <span className="material-symbols-outlined text-sm text-slate-600 dark:text-slate-300" aria-hidden="true">person</span>
                                        </div>
                                    )}
                                    <div>
                                        <div
                                            className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                                                msg.role === 'user'
                                                    ? 'bg-primary text-white rounded-br-sm'
                                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-sm'
                                            }`}
                                        >
                                            {msg.content}
                                        </div>
                                        {msg.recommendations && msg.recommendations.length > 0 && (
                                            <p className="text-xs text-slate-400 mt-1.5 ml-1">
                                                <span className="material-symbols-outlined text-[14px] align-middle" aria-hidden="true">auto_stories</span> 已推荐 {msg.recommendations.length} 本书，见右侧 →
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="flex gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center flex-shrink-0 mt-1 shadow">
                                        <span className="material-symbols-outlined text-sm text-white animate-spin" aria-hidden="true">progress_activity</span>
                                    </div>
                                    <div className="px-4 py-3.5 rounded-2xl rounded-bl-sm bg-slate-100 dark:bg-slate-700">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                            <span className="text-xs text-slate-400">AI 正在思考中…</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input area */}
                    <div className="border-t border-slate-200 dark:border-slate-700 p-4">
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                name="message"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="告诉我你想找什么类型的书..."
                                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="px-5 py-3 bg-gradient-to-r from-primary to-purple-500 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shadow-lg shadow-primary/20"
                                aria-label="发送"
                            >
                                <span className="material-symbols-outlined text-xl" aria-hidden="true">send</span>
                            </button>
                        </form>
                        <p className="text-xs text-slate-400 mt-2 text-center">
                            AI 基于大语言模型生成，仅供参考。
                        </p>
                    </div>
                </div>

                {/* Right panel — Recommendations */}
                <div className="hidden md:block w-[55%] overflow-y-auto bg-slate-50 dark:bg-slate-900">
                    {!lastRecommendations ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-8">
                            <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600" aria-hidden="true">menu_book</span>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-500 dark:text-slate-400 mb-2">
                                推荐结果将在这里展示
                            </h3>
                            <p className="text-sm text-slate-400 dark:text-slate-500 max-w-sm">
                                在左侧对话框中描述你的阅读需求，AI 会分析你的偏好并推荐最适合你的书籍
                            </p>
                        </div>
                    ) : (
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-primary" aria-hidden="true">auto_awesome</span>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                                    为你推荐以下图书
                                </h2>
                            </div>
                            {lastRecommendations.map((rec, idx) => (
                                <div
                                    key={rec.bookId}
                                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow group"
                                >
                                    <div className="flex gap-5 p-5">
                                        {/* Rank + Cover */}
                                        <div className="relative flex-shrink-0">
                                            <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shadow z-10">
                                                {idx + 1}
                                            </div>
                                            <Link
                                                to={`/book/${rec.bookId}`}
                                                className="w-32 h-44 cursor-pointer overflow-hidden rounded-xl"
                                            >
                                                <img
                                                    src={
                                                        rec.coverImage ||
                                                        FALLBACK_COVER
                                                    }
                                                    alt={rec.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    loading="lazy"
                                                    width={128}
                                                    height={176}
                                                />
                                            </Link>
                                            {rec.matchScore > 0 && (
                                                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-primary to-purple-500 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow">
                                                    {rec.matchScore}%
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 flex flex-col justify-between min-w-0">
                                            <div>
                                                <button
                                                    className="font-bold text-lg text-slate-900 dark:text-white cursor-pointer hover:text-primary transition-colors line-clamp-1 text-left w-full"
                                                    onClick={() => navigate(`/book/${rec.bookId}`)}
                                                >
                                                    {rec.title}
                                                </button>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                                    {rec.author}
                                                </p>
                                                <p className="text-primary font-bold text-xl mt-2">
                                                    ¥{rec.price.toFixed(2)}
                                                </p>

                                                {/* Reason — quote style */}
                                                <div className="mt-3 pl-4 border-l-[3px] border-primary/50 bg-primary/5 dark:bg-primary/10 rounded-r-lg px-3 py-2.5">
                                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                                        <span className="material-symbols-outlined text-base align-middle" aria-hidden="true">lightbulb</span> {rec.reason}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-3 mt-4">
                                                <button
                                                    onClick={() => navigate(`/book/${rec.bookId}`)}
                                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-primary border border-primary rounded-xl hover:bg-primary/5 transition-colors"
                                                >
                                                    查看详情
                                                </button>
                                                <button
                                                    onClick={() => handleAddToCart(rec)}
                                                    className="flex-1 px-4 py-2.5 text-sm font-medium bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                                                >
                                                    <span className="material-symbols-outlined text-lg" aria-hidden="true">add_shopping_cart</span>
                                                    加入购物车
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AiRecommend;
