import { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time, CrosshairMode, LineWidth, MouseEventParams, SeriesMarker, LineData, SeriesType, SingleValueData, BarData, TickMarkType, SeriesDataItemTypeMap, PriceFormat, PriceFormatBuiltIn, SeriesMarkerPosition, SeriesMarkerShape } from 'lightweight-charts';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper function to convert YYYY-MM-DD to UNIX timestamp (seconds)
const dateToTimestamp = (dateString: string): number => {
  // Basic validation, return NaN for invalid dates to potentially filter later
  const date = new Date(dateString);
  return !isNaN(date.getTime()) ? date.getTime() / 1000 : NaN;
};

// Define and export MarkerConfig/ActionConfig type
// Let's rename it to ActionConfig here too for internal consistency
export interface ActionConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  // Marker properties are optional
  shape?: SeriesMarkerShape;
  color?: string;
  position?: SeriesMarkerPosition;
}

interface TradingViewChartProps {
  symbol: string;
  interval: string;
  onKeyPointDetected?: (point: { time: number; price: number }) => void;
  selectedActionConfig?: ActionConfig; // Add selectedActionConfig prop
  chartType: 'candles' | 'line' | 'bars' | 'area' | 'baseline';
}

// Mock function to simulate fetching data for different intervals
const fetchIntervalData = (symbol: string, interval: string): CandlestickData<Time>[] => {
  console.log(`Fetching ${interval} data for ${symbol}`); // Simulate API call
  const data: CandlestickData<Time>[] = [];
  let days = 100;
  let startDate = new Date();
  let multiplier = 1; // Daily by default

  switch (interval) {
    case '1W':
      days = 52; // Roughly 52 weeks in a year
      multiplier = 7;
      break;
    case '1M':
      days = 12 * 3; // 3 years of monthly data
      multiplier = 30; // Approximate days in a month
      break;
    case '1Y':
      days = 10; // 10 years of yearly data
      multiplier = 365;
      break;
    case '1D':
    default:
      days = 100; // 100 days of daily data
      multiplier = 1;
      break;
  }

  const basePrice = (symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 100) + 100;
  let currentPrice = basePrice;
  let volatility = 2;
  let trend = 0;
  const symbolSeed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seededRandom = (seedOffset: number) => {
    const x = Math.sin(symbolSeed + seedOffset) * 10000;
    return x - Math.floor(x);
  };

  for (let i = days; i >= 0; i--) {
    const date = new Date(startDate);
    date.setDate(date.getDate() - (i * multiplier));
    
    // Skip weekends for daily data only (can be refined for other intervals)
    if (interval === '1D' && (date.getDay() === 0 || date.getDay() === 6)) continue;

    const seedOffset = i * multiplier; // Use a consistent offset for seeding

    if (i % 20 === 0) { // Adjust trend/volatility less frequently for longer intervals
      trend = Math.floor(seededRandom(seedOffset) * 3) - 1;
      volatility = 1.5 + seededRandom(seedOffset) * 2;
    }

    const trendBias = trend * 0.3;
    const changePercent = (seededRandom(seedOffset) - 0.5 + trendBias) * volatility;
    const open = currentPrice;
    const close = open * (1 + changePercent / 100);
    
    const range = Math.abs(close - open);
    const highExtra = range * (0.2 + seededRandom(seedOffset + 1) * 0.3);
    const lowExtra = range * (0.2 + seededRandom(seedOffset + 2) * 0.3);
    
    const high = Math.max(open, close) + highExtra;
    const low = Math.min(open, close) - lowExtra;
    const timestamp = date.getTime() / 1000;

    if (!isNaN(timestamp)) {
      data.push({
        time: timestamp as Time,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
      });
    }

    currentPrice = close;
  }
  // Sort data just in case (timestamps might not be perfectly sequential)
  return data.sort((a, b) => (a.time as number) - (b.time as number));
};

export const TradingViewChart = ({ 
  symbol, 
  interval,
  onKeyPointDetected,
  selectedActionConfig, // Receive action config
  chartType = 'candles'
}: TradingViewChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const barSeriesRef = useRef<ISeriesApi<'Bar'> | null>(null);
  const areaSeriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const baselineSeriesRef = useRef<ISeriesApi<'Baseline'> | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState<Set<number>>(new Set());
  const [chartData, setChartData] = useState<(CandlestickData<Time> | BarData<Time>)[]>([]);
  const [markers, setMarkers] = useState<SeriesMarker<Time>[]>([]);

  // Reset selections and markers when symbol or interval changes
  useEffect(() => {
    setSelectedPoints(new Set());
    setMarkers([]);
  }, [symbol, interval]);

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

  // Fetch data when symbol or interval changes
  useEffect(() => {
    const data = fetchIntervalData(symbol, interval);
    setChartData(data);
    // Reset markers and selections when data changes
    setMarkers([]); 
    setSelectedPoints(new Set());
  }, [symbol, interval]);

  // Generate line/area/baseline data from candle/bar data
  const generateSingleValueData = (data: (CandlestickData<Time> | BarData<Time>)[]): SingleValueData<Time>[] => {
    return data.map(dataPoint => ({
      time: dataPoint.time,
      value: 'close' in dataPoint ? dataPoint.close : (dataPoint as SingleValueData<Time>).value, // Use close if available
    }));
  };

  // Function to get the currently active series API instance
  const getActiveSeries = useCallback((): ISeriesApi<SeriesType, Time> | null => {
    switch (chartType) {
        case 'candles': return candleSeriesRef.current;
        case 'bars': return barSeriesRef.current;
        case 'line': return lineSeriesRef.current;
        case 'area': return areaSeriesRef.current;
        case 'baseline': return baselineSeriesRef.current;
        default: return null;
    }
  }, [chartType]);

  // THIS EFFECT HANDLES CHART CREATION & INITIAL SERIES
  useEffect(() => {
    if (!chartContainerRef.current || !chartData || chartData.length === 0) return;

    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDark ? '#D1D5DB' : '#1F2937';

    const chartOptions = {
        layout: {
            background: { color: 'transparent' },
            textColor: textColor,
        },
        grid: {
            vertLines: { color: gridColor },
            horzLines: { color: gridColor },
        },
        crosshair: {
            mode: CrosshairMode.Normal,
        },
        rightPriceScale: {
            borderColor: gridColor,
        },
        timeScale: {
            borderColor: gridColor,
            timeVisible: true,
            secondsVisible: false,
            tickMarkFormatter: (time: Time, tickMarkType: TickMarkType) => {
              const date = new Date((time as number) * 1000);
              switch (tickMarkType) {
                  case TickMarkType.Year:
                      return date.getFullYear().toString();
                  case TickMarkType.Month:
                      return date.toLocaleDateString(undefined, { month: 'short' });
                  case TickMarkType.DayOfMonth:
                      return date.getDate().toString();
                  case TickMarkType.Time:
                      return date.toLocaleTimeString();
                  default:
                      return '';
              }
            }
        },
        handleScroll: true,
        handleScale: true,
    };

    chartRef.current = createChart(chartContainerRef.current, chartOptions);

    // --- BEGIN INITIAL SERIES CREATION --- 
    const singleValueData = generateSingleValueData(chartData);
    const priceLineColor = isDark ? '#A0A0A0' : '#505050';
    const priceFormat: PriceFormatBuiltIn = { type: 'price', precision: 2, minMove: 0.01 };
    const commonSeriesOptions = {
      lastValueVisible: true,
      priceLineVisible: true,
      priceLineWidth: 1 as LineWidth,
      priceLineColor: priceLineColor,
      priceLineStyle: 2, // Dashed
    };

    // Add initial series based on chartType prop
    switch (chartType) {
      case 'candles':
        candleSeriesRef.current = chartRef.current.addCandlestickSeries({
          ...commonSeriesOptions, priceFormat: priceFormat, upColor: '#26a69a', downColor: '#ef5350', borderUpColor: '#26a69a', borderDownColor: '#ef5350', wickUpColor: '#26a69a', wickDownColor: '#ef5350',
        });
        candleSeriesRef.current.setData(chartData as CandlestickData<Time>[]);
        break;
      case 'bars':
        barSeriesRef.current = chartRef.current.addBarSeries({
          ...commonSeriesOptions, priceFormat: priceFormat, upColor: '#26a69a', downColor: '#ef5350', thinBars: false,
        });
        barSeriesRef.current.setData(chartData as BarData<Time>[]);
        break;
      case 'area':
        areaSeriesRef.current = chartRef.current.addAreaSeries({
          ...commonSeriesOptions, priceFormat: priceFormat, lineColor: '#2962FF', topColor: '#2962FF', bottomColor: 'rgba(41, 98, 255, 0.28)', lineWidth: 2,
        });
        areaSeriesRef.current.setData(singleValueData);
        break;
      case 'baseline':
        baselineSeriesRef.current = chartRef.current.addBaselineSeries({
          ...commonSeriesOptions, priceFormat: priceFormat, baseValue: { type: 'price', price: singleValueData[0]?.value || 0 }, topLineColor: 'rgba(38, 166, 154, 1)', topFillColor1: 'rgba(38, 166, 154, 0.28)', topFillColor2: 'rgba(38, 166, 154, 0.05)', bottomLineColor: 'rgba(239, 83, 80, 1)', bottomFillColor1: 'rgba(239, 83, 80, 0.05)', bottomFillColor2: 'rgba(239, 83, 80, 0.28)',
        });
        baselineSeriesRef.current.setData(singleValueData);
        break;
      case 'line':
      default:
        lineSeriesRef.current = chartRef.current.addLineSeries({
          ...commonSeriesOptions, priceFormat: priceFormat, color: '#2962FF', lineWidth: 2,
        });
        lineSeriesRef.current.setData(singleValueData);
        break;
    }
    // --- END INITIAL SERIES CREATION --- 

    // Fit content initially
    chartRef.current.timeScale().fitContent();

    // Add resize observer
    const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
            // Apply both width and height
            chartRef.current.applyOptions({
              width: chartContainerRef.current.clientWidth,
              height: chartContainerRef.current.clientHeight
            });
        }
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainerRef.current);

    // Cleanup function
    return () => {
        resizeObserver.disconnect();
        chartRef.current?.remove();
        chartRef.current = null;
        // Clear series refs on cleanup
        candleSeriesRef.current = null;
        lineSeriesRef.current = null;
        barSeriesRef.current = null;
        areaSeriesRef.current = null;
        baselineSeriesRef.current = null;
    };
    // DEPENDENCIES: Now depends on data and type for initial setup
  }, [chartData, chartType, symbol, interval]); 


  // THIS EFFECT HANDLES CHART TYPE *UPDATES* and MARKERS
  useEffect(() => {
    if (!chartRef.current || !chartData || chartData.length === 0) return;
    
    // Check if chartType actually changed (or if it's the initial call - comparing refs)
    let currentSeriesType: SeriesType | null = null;
    if (candleSeriesRef.current) currentSeriesType = 'Candlestick';
    else if (lineSeriesRef.current) currentSeriesType = 'Line';
    else if (barSeriesRef.current) currentSeriesType = 'Bar';
    else if (areaSeriesRef.current) currentSeriesType = 'Area';
    else if (baselineSeriesRef.current) currentSeriesType = 'Baseline';

    const targetSeriesType = 
      chartType === 'candles' ? 'Candlestick' :
      chartType === 'bars' ? 'Bar' :
      chartType === 'line' ? 'Line' :
      chartType === 'area' ? 'Area' :
      chartType === 'baseline' ? 'Baseline' : null;

    // Only remove/re-add if the type is actually different
    if (targetSeriesType && currentSeriesType !== targetSeriesType) {
        console.log('Chart type changed, re-creating series');
        // Remove all existing series refs
        const removeSeries = (seriesRef: React.MutableRefObject<ISeriesApi<SeriesType> | null>) => {
          if (seriesRef.current && chartRef.current) {
            try { chartRef.current.removeSeries(seriesRef.current); } catch (e) { console.warn("Error removing series:", e); }
            seriesRef.current = null;
          }
        };
        removeSeries(candleSeriesRef as any);
        removeSeries(lineSeriesRef as any);
        removeSeries(barSeriesRef as any);
        removeSeries(areaSeriesRef as any);
        removeSeries(baselineSeriesRef as any);

        // Add the new series (copy logic from the main effect)
        const singleValueData = generateSingleValueData(chartData);
        const isDark = document.documentElement.classList.contains('dark');
        const priceLineColor = isDark ? '#A0A0A0' : '#505050';
        const priceFormat: PriceFormatBuiltIn = { type: 'price', precision: 2, minMove: 0.01 };
        const commonSeriesOptions = { lastValueVisible: true, priceLineVisible: true, priceLineWidth: 1 as LineWidth, priceLineColor: priceLineColor, priceLineStyle: 2 };

        switch (chartType) {
          case 'candles':
            candleSeriesRef.current = chartRef.current.addCandlestickSeries({ ...commonSeriesOptions, priceFormat: priceFormat, upColor: '#26a69a', downColor: '#ef5350', borderUpColor: '#26a69a', borderDownColor: '#ef5350', wickUpColor: '#26a69a', wickDownColor: '#ef5350' });
            candleSeriesRef.current.setData(chartData as CandlestickData<Time>[]);
            break;
          case 'bars':
            barSeriesRef.current = chartRef.current.addBarSeries({ ...commonSeriesOptions, priceFormat: priceFormat, upColor: '#26a69a', downColor: '#ef5350', thinBars: false });
            barSeriesRef.current.setData(chartData as BarData<Time>[]);
            break;
          case 'area':
            areaSeriesRef.current = chartRef.current.addAreaSeries({ ...commonSeriesOptions, priceFormat: priceFormat, lineColor: '#2962FF', topColor: '#2962FF', bottomColor: 'rgba(41, 98, 255, 0.28)', lineWidth: 2 });
            areaSeriesRef.current.setData(singleValueData);
            break;
          case 'baseline':
            baselineSeriesRef.current = chartRef.current.addBaselineSeries({ ...commonSeriesOptions, priceFormat: priceFormat, baseValue: { type: 'price', price: singleValueData[0]?.value || 0 }, topLineColor: 'rgba(38, 166, 154, 1)', topFillColor1: 'rgba(38, 166, 154, 0.28)', topFillColor2: 'rgba(38, 166, 154, 0.05)', bottomLineColor: 'rgba(239, 83, 80, 1)', bottomFillColor1: 'rgba(239, 83, 80, 0.05)', bottomFillColor2: 'rgba(239, 83, 80, 0.28)'});
            baselineSeriesRef.current.setData(singleValueData);
            break;
          case 'line':
          default:
            lineSeriesRef.current = chartRef.current.addLineSeries({ ...commonSeriesOptions, priceFormat: priceFormat, color: '#2962FF', lineWidth: 2 });
            lineSeriesRef.current.setData(singleValueData);
            break;
        }
    }
    
    // Update markers on the active series (should run even if type didn't change)
    const activeSeries = getActiveSeries();
    if (activeSeries) {
      // Sort markers by time before setting them
      const sortedMarkers = [...markers].sort((a, b) => (a.time as number) - (b.time as number));
      activeSeries.setMarkers(sortedMarkers);
    }

  }, [chartType, chartData, isDarkMode, markers]); // Keep isDarkMode here for theme updates


  // Click handler for markers/actions (keep as is)
  const handleClick = useCallback((param: MouseEventParams<Time>) => {
      if (!param.point || !param.time || !selectedActionConfig) return; // Need config
      
      const timeValue = param.time as number; 
      const activeSeries = getActiveSeries(); 
      if (!activeSeries) return;

      // --- Action Logic --- 
      const actionId = selectedActionConfig.id;
      
      if (actionId === 'delete') {
        // Find marker at/near the clicked time
        const markerIndex = markers.findIndex(m => Math.abs((m.time as number) - timeValue) < 1); // Allow small tolerance if needed
        if (markerIndex !== -1) {
            setMarkers(prev => prev.filter((_, index) => index !== markerIndex));
            console.log("Deleted marker near time:", timeValue);
        }
      } else if (actionId === 'select') {
        // Select Mode Logic (remains the same)
        const dataItem = param.seriesData.get(activeSeries);
        if (!dataItem) return;
        let price: number | undefined;
        if ('close' in dataItem) { price = dataItem.close; } 
        else if ('value' in dataItem) { price = dataItem.value; }
        if (price === undefined) return;

        const newSelectedPoints = new Set(selectedPoints);
        if (newSelectedPoints.has(timeValue)) {
          newSelectedPoints.delete(timeValue);
        } else {
          newSelectedPoints.add(timeValue);
          if (onKeyPointDetected) {
            onKeyPointDetected({ time: timeValue, price });
          }
        }
        setSelectedPoints(newSelectedPoints);
      } else { // It's a marker type
         // Ensure marker properties exist in the config
         if (selectedActionConfig.position && selectedActionConfig.color && selectedActionConfig.shape) {
             const newMarker: SeriesMarker<Time> = {
                time: timeValue as Time,
                position: selectedActionConfig.position, 
                color: selectedActionConfig.color, 
                shape: selectedActionConfig.shape, 
                text: selectedActionConfig.label.substring(0,1),
            };
            setMarkers(prevMarkers => [...prevMarkers, newMarker]); 
         }
      }
  }, [selectedActionConfig, markers, onKeyPointDetected, getActiveSeries]);

  // Attach click handler (keep as is)
  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.subscribeClick(handleClick);
    return () => {
      chartRef.current?.unsubscribeClick(handleClick);
    };
  }, [handleClick]); // Add handleClick dependency

  return (
    <div className="w-full h-full relative"> 
      <div 
        ref={chartContainerRef}
        className="w-full h-full bg-transparent min-h-[250px]" 
      />
      
      <div className="absolute top-4 left-4 flex items-center gap-4 pointer-events-none"> 
        <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-100/80 dark:bg-neutral-900/80 px-2 py-1 rounded">
          {symbol} · {interval}
        </div>
      </div>
    </div>
  );
}; 