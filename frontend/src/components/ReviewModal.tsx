import React, { useState } from 'react';
import { message } from 'antd';
import api from '../api';
import type { Book } from '../types';
import { useAuth } from '../context/AuthContext';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    book: Book | null;
    onSuccess?: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, book, onSuccess }) => {
    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);
    const { user } = useAuth();

    if (!isOpen || !book) return null;

    const handleSubmit = async () => {
        if (rating === 0) {
            message.error('请选择评分');
            return;
        }
        if (!comment.trim()) {
            message.error('请输入评价内容');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/reviews', {
                userId: user?.id,
                bookId: book.id,
                rating,
                comment
            });
            message.success('评价提交成功。');
            setRating(0);
            setComment('');
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to submit review:', error);
            message.error('评价提交失败，请重试');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white">写评价</h2>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        aria-label="关闭"
                    >
                        <span className="material-symbols-outlined" aria-hidden="true">close</span>
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                    {/* Book Identification */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-20 h-28 flex-shrink-0 bg-slate-100 dark:bg-slate-800 rounded shadow-sm overflow-hidden">
                            <img
                                src={book.coverImage || 'https://via.placeholder.com/150'}
                                alt={book.title}
                                className="w-full h-full object-cover"
                                width={80}
                                height={112}
                            />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{book.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{book.author}</p>
                            <div className="inline-flex items-center mt-2 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                已购买
                            </div>
                        </div>
                    </div>

                    {/* Rating Selector */}
                    <div className="mb-8 text-center">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">总体评分</label>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button 
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className="group focus:outline-none transition-transform hover:scale-110"
                                    aria-label={`评分 ${star} 星`}
                                >
                                    <span 
                                        className={`material-symbols-outlined text-4xl ${star <= rating ? 'text-primary' : 'text-slate-200 dark:text-slate-700 group-hover:text-primary/40'}`}
                                        style={{ fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0" }}
                                        aria-hidden="true"
                                    >
                                        star
                                    </span>
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-slate-400 mt-2 italic">请点击星星进行评价</p>
                    </div>

                    {/* Comment Area */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" htmlFor="review-text">详细反馈</label>
                        <textarea 
                            id="review-text"
                            name="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors outline-none resize-none"
                            placeholder="这本书怎么样？分享您的阅读体验..." 
                            rows={4}
                        ></textarea>
                        <div className="flex justify-end mt-2">
                            <span className="text-xs text-slate-400">{comment.length} / 500</span>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
                    <button 
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors transition-transform shadow-md shadow-primary/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? '提交中...' : '提交评价'}
                    </button>
                    <button 
                        onClick={onClose}
                        disabled={submitting}
                        className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg transition-colors transition-transform active:scale-[0.98] disabled:opacity-50"
                    >
                        取消
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
