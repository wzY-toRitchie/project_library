import React from 'react';
import ReactECharts from 'echarts-for-react';

interface CategorySalesChartProps {
    data: { name: string; value: number }[];
}

const CategorySalesChart: React.FC<CategorySalesChartProps> = ({ data }) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
    
    const option = {
        title: {
            text: '分类销售占比',
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
            right: 'right',
            top: 'middle'
        },
        series: [
            {
                name: '分类销售',
                type: 'pie',
                radius: '60%',
                center: ['40%', '50%'],
                data: data.map((item, index) => ({
                    ...item,
                    itemStyle: {
                        color: colors[index % colors.length]
                    }
                })),
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                label: {
                    formatter: '{b}\n{d}%'
                }
            }
        ]
    };

    return <ReactECharts option={option} style={{ height: '300px' }} />;
};

export default CategorySalesChart;
