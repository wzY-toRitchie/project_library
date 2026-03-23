import React from 'react';
import ReactECharts from 'echarts-for-react';

interface OrderStatusChartProps {
    data: { name: string; value: number }[];
}

const OrderStatusChart: React.FC<OrderStatusChartProps> = ({ data }) => {
    const colors = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444'];
    
    const option = {
        title: {
            text: '订单状态分布',
            left: 'center',
            textStyle: {
                color: '#374151',
                fontSize: 16,
                fontWeight: 'bold'
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: '{a}<br/>{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            top: 'middle'
        },
        series: [
            {
                name: '订单状态',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 20,
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: data.map((item, index) => ({
                    ...item,
                    itemStyle: {
                        color: colors[index % colors.length]
                    }
                }))
            }
        ]
    };

    return <ReactECharts option={option} style={{ height: '300px' }} />;
};

export default OrderStatusChart;
