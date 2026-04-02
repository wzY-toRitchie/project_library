import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface QA { q: string; a: string; }

const faqs: QA[] = [
    { q: '如何下单购买图书？', a: '浏览图书后，点击"加入购物车"将图书添加到购物车。进入购物车后点击"去结算"，填写收货地址和选择支付方式后提交订单即可。' },
    { q: '支持哪些支付方式？', a: '目前支持微信支付和支付宝支付。您可以在结算页面选择您偏好的支付方式。' },
    { q: '运费是多少？', a: '全场订单满 99 元免运费。未满 99 元的订单收取 10 元运费。' },
    { q: '配送需要多长时间？', a: '一般情况下，订单支付后 3-5 个工作日送达。偏远地区可能需要额外 1-2 天。' },
    { q: '如何申请退换货？', a: '签收后 7 天内，可在个人中心的订单详情中申请退换货。非质量问题的退换货运费由买家承担。' },
    { q: '如何查看订单状态？', a: '登录后进入"个人中心">"我的订单"，可以查看所有订单的状态和详情。' },
    { q: '优惠券如何使用？', a: '在结算页面，点击"选择优惠券"下拉菜单，选择可用的优惠券即可自动抵扣。每个订单只能使用一张优惠券。' },
    { q: 'AI 智能荐书是什么？', a: 'AI 智能荐书是我们的特色功能。输入您的阅读偏好，AI 会根据您的浏览历史和评分记录，为您推荐最合适的图书。' },
    { q: '如何修改个人信息？', a: '登录后进入"个人中心">"个人信息"，可以修改用户名、邮箱、手机号等基本信息。' },
    { q: '忘记密码怎么办？', a: '目前仅支持通过管理员重置密码。请联系客服获取帮助。' },
];

const FAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="max-w-3xl mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">常见问题</h1>
            <p className="text-slate-500 mb-8">快速找到您需要的答案</p>
            <div className="space-y-3">
                {faqs.map((faq, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-700 overflow-hidden">
                        <button
                            onClick={() => setOpenIndex(openIndex === i ? null : i)}
                            className="w-full flex items-center justify-between px-6 py-4 text-left"
                        >
                            <span className="font-medium text-slate-900 dark:text-white">{faq.q}</span>
                            <span className={`material-symbols-outlined text-slate-400 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} aria-hidden="true">expand_more</span>
                        </button>
                        {openIndex === i && (
                            <div className="px-6 pb-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-4">
                                {faq.a}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="mt-10 text-center bg-slate-50 dark:bg-slate-800 rounded-xl p-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">没有找到答案？</h3>
                <p className="text-slate-500 mb-4">我们的客服团队随时为您服务</p>
                <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors">
                    <span className="material-symbols-outlined" aria-hidden="true">support_agent</span>
                    联系客服
                </Link>
            </div>
        </div>
    );
};
export default FAQ;
