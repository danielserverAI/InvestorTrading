import { useEffect, useRef } from 'react';
import { createChart, IChartApi } from 'lightweight-charts';

interface TradingViewChartProps {
  symbol: string;
  interval?: string;
  onKeyPointDetected?: (point: any) => void;
}

export const TradingViewChart = ({ 
  symbol, 
  interval = '1D',
  onKeyPointDetected 
}: TradingViewChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (chartContainerRef.current) {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { color: 'transparent' },
          textColor: '#D1D5DB',
        },
        grid: {
          vertLines: { color: '#1F2937' },
          horzLines: { color: '#1F2937' },
        },
        width: chartContainerRef.current.clientWidth,
        height: 500,
      });

      chartRef.current = chart;

      const handleResize = () => {
        if (chartContainerRef.current) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      // TODO: Implement data fetching and key point detection
      // This will be connected to your backend API

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    }
  }, [symbol, interval]);

  return (
    <div className="w-full h-[500px] relative">
      <div ref={chartContainerRef} className="w-full h-full" />
      <div className="absolute top-4 left-4 text-sm font-medium text-gray-200">
        {symbol}
      </div>
    </div>
  );
}; 