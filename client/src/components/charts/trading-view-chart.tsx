import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time, CrosshairMode, LineWidth, MouseEventParams, SeriesMarker } from 'lightweight-charts';

// Helper function to convert YYYY-MM-DD to UNIX timestamp (seconds)
const dateToTimestamp = (dateString: string): number => {
  // Basic validation, return NaN for invalid dates to potentially filter later
  const date = new Date(dateString);
  return !isNaN(date.getTime()) ? date.getTime() / 1000 : NaN;
};

interface TradingViewChartProps {
  symbol: string;
  interval?: string;
  onKeyPointDetected?: (point: any) => void;
  isSelectMode?: boolean;
}

export const TradingViewChart = ({ 
  symbol, 
  interval = '1D',
  onKeyPointDetected,
  isSelectMode = false
}: TradingViewChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState<Set<number>>(new Set());

  // Reset selected points when symbol changes
  useEffect(() => {
    setSelectedPoints(new Set());
  }, [symbol]);

  // Theme detection effect
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Generate chart data with seed based on symbol
  const generateChartData = (): CandlestickData<Time>[] => {
    const data: CandlestickData<Time>[] = [];
    const numberOfDays = 100;
    // Use symbol to generate consistent base price for each stock
    const basePrice = (symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 100) + 100;
    let currentPrice = basePrice;
    let volatility = 2;
    let trend = 0;
    
    // Use symbol as seed for random number generation
    const symbolSeed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const seededRandom = () => {
      const x = Math.sin(symbolSeed + data.length) * 10000;
      return x - Math.floor(x);
    };
    
    const today = new Date();
    for (let i = numberOfDays; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      if (i % 20 === 0) {
        trend = Math.floor(seededRandom() * 3) - 1;
        volatility = 1.5 + seededRandom() * 2;
      }

      const trendBias = trend * 0.3;
      const changePercent = (seededRandom() - 0.5 + trendBias) * volatility;
      const open = currentPrice;
      const close = open * (1 + changePercent / 100);
      
      const range = Math.abs(close - open);
      const highExtra = range * (0.2 + seededRandom() * 0.3);
      const lowExtra = range * (0.2 + seededRandom() * 0.3);
      
      const high = Math.max(open, close) + highExtra;
      const low = Math.min(open, close) - lowExtra;
      const timestamp = date.getTime() / 1000;

      data.push({
        time: timestamp as Time,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
      });

      currentPrice = close;
    }
    return data;
  };

  // Store the base data with symbol key
  const [baseData, setBaseData] = useState<CandlestickData<Time>[]>([]);

  // Function to update markers based on selected points
  const updateMarkers = (points: Set<number>) => {
    if (!candleSeriesRef.current) return;
    
    const markers: SeriesMarker<Time>[] = Array.from(points).map(timeValue => ({
      time: timeValue as Time,
      position: 'aboveBar',
      color: '#2196F3',
      shape: 'circle',
      text: 'Selected'
    }));
    
    candleSeriesRef.current.setMarkers(markers);
  };

  // Chart initialization and updates
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clear any existing markers and selected points when symbol changes
    setSelectedPoints(new Set());
    if (candleSeriesRef.current) {
      candleSeriesRef.current.setMarkers([]);
    }

    const computedStyle = getComputedStyle(chartContainerRef.current);
    const foregroundColor = computedStyle.getPropertyValue('--foreground').trim();
    const borderColor = computedStyle.getPropertyValue('--border').trim();
    
    // Convert HSL string from Tailwind ("H S L") to standard HSL format "hsl(H, S%, L%)"
    // or handle hex/rgb if the variables resolve to that.
    const resolveColor = (hslString: string): string => {
        if (hslString.startsWith('#') || hslString.startsWith('rgb')) {
            return hslString;
        }
        // Assuming Tailwind format "H S L"
        try {
          const [hStr, sStr, lStr] = hslString.split(' ');
          if (!hStr || !sStr || !lStr) throw new Error('Invalid HSL string format');
          
          const h = parseFloat(hStr);
          const s = parseFloat(sStr.replace('%', '')) / 100; // Convert S to 0-1
          const l = parseFloat(lStr.replace('%', '')) / 100; // Convert L to 0-1

          if (isNaN(h) || isNaN(s) || isNaN(l) || s < 0 || s > 1 || l < 0 || l > 1) {
              throw new Error('Invalid HSL numeric values');
          }

          let r, g, b;
          if (s === 0) {
              r = g = b = l; // achromatic
          } else {
              const hue2rgb = (p: number, q: number, t: number): number => {
                  if (t < 0) t += 1;
                  if (t > 1) t -= 1;
                  if (t < 1/6) return p + (q - p) * 6 * t;
                  if (t < 1/2) return q;
                  if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                  return p;
              };
              const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
              const p = 2 * l - q;
              const hNormalized = h / 360;
              r = hue2rgb(p, q, hNormalized + 1/3);
              g = hue2rgb(p, q, hNormalized);
              b = hue2rgb(p, q, hNormalized - 1/3);
          }
          // Convert R, G, B to 0-255 range and return rgb string
          const to255 = (x: number): number => Math.max(0, Math.min(255, Math.round(x * 255)));
          return `rgb(${to255(r)}, ${to255(g)}, ${to255(b)})`;
        } catch (error) {
            console.error("Failed to parse HSL color:", hslString, error);
            return '#000000'; // Fallback color on error
        }
    };
    const finalForegroundColor = resolveColor(foregroundColor);
    const finalBorderColor = resolveColor(borderColor);

    // Log resolved colors for debugging
    console.log('Chart Colors:', { finalForegroundColor, finalBorderColor });

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: finalForegroundColor,
        attributionLogo: false,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          width: 4 as LineWidth,
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          style: 0, // Solid line
          labelBackgroundColor: isDarkMode ? '#404040' : '#e5e5e5',
        },
        horzLine: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
          labelBackgroundColor: isDarkMode ? '#404040' : '#e5e5e5',
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: finalBorderColor,
        rightOffset: 5,
        barSpacing: 10,           // Wider bars for better visibility
        minBarSpacing: 8,         // Minimum space between bars
        fixLeftEdge: true,        // Prevent scrolling past the left edge
        fixRightEdge: true,       // Prevent scrolling past the right edge
        lockVisibleTimeRangeOnResize: true, // Maintain visible range on resize
        tickMarkFormatter: (time: number, tickMarkType: any, locale: string) => {
          const date = new Date(time * 1000);
          switch (tickMarkType) {
            case 2:
              return date.toLocaleDateString(locale, { year: 'numeric' });
            case 3:
              return date.toLocaleDateString(locale, { month: 'short' });
            case 4:
              return date.toLocaleDateString(locale, { day: 'numeric' });
            default:
              return '';
          }
        },
      },
      watermark: {
        visible: true,
        text: symbol,
        fontSize: 48,
        color: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        horzAlign: 'center',
        vertAlign: 'center',
      },
      rightPriceScale: {
        borderColor: finalBorderColor,
      },
    });

    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    // Initialize candlestick series
    candleSeriesRef.current = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderUpColor: '#26a69a',
      borderDownColor: '#ef5350',
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });

    // Generate and set initial data only once
    const initialData = generateChartData();
    setBaseData(initialData);
    candleSeriesRef.current.setData(initialData);

    // Configure click handler for selection mode
    const handleClick = (param: MouseEventParams) => {
      if (!isSelectMode || !param.point) return;

      const time = Math.floor(param.time as number);
      const newSelectedPoints = new Set(selectedPoints);

      if (selectedPoints.has(time)) {
        newSelectedPoints.delete(time);
      } else {
        newSelectedPoints.add(time);
        if (onKeyPointDetected) {
          onKeyPointDetected({ 
            time, 
            price: param.point.y 
          });
        }
      }

      setSelectedPoints(newSelectedPoints);
      updateMarkers(newSelectedPoints);
    };

    // Subscribe to click events
    chartRef.current.subscribeClick(handleClick);

    // Enhanced price scale configuration
    chartRef.current.priceScale('right').applyOptions({
      autoScale: false,
      scaleMargins: {
        top: 0.1,
        bottom: 0.2,
      },
      borderVisible: true,
      borderColor: finalBorderColor,
      textColor: finalForegroundColor,
      mode: 0,
      alignLabels: true,
      ticksVisible: true,
    });

    // Enhanced time scale configuration
    chartRef.current.timeScale().applyOptions({
      borderColor: finalBorderColor,
      barSpacing: 10,
      rightOffset: 5,
      minBarSpacing: 8,
      fixLeftEdge: true,
      fixRightEdge: true,
      timeVisible: true,
      secondsVisible: false,
      ticksVisible: true,
      borderVisible: true,
    });

    // Apply enhanced crosshair styling
    chartRef.current.applyOptions({
      crosshair: {
        mode: isSelectMode ? CrosshairMode.Normal : CrosshairMode.Magnet,
      },
    });

    // Configure the candlestick series price format
    candleSeriesRef.current.applyOptions({
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
      lastValueVisible: true,
      priceLineVisible: true,
      priceLineWidth: 1,
      priceLineColor: finalForegroundColor,
      priceLineStyle: 2,
    });

    // Fit all content with proper spacing
    chartRef.current.timeScale().fitContent();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.unsubscribeClick(handleClick);
        chartRef.current.remove();
        chartRef.current = null;
        candleSeriesRef.current = null;
      }
    };
  }, [symbol, interval, isDarkMode, isSelectMode, onKeyPointDetected]);

  // Update visual representation of selected points
  useEffect(() => {
    if (!candleSeriesRef.current || baseData.length === 0) return;

    const updatedData = baseData.map(candle => ({
      ...candle,
      color: selectedPoints.has(candle.time as number) ? '#FFB74D' : undefined,
      wickColor: selectedPoints.has(candle.time as number) ? '#FFB74D' : undefined,
    }));

    candleSeriesRef.current.setData(updatedData);
    updateMarkers(selectedPoints);
  }, [selectedPoints, baseData]);

  // Update cursor based on selection mode
  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.applyOptions({
      crosshair: {
        mode: isSelectMode ? CrosshairMode.Normal : CrosshairMode.Magnet,
      },
    });
  }, [isSelectMode]);

  return (
    <div className="w-full h-[500px] relative">
      <div ref={chartContainerRef} className="w-full h-full" />
      <div className="absolute top-4 left-4 flex items-center gap-4">
        <div className="text-sm font-medium text-gray-200">
          {symbol} {interval}
        </div>
      </div>
    </div>
  );
}; 