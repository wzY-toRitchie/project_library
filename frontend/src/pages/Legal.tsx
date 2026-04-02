import React from 'react';
import { useSearchParams } from 'react-router-dom';

const termsContent = `# 用户协议

## 1. 服务条款

欢迎使用 JavaBooks 在线书店。本协议是您与 JavaBooks 之间关于使用本平台服务的法律协议。使用本平台即表示您同意遵守本协议。

## 2. 用户注册

- 您需要提供真实、准确的个人信息进行注册
- 您有责任保护您的账户安全
- 不得将账户转让或借给他人使用

## 3. 商品与服务

- 本平台所售商品均为正版图书
- 商品价格以平台显示为准
- 我们保留修改商品价格和库存的权利

## 4. 订单与支付

- 提交订单后，请在规定时间内完成支付
- 超时未支付的订单将自动取消
- 支持微信支付、支付宝等支付方式

## 5. 配送与退换

- 全场满 99 元免运费
- 商品签收后 7 天内可申请退换货
- 退换货运费由平台承担（非质量问题除外）

## 6. 知识产权

- 本平台所有内容受知识产权法保护
- 未经授权不得复制、传播本平台内容

## 7. 免责声明

- 因不可抗力导致的服务中断，平台不承担责任
- 用户因自身原因造成的损失，平台不承担责任`;

const privacyContent = `# 隐私政策

## 1. 信息收集

我们收集以下信息以提供服务：
- 注册信息（用户名、邮箱、手机号）
- 收货信息（姓名、地址、电话）
- 浏览和购买记录

## 2. 信息使用

我们使用您的信息用于：
- 处理订单和配送
- 提供个性化推荐
- 改善服务质量

## 3. 信息保护

- 采用 SSL 加密传输
- 严格限制员工访问权限
- 定期进行安全审计

## 4. 信息共享

- 未经您同意，不会向第三方共享个人信息
- 配送信息仅提供给物流合作伙伴
- 法律要求时可能提供必要信息

## 5. Cookie 使用

- 使用 Cookie 记录用户偏好
- 可在浏览器设置中禁用 Cookie

## 6. 联系我们

如有隐私相关问题，请联系 support@javabooks.com`;

const Legal: React.FC = () => {
    const [params] = useSearchParams();
    const tab = params.get('tab') || 'terms';
    const content = tab === 'privacy' ? privacyContent : termsContent;
    const title = tab === 'privacy' ? '隐私政策' : '用户协议';

    return (
        <div className="max-w-3xl mx-auto px-4 py-16">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{title}</h1>
                <div className="flex gap-4">
                    <a href="/legal?tab=terms" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'terms' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>用户协议</a>
                    <a href="/legal?tab=privacy" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'privacy' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>隐私政策</a>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-700 p-8">
                <div className="prose dark:prose-invert max-w-none">
                    {content.split('\n').map((line, i) => {
                        if (line.startsWith('# ')) return <h2 key={i} className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-3">{line.slice(2)}</h2>;
                        if (line.startsWith('## ')) return <h3 key={i} className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-2">{line.slice(3)}</h3>;
                        if (line.startsWith('- ')) return <li key={i} className="text-slate-600 dark:text-slate-400 ml-4">{line.slice(2)}</li>;
                        if (line.trim() === '') return <br key={i} />;
                        return <p key={i} className="text-slate-600 dark:text-slate-400 leading-relaxed">{line}</p>;
                    })}
                </div>
            </div>
        </div>
    );
};
export default Legal;
