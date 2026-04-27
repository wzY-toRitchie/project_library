import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { message } from 'antd';
import { getAiRecommendations } from '../api/ai';
import type { AiRecommendation } from '../api/ai';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import type { Book } from '../types';
import { FALLBACK_COVER } from '../utils/constants';

const QUICK_SUGGESTIONS = [
    { label: 'Java进阶', icon: '⌨️' },
    { label: '入门Python', icon: '🐍' },
    { label: '科幻小说', icon: '🚀' },
    { label: '经典文学', icon: '📚' },
    { label: '人工智能', icon: '🤖' },
    { label: '心理学', icon: '🧠' },
    { label: '历史传记', icon: '📜' },
    { label: '理财投资', icon: '📈' },
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
    const [mobileTab, setMobileTab] = useState<'chat' | 'recommend'>('chat');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat, loading]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        const hasRecommendations = chat.some(m => m.role === 'assistant' && m.recommendations && m.recommendations.length > 0);
        if (hasRecommendations && window.innerWidth < 768) {
            setMobileTab('recommend');
        }
    }, [chat]);

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
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            const errorMsg = err?.response?.data?.error || 'AI推荐服务暂时不可用，请稍后重试';
            message.error(errorMsg);
            const errMsg: ChatMessage = {
                role: 'assistant',
                content: `抱歉，遇到了问题：${errorMsg}`,
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
        <div className="min-h-screen bg-[#faf8f5] dark:bg-[#1a1814]">
            {/* Hero Header */}
            <div className="relative overflow-hidden bg-[#1a365d] dark:bg-[#0f172a]">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-32 h-32 border border-[#c05621] rounded-full" />
                    <div className="absolute bottom-10 right-20 w-24 h-24 border border-[#d69e2e] rounded-full" />
                    <div className="absolute top-1/2 left-1/3 w-16 h-16 border border-white/30 rounded-full" />
                </div>
                <div className="relative max-w-6xl mx-auto px-6 py-12 md:py-16">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div>
                            <p className="text-[#c05621] font-medium tracking-wider text-sm mb-2">AI 顾问</p>
                            <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl text-white font-bold leading-tight">
                                你的专属<br className="md:hidden" />阅读顾问
                            </h1>
                            <p className="mt-4 text-[#94a3b8] max-w-md text-lg leading-relaxed">
                                告诉我你的阅读偏好，我将从千本藏书中为你精选最适合的作品
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 bg-[#c05621]/20 rounded-full">
                                <span className="w-2 h-2 rounded-full bg-[#c05621] animate-pulse" />
                                <span className="text-[#fb923c] text-sm font-medium">在线服务中</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile tabs */}
            {lastRecommendations && (
                <div className="md:hidden sticky top-0 z-20 flex bg-white dark:bg-[#1a1814] border-b border-[#e8e0d8] dark:border-[#2d2a26]">
                    <button
                        onClick={() => setMobileTab('chat')}
                        className={`flex-1 py-4 text-sm font-medium transition-all ${mobileTab === 'chat' ? 'text-[#1a365d] dark:text-[#fb923c] border-b-2 border-[#1a365d] dark:border-[#fb923c]' : 'text-[#64748b]'}`}
                    >
                        💬 对话
                    </button>
                    <button
                        onClick={() => setMobileTab('recommend')}
                        className={`flex-1 py-4 text-sm font-medium transition-all ${mobileTab === 'recommend' ? 'text-[#1a365d] dark:text-[#fb923c] border-b-2 border-[#1a365d] dark:border-[#fb923c]' : 'text-[#64748b]'}`}
                    >
                        📖 推荐 ({lastRecommendations.length})
                    </button>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                    {/* Chat Panel */}
                    <div className={`${mobileTab === 'chat' || !lastRecommendations ? 'flex' : 'hidden md:flex'} flex-col md:w-[420px] flex-shrink-0`}>
                        <div className="bg-white dark:bg-[#1e1c18] rounded-2xl shadow-sm border border-[#e8e0d8] dark:border-[#2d2a26] flex flex-col h-[600px] md:h-[700px]">
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                                {chat.length === 0 && (
                                    <div className="h-full flex flex-col">
                                        <div className="mb-6">
                                            <h3 className="font-['Playfair_Display'] text-2xl text-[#1a1814] dark:text-[#faf8f5] font-bold mb-2">
                                                开始对话
                                            </h3>
                                            <p className="text-[#64748b] text-sm leading-relaxed">
                                                选择热门话题或输入你的阅读偏好
                                            </p>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-2">
                                            {QUICK_SUGGESTIONS.map((s, i) => (
                                                <button
                                                    key={s.label}
                                                    onClick={() => handleSend(s.label)}
                                                    className="flex items-center gap-2 px-3 py-3 rounded-xl text-sm text-left
                                                        bg-[#faf8f5] dark:bg-[#262420] 
                                                        border border-[#e8e0d8] dark:border-[#3d3a36]
                                                        hover:border-[#c05621] dark:hover:border-[#c05621]
                                                        hover:bg-[#fff7ed] dark:hover:bg-[#2d2520]
                                                        transition-all duration-200 group"
                                                    style={{ animationDelay: `${i * 50}ms` }}
                                                >
                                                    <span className="text-lg">{s.icon}</span>
                                                    <span className="text-[#1a1814] dark:text-[#faf8f5] group-hover:text-[#c05621] transition-colors">
                                                        {s.label}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="mt-auto pt-6 border-t border-[#e8e0d8] dark:border-[#2d2a26]">
                                            <p className="text-xs text-[#94a3b8] text-center">
                                                例如："推荐一些适合周末放松的小说" 或 "我想学习数据结构"
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {chat.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.role === 'assistant' ? (
                                            <div className="max-w-[90%]">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-[#1a365d] dark:bg-[#c05621] flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <span className="text-white text-xs font-bold">AI</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="bg-[#f5f0eb] dark:bg-[#262420] rounded-2xl rounded-tl-md px-4 py-3 text-sm text-[#1a1814] dark:text-[#faf8f5] leading-relaxed">
                                                            {msg.content}
                                                        </div>
                                                        {msg.recommendations && msg.recommendations.length > 0 && (
                                                            <p className="text-xs text-[#c05621] mt-2 ml-1 font-medium">
                                                                ✓ 已为你找到 {msg.recommendations.length} 本好书
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="max-w-[80%] bg-[#1a365d] dark:bg-[#c05621] text-white rounded-2xl rounded-br-md px-4 py-3 text-sm leading-relaxed">
                                                {msg.content}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {loading && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[#1a365d] dark:bg-[#c05621] flex items-center justify-center flex-shrink-0">
                                            <span className="text-white text-xs font-bold">AI</span>
                                        </div>
                                        <div className="bg-[#f5f0eb] dark:bg-[#262420] rounded-2xl rounded-tl-md px-5 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-[#c05621] animate-[bounce_1s_infinite_0ms]" />
                                                <span className="w-2 h-2 rounded-full bg-[#c05621] animate-[bounce_1s_infinite_150ms]" />
                                                <span className="w-2 h-2 rounded-full bg-[#c05621] animate-[bounce_1s_infinite_300ms]" />
                                                <span className="text-xs text-[#64748b] ml-2">正在思考...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-4 md:p-6 border-t border-[#e8e0d8] dark:border-[#2d2a26]">
                                <form onSubmit={handleSubmit} className="flex gap-3">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="说说你想读什么..."
                                        disabled={loading}
                                        className="flex-1 px-4 py-3 bg-[#faf8f5] dark:bg-[#262420] 
                                            border border-[#e8e0d8] dark:border-[#3d3a36]
                                            rounded-xl text-sm text-[#1a1814] dark:text-[#faf8f5]
                                            placeholder:text-[#94a3b8]
                                            focus:outline-none focus:ring-2 focus:ring-[#c05621]/30 focus:border-[#c05621]
                                            transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading || !input.trim()}
                                        className="px-5 py-3 bg-[#1a365d] dark:bg-[#c05621] text-white rounded-xl
                                            font-medium text-sm hover:bg-[#1e3a5f] dark:hover:bg-[#d97706]
                                            disabled:opacity-40 disabled:cursor-not-allowed
                                            transition-all duration-200"
                                    >
                                        发送
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations Panel */}
                    <div className={`${mobileTab === 'recommend' ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
                        {!lastRecommendations ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-[#1e1c18] rounded-2xl border border-[#e8e0d8] dark:border-[#2d2a26]">
                                <div className="w-20 h-20 rounded-2xl bg-[#faf8f5] dark:bg-[#262420] flex items-center justify-center mb-6">
                                    <span className="text-4xl">📚</span>
                                </div>
                                <h3 className="font-['Playfair_Display'] text-xl text-[#1a1814] dark:text-[#faf8f5] font-bold mb-2">
                                    等待你的阅读偏好
                                </h3>
                                <p className="text-sm text-[#64748b] max-w-xs leading-relaxed">
                                    在左侧输入你感兴趣的书籍类型，AI将为你精心挑选
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-baseline justify-between">
                                    <h2 className="font-['Playfair_Display'] text-2xl text-[#1a1814] dark:text-[#faf8f5] font-bold">
                                        为你精选
                                    </h2>
                                    <span className="text-sm text-[#64748b]">
                                        {lastRecommendations.length} 本图书
                                    </span>
                                </div>

                                <div className="grid gap-4">
                                    {lastRecommendations.map((rec, idx) => (
                                        <div
                                            key={rec.bookId}
                                            className="group relative bg-white dark:bg-[#1e1c18] rounded-2xl 
                                                border border-[#e8e0d8] dark:border-[#2d2a26]
                                                hover:border-[#c05621]/50 dark:hover:border-[#c05621]/50
                                                hover:shadow-lg hover:shadow-[#c05621]/5
                                                transition-all duration-300 overflow-hidden"
                                        >
                                            {/* Rank Badge */}
                                            <div className="absolute top-4 left-4 z-10">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                                                    ${idx === 0 ? 'bg-[#d69e2e] text-white' : 
                                                      idx === 1 ? 'bg-[#94a3b8] text-white' : 
                                                      idx === 2 ? 'bg-[#c05621] text-white' : 
                                                      'bg-[#e8e0d8] dark:bg-[#3d3a36] text-[#64748b]'}`}>
                                                    {idx + 1}
                                                </div>
                                            </div>

                                            <div className="flex gap-5 p-5 pt-6">
                                                {/* Cover */}
                                                <Link
                                                    to={`/book/${rec.bookId}`}
                                                    className="relative w-28 md:w-32 flex-shrink-0"
                                                >
                                                    <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[#f5f0eb] dark:bg-[#262420]">
                                                        <img
                                                            src={rec.coverImage || FALLBACK_COVER}
                                                            alt={rec.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            loading="lazy"
                                                        />
                                                    </div>
                                                    {rec.matchScore > 0 && (
                                                        <div className="absolute -bottom-2 -right-2 px-2 py-1 
                                                            bg-[#1a365d] dark:bg-[#c05621] 
                                                            text-white text-xs font-bold rounded-lg
                                                            shadow-lg">
                                                            {rec.matchScore}%
                                                        </div>
                                                    )}
                                                </Link>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0 flex flex-col">
                                                    <div className="flex-1">
                                                        <Link
                                                            to={`/book/${rec.bookId}`}
                                                            className="font-['Playfair_Display'] text-lg font-bold text-[#1a1814] dark:text-[#faf8f5] 
                                                                hover:text-[#c05621] dark:hover:text-[#fb923c] transition-colors line-clamp-2"
                                                        >
                                                            {rec.title}
                                                        </Link>
                                                        <p className="text-sm text-[#64748b] mt-1">
                                                            {rec.author}
                                                        </p>
                                                        <p className="text-xl font-bold text-[#c05621] dark:text-[#fb923c] mt-2">
                                                            ¥{(rec.price ?? 0).toFixed(2)}
                                                        </p>
                                                        
                                                        <div className="mt-3 p-3 bg-[#faf8f5] dark:bg-[#262420] rounded-xl">
                                                            <p className="text-sm text-[#4a5568] dark:text-[#a0aec0] leading-relaxed">
                                                                {rec.reason}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2 mt-4">
                                                        <Link
                                                            to={`/book/${rec.bookId}`}
                                                            className="flex-1 px-3 py-2.5 text-center text-sm font-medium 
                                                                text-[#1a365d] dark:text-[#fb923c] 
                                                                border border-[#1a365d]/20 dark:border-[#fb923c]/20
                                                                rounded-xl hover:bg-[#1a365d]/5 dark:hover:bg-[#fb923c]/10
                                                                transition-colors"
                                                        >
                                                            查看详情
                                                        </Link>
                                                        <button
                                                            onClick={() => handleAddToCart(rec)}
                                                            className="flex-1 px-3 py-2.5 text-sm font-medium 
                                                                bg-[#1a365d] dark:bg-[#c05621] 
                                                                text-white rounded-xl
                                                                hover:bg-[#1e3a5f] dark:hover:bg-[#d97706]
                                                                transition-colors"
                                                        >
                                                            加入购物车
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiRecommend;
