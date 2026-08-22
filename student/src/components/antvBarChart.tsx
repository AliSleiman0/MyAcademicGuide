import { useEffect, useRef } from 'react';
import { Column } from '@antv/g2plot';

// Interface for TypeScript type checking (optional but recommended)
interface BarChartData {
    grade: string;
    count: number;
}

interface BarChartProps {
    data: BarChartData[];
    width?: number;
    height?: number;
}

const BarChart = ({ data}: BarChartProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<Column>();

    useEffect(() => {
        if (containerRef.current) {
            // Initialize chart
            chartRef.current = new Column(containerRef.current, {
                data,
                xField: 'grade',
                yField: 'count',

                padding: 40,
                columnWidthRatio: 0.35,
                columnStyle: {
                    // Rounded top borders (first two values for top-left/top-right)
                    radius: [8, 8, 0, 0], // [top-left, top-right, bottom-right, bottom-left]
                    fill: 'l(110) 0:#038b94 1:#00bab1', // Vertical gradient

                },
                theme: {
                    styleSheet: {
                        backgroundColor: 'l(270) 0:#ffffff 1:#f6f7f9', // Gradient

                        backgroundBlendMode: 'overlay'
                    }
                },
                label: {
                    position: 'middle',
                    style: {
                        fill: '#FFFFFF',
                        opacity: 0.6,
                    },
                },
                tooltip: {
                    domStyles: {
                        'g2-tooltip': {
                            background: '#1a1a1a',
                            color: '#fff',
                            borderRadius: '4px'
                        }
                    }
                },
                xAxis: {

                    label: {
                        autoHide: true,
                        autoRotate: false,
                        style: { color: "black", fontWeight: "bold", fontSize: 15, fontStyle: "italic" }
                    },
                },
                yAxis: {
                    label: {
                        autoHide: true,
                        autoRotate: false,
                        style: { color: "black",  fontSize: 15, fontStyle: "italic" }
                    },
                },
           
                legend: {
                    position: 'top-right',
                    itemName: { style: { fill: '#038b94' } }
                },
                meta: {
                    type: {
                        alias: 'Grades', // Translated to English
                    },
                    sales: {
                        alias: 'Count', // Translated to English
                    },
                },
            });

            chartRef.current.render();
        }

        // Cleanup on component unmount
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [data]);

    return <div  ref={containerRef} />;
};

export default BarChart;

// Usage example:
// <BarChartComponent data={sampleData} width={800} height={500} />