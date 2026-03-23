import React from 'react';
import ReactECharts from 'echarts-for-react';

interface UserGrowthChartProps {
    dates: string[];
    counts: number[];
}

const UserGrowthChart: React.FC<UserGrowthChartProps> = ({ dates, counts }) => {
    const option = {
        title: {
            text: '用户增长趋势',
            left: 'center',
            textStyle: {
                color: '#374151',
                fontSize: 16,
                fontWeight: 'bold'
            }
        },
        tooltip: {
            trigger: 'axis',
            formatter: '{b}<br/>新增用户: {c} 人'
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
            minInterval: 1
        },
        series: [
            {
                data: counts,
                type: 'bar',
                itemStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: '#10b981' },
                            { offset: 1, color: '#059669' }
                        ]
                    },
                    borderRadius: [4, 4, 0, 0]
                },
                label: {
                    show: true,
                    position: 'top',
                    formatter: '{c}'
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

export default UserGrowthChart;
