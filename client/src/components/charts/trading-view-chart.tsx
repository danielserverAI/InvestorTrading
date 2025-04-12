import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time, CrosshairMode, LineWidth, MouseEventParams, SeriesMarker, LineData, SeriesType, SingleValueData, BarData, TickMarkType, SeriesDataItemTypeMap, PriceFormat, PriceFormatBuiltIn, SeriesMarkerPosition, SeriesMarkerShape, LogicalRange } from 'lightweight-charts';
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

// Add type for exposed handle
export interface ChartHandle {
  getChartContext: () => {
    symbol: string;
    interval: string;
    chartData: (CandlestickData<Time> | BarData<Time>)[];
    markers: SeriesMarker<Time>[];
    selectedPoints: Set<number>;
  };
  // Add method to set visible range
  setVisibleRange: (range: { from: Time, to: Time }) => void;
  // Add method to get visible range (needed for context enhancement later)
  getVisibleRange: () => { from: Time, to: Time } | null;
}

// Mock function to simulate fetching data for different intervals/ranges
const fetchIntervalData = (symbol: string, rangeSelection: string): CandlestickData<Time>[] => {
  console.log(`Fetching data for ${symbol}, range: ${rangeSelection}`); 
  const data: CandlestickData<Time>[] = [];
  let numDataPoints = 100;
  let startDate = new Date();
  let intervalMinutes = 24 * 60; // Default to daily candles (minutes per candle)

  switch (rangeSelection) {
    case '1D':
      numDataPoints = (24 * 60) / 10; // ~144 10-minute candles for 1 day
      intervalMinutes = 10; 
      startDate.setDate(startDate.getDate() - 1); // Start data generation from 1 day ago
      break;
    case '1W':
      numDataPoints = (7 * 24); // ~168 1-hour candles for 1 week
      intervalMinutes = 60;
      startDate.setDate(startDate.getDate() - 7); // Start data generation from 1 week ago
      break;
    case '1M':
      numDataPoints = 30; // ~30 daily candles for 1 month
      intervalMinutes = 24 * 60;
      startDate.setMonth(startDate.getMonth() - 1); // Start data generation from 1 month ago
      break;
    case '1Y':
      numDataPoints = 52; // ~52 weekly candles for 1 year
      intervalMinutes = 7 * 24 * 60;
      startDate.setFullYear(startDate.getFullYear() - 1); // Start data generation from 1 year ago
      break;
    default: // Default might fetch e.g. 100 daily points 
       numDataPoints = 100;
       intervalMinutes = 24 * 60;
       startDate.setDate(startDate.getDate() - numDataPoints);
      break;
  }

  const basePrice = (symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 100) + 100;
  let currentPrice = basePrice;
  let volatility = (intervalMinutes / (24 * 60)) * 2 + 0.5; // Adjust volatility based on interval
  let trend = 0;
  const symbolSeed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seededRandom = (seedOffset: number) => {
    const x = Math.sin(symbolSeed + seedOffset) * 10000;
    return x - Math.floor(x);
  };
  
  const endDate = new Date(); // Generate up to now

  for (let i = numDataPoints -1; i >= 0; i--) {
    // Calculate timestamp for this data point
    const pointDate = new Date(endDate.getTime() - i * intervalMinutes * 60 * 1000);
    const timestamp = Math.floor(pointDate.getTime() / 1000);

    // Skip weekends only if generating daily or higher frequency data that might fall on one
    if (intervalMinutes >= 24 * 60 && (pointDate.getDay() === 0 || pointDate.getDay() === 6)) continue;
    // Skip non-market hours for intraday (simplistic example)
    if (intervalMinutes < 24*60 && (pointDate.getHours() < 9 || pointDate.getHours() >= 17)) continue;

    const seedOffset = timestamp; // Use timestamp for seeding

    // Adjust trend/volatility (maybe less often for smaller intervals?)
    if (i % (Math.max(1, Math.floor(numDataPoints / 10))) === 0) { 
      trend = (seededRandom(seedOffset) - 0.5) * 0.5; // Smaller trend adjustments
      volatility = (0.5 + seededRandom(seedOffset + 1) * 1.5) * (intervalMinutes / (24 * 60) * 2 + 0.5);
    }

    const trendBias = trend * (intervalMinutes / (24*60)); // Bias less influential on smaller intervals
    const changePercent = (seededRandom(seedOffset + 2) - 0.5 + trendBias) * volatility;
    const open = currentPrice;
    let close = open * (1 + changePercent / 100);
    close = Math.max(close, 0.01); // Ensure price doesn't go negative
    
    const range = Math.abs(close - open);
    const highExtra = range * (0.1 + seededRandom(seedOffset + 3) * 0.2);
    const lowExtra = range * (0.1 + seededRandom(seedOffset + 4) * 0.2);
    
    const high = Math.max(open, close) + highExtra;
    const low = Math.max(0.01, Math.min(open, close) - lowExtra); // Ensure low doesn't go negative

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
  // Data is generated chronologically, no need to sort
  return data;
};

// Wrap component with forwardRef
export const TradingViewChart = forwardRef<ChartHandle, TradingViewChartProps>(({ 
  symbol, 
  interval,
  onKeyPointDetected,
  selectedActionConfig, // Receive action config
  chartType = 'candles'
}, ref) => { // Add ref parameter here

  // *** ALL COMPONENT LOGIC MOVED INSIDE forwardRef ***
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

  // Expose getChartContext via ref
  useImperativeHandle(ref, () => ({
    getChartContext: () => ({
      symbol,
      interval,
      chartData,
      markers,
      selectedPoints,
    }),
    setVisibleRange: (range: { from: Time, to: Time }) => {
      chartRef.current?.timeScale().setVisibleRange(range);
    },
    getVisibleRange: () => {
       // Ensure chart and timeScale exist
      const timeScale = chartRef.current?.timeScale();
      if (!timeScale) return null;
      // Check if getVisibleRange exists and is callable
      if (typeof timeScale.getVisibleRange === 'function') {
          return timeScale.getVisibleRange();
      } 
      // Add a fallback or log warning if method doesn't exist (older lib version?)
      console.warn("getVisibleRange method not available on timeScale");
      return null; 
    }
  }), [symbol, interval, chartData, markers, selectedPoints]); // Dependencies for the exposed data

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

  // THIS EFFECT HANDLES CHART CREATION & INITIAL SERIES & VISIBLE RANGE
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

    // --- SET VISIBLE RANGE BASED ON INTERVAL ---
    const now = new Date();
    let fromDate = new Date(now); 

    switch (interval) {
      case '1D':
        fromDate.setDate(now.getDate() - 1);
        break;
      case '1W':
        fromDate.setDate(now.getDate() - 7);
        break;
      case '1M':
        fromDate.setMonth(now.getMonth() - 1);
        break;
      case '1Y':
        fromDate.setFullYear(now.getFullYear() - 1);
        break;
      default: // Default zoom if interval is not recognized (e.g., initial load?)
        fromDate.setMonth(now.getMonth() - 3);
        break;
    }

    const fromTimestamp = Math.floor(fromDate.getTime() / 1000) as Time;
    const toTimestamp = Math.floor(now.getTime() / 1000) as Time;

    console.log(`[TradingViewChart useEffect] Setting visible range for ${interval}:`, { from: fromTimestamp, to: toTimestamp });
    chartRef.current.timeScale().setVisibleRange({ from: fromTimestamp, to: toTimestamp });
    // --- END SET VISIBLE RANGE --- 

    // Add resize observer
    const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
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
        candleSeriesRef.current = null;
        lineSeriesRef.current = null;
        barSeriesRef.current = null;
        areaSeriesRef.current = null;
        baselineSeriesRef.current = null;
    };
  }, [chartData, chartType, symbol, interval]); // Keep dependencies


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

  // *** RETURN JSX AT THE END OF THE forwardRef FUNCTION ***
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

}); // Close forwardRef

// Add display name for DevTools
TradingViewChart.displayName = 'TradingViewChart'; 