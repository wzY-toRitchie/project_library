import React from 'react';

interface OrderTimelineProps {
    status: string;
    createTime?: string;
    payTime?: string;
    shipTime?: string;
    completeTime?: string;
    horizontal?: boolean;
}

interface TimelineStep {
    key: string;
    label: string;
    time?: string;
    icon: string;
}

const statusOrder = ['PENDING', 'PAID', 'SHIPPED', 'COMPLETED'];

const OrderTimeline: React.FC<OrderTimelineProps> = ({ 
    status, 
    createTime, 
    payTime, 
    shipTime, 
    completeTime,
    horizontal = false
}) => {
    const currentIndex = statusOrder.indexOf(status);
    
    const steps: TimelineStep[] = [
        { key: 'PENDING', label: '下单成功', time: createTime, icon: 'receipt_long' },
        { key: 'PAID', label: '已支付', time: payTime, icon: 'payments' },
        { key: 'SHIPPED', label: '已发货', time: shipTime, icon: 'local_shipping' },
        { key: 'COMPLETED', label: '已完成', time: completeTime, icon: 'check_circle' }
    ];

    const isCancelled = status === 'CANCELLED';

    if (isCancelled) {
        return (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <span className="material-symbols-outlined text-red-500 text-2xl" aria-hidden="true">cancel</span>
                <div>
                    <p className="font-semibold text-red-700 dark:text-red-400">订单已取消</p>
                    <p className="text-sm text-red-500 dark:text-red-400">此订单已被取消</p>
                </div>
            </div>
        );
    }

    // 横向布局
    if (horizontal) {
        return (
            <div className="relative w-full py-2">
                {/* 背景连接线?*/}
                <div className="absolute top-7 left-[12.5%] right-[12.5%] h-0.5 bg-slate-200 dark:bg-slate-700 z-0" />
                {/* 已完成连接线 */}
                <div 
                    className="absolute top-7 left-[12.5%] h-0.5 bg-primary z-[1]"
                    style={{ width: `${(currentIndex / (steps.length - 1)) * 75}%` }}
                />
                
                {/* 步骤 */}
                <div className="flex justify-between relative z-10">
                    {steps.map((step, index) => {
                        const isCompleted = index <= currentIndex;
                        const isCurrent = index === currentIndex;

                        return (
                            <div key={step.key} className="flex flex-col items-center w-1/4">
                                {/* 图标圆圈 */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    isCompleted 
                                        ? 'bg-primary text-white shadow-md shadow-primary/30' 
                                        : 'bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-200 dark:border-slate-700'
                                }`}>
                                    <span className="material-symbols-outlined text-lg" aria-hidden="true">{step.icon}</span>
                                </div>
                                
                                {/* 文字内容 */}
                                <div className="mt-3 text-center">
                                    <p className={`text-sm font-medium ${
                                        isCurrent 
                                            ? 'text-primary font-semibold' 
                                            : isCompleted 
                                                ? 'text-slate-700 dark:text-slate-300' 
                                                : 'text-slate-400 dark:text-slate-500'
                                    }`}>
                                        {step.label}
                                    </p>
                                    <p className={`text-xs mt-1 ${
                                        isCompleted 
                                            ? 'text-slate-500 dark:text-slate-400' 
                                            : 'text-slate-400 dark:text-slate-500'
                                    }`}>
                                        {step.time 
                                            ? new Date(step.time).toLocaleDateString() 
                                            : isCurrent ? '进行中' : '待处理'}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // 纵向布局（默认）
    return (
        <div className="flex flex-col gap-0">
            {steps.map((step, index) => {
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;
                const isLast = index === steps.length - 1;

                return (
                    <div key={step.key} className="flex items-start gap-4">
                        {/* Timeline line and dot */}
                        <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                isCompleted 
                                    ? 'bg-primary text-white' 
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                            }`}>
                                <span className="material-symbols-outlined text-lg" aria-hidden="true">{step.icon}</span>
                            </div>
                            {!isLast && (
                                <div className={`w-0.5 h-12 ${
                                    isCompleted ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                                }`} />
                            )}
                        </div>
                        
                        {/* Content */}
                        <div className={`flex-1 pb-8 ${isLast ? 'pb-0' : ''}`}>
                            <p className={`font-semibold ${
                                isCurrent 
                                    ? 'text-primary' 
                                    : isCompleted 
                                        ? 'text-slate-900 dark:text-white' 
                                        : 'text-slate-400 dark:text-slate-500'
                            }`}>
                                {step.label}
                            </p>
                            <p className={`text-sm mt-1 ${
                                isCompleted 
                                    ? 'text-slate-600 dark:text-slate-400' 
                                    : 'text-slate-400 dark:text-slate-500'
                            }`}>
                                {step.time 
                                    ? new Date(step.time).toLocaleString() 
                                    : isCurrent ? '进行中' : '待处理'}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default OrderTimeline;
