import React from 'react';
import ReactECharts from 'echarts-for-react';

interface TopProductsChartProps {
    names: string[];
    sales: number[];
}

const TopProductsChart: React.FC<TopProductsChartProps> = ({ names, sales }) => {
    const option = {
        title: {
            text: '热销商品排行',
            left: 'center',
            textStyle: {
                color: '#374151',
                fontSize: 16,
                fontWeight: 'bold'
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        xAxis: {
            type: 'value',
            boundaryGap: [0, 0.01]
        },
        yAxis: {
            type: 'category',
            data: names,
            axisLabel: {
                width: 80,
                overflow: 'truncate',
                fontSize: 10
            }
        },
        series: [
            {
                name: '销量',
                type: 'bar',
                data: sales,
                itemStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 1,
                        y2: 0,
                        colorStops: [
                            { offset: 0, color: '#3b82f6' },
                            { offset: 1, color: '#8b5cf6' }
                        ]
                    },
                    borderRadius: [0, 4, 4, 0]
                },
                label: {
                    show: true,
                    position: 'right',
                    formatter: '{c} 本'
                }
            }
        ],
        grid: {
            left: '3%',
            right: '15%',
            bottom: '3%',
            containLabel: true
        }
    };

    return <ReactECharts option={option} style={{ height: '300px' }} />;
};

export default TopProductsChart;
