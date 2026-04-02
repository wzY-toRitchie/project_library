import React from 'react';
import { Link } from 'react-router-dom';

const About: React.FC = () => (
    <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">关于我们</h1>
        <div className="prose dark:prose-invert max-w-none space-y-8">
            <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">JavaBooks</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">JavaBooks 是一家致力于为读者提供优质图书的在线书店。我们精选来自全球各地的优秀作品，涵盖文学、科技、历史、哲学等多个领域，为每一位热爱阅读的人提供便捷的购书体验。</p>
            </section>
            <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">我们的使命</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">让阅读变得更简单。我们相信，好书改变人生。通过 AI 智能荐书系统，我们帮助每一位读者找到最适合自己的书籍，让知识的获取更加高效。</p>
            </section>
            <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">我们的承诺</h2>
                <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2">
                    <li>100% 正版图书保证</li>
                    <li>全场满 99 元免运费</li>
                    <li>7 天无理由退换货</li>
                    <li>7x24 小时客服在线</li>
                    <li>AI 智能荐书，精准匹配你的阅读偏好</li>
                </ul>
            </section>
            <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">联系我们</h2>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 space-y-3">
                    <div className="flex items-center gap-3"><span className="material-symbols-outlined text-primary" aria-hidden="true">mail</span><span className="text-slate-600 dark:text-slate-300">support@javabooks.com</span></div>
                    <div className="flex items-center gap-3"><span className="material-symbols-outlined text-primary" aria-hidden="true">phone</span><span className="text-slate-600 dark:text-slate-300">400-888-0000</span></div>
                    <div className="flex items-center gap-3"><span className="material-symbols-outlined text-primary" aria-hidden="true">schedule</span><span className="text-slate-600 dark:text-slate-300">工作时间 9:00-22:00</span></div>
                </div>
            </section>
        </div>
    </div>
);
export default About;
