import React from 'react';
import ReactECharts from 'echarts-for-react';

interface SalesTrendChartProps {
    dates: string[];
    sales: number[];
}

const SalesTrendChart: React.FC<SalesTrendChartProps> = ({ dates, sales }) => {
    const option = {
        title: {
            text: '销售趋势',
            left: 'center',
            textStyle: {
                color: '#374151',
                fontSize: 16,
                fontWeight: 'bold'
            }
        },
        tooltip: {
            trigger: 'axis',
            formatter: '{b}<br/>销售额: ¥{c}'
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {
                rotate: 45,
                fontSize: 10
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: '¥{value}'
            }
        },
        series: [
            {
                data: sales,
                type: 'line',
                smooth: true,
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(59, 130, 246, 0.5)' },
                            { offset: 1, color: 'rgba(59, 130, 246, 0.1)' }
                        ]
                    }
                },
                itemStyle: {
                    color: '#3b82f6'
                },
                lineStyle: {
                    width: 3,
                    color: '#3b82f6'
                }
            }
        ],
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            containLabel: true
        }
    };

    return <ReactECharts option={option} style={{ height: '300px' }} />;
};

export default SalesTrendChart;
