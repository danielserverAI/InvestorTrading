import { ChartDataPoint, ProcessedChartDataPoint } from '../types';

// Helper function to safely parse numeric values
function safeParseNumber(value: number | string | undefined): number | null {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
    }
    return null;
}

// Helper function to safely convert timestamp to local date string
function safeGetLocalTime(timestamp: number | string): string {
    try {
        const numericTimestamp = typeof timestamp === 'number' ? 
            timestamp : 
            parseFloat(timestamp as string);
            
        // Check if timestamp is in milliseconds or seconds
        const date = new Date(numericTimestamp > 9999999999 ? numericTimestamp : numericTimestamp * 1000);
        return date.toLocaleString();
    } catch (error) {
        console.error("Error converting timestamp:", error);
        return 'Invalid Date';
    }
}

// Helper function to determine candlestick pattern
function determineCandlestickPattern(candle: ProcessedChartDataPoint) {
    if (!candle.open || !candle.close || !candle.high || !candle.low) {
        return 'invalid';
    }
    
    const bodySize = Math.abs(candle.close - candle.open);
    const upperShadow = candle.high - Math.max(candle.open, candle.close);
    const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
    const totalSize = candle.high - candle.low;

    if (bodySize / totalSize < 0.1) return 'doji';
    if (candle.close > candle.open && bodySize / totalSize > 0.6) return 'strong_bullish';
    if (candle.close < candle.open && bodySize / totalSize > 0.6) return 'strong_bearish';
    if (lowerShadow > bodySize * 2 && candle.close > candle.open) return 'hammer';
    if (upperShadow > bodySize * 2 && candle.close < candle.open) return 'shooting_star';
    return 'normal';
}

// Helper function to find pivot points
function findPivotPoints(data: ProcessedChartDataPoint[]) {
    if (data.length < 3) {
        console.warn("Not enough data points to find pivot points");
        return [];
    }

    return data.slice(1, -1).map((d, i) => {
        const prev = data[i];
        const next = data[i + 2];
        
        if (!d.high || !d.low || !prev.high || !prev.low || !next.high || !next.low) {
            return null;
        }

        if (d.high > prev.high && d.high > next.high) {
            return {
                type: 'resistance',
                price: d.high,
                time: d.localTime
            };
        }
        if (d.low < prev.low && d.low < next.low) {
            return {
                type: 'support',
                price: d.low,
                time: d.localTime
            };
        }
        return null;
    }).filter(p => p !== null);
}

// Helper function to find volume clusters
function findVolumeClusters(data: ProcessedChartDataPoint[]) {
    const priceVolumes: Record<number, number> = {};
    const validData = data.filter(d => d.volume !== undefined && d.volume > 0);
    
    if (validData.length === 0) {
        console.warn("No valid volume data found");
        return [];
    }

    validData.forEach(d => {
        if (d.high !== undefined && d.low !== undefined) {
            const avgPrice = Math.round(((d.high + d.low) / 2) * 100) / 100;
            priceVolumes[avgPrice] = (priceVolumes[avgPrice] || 0) + (d.volume || 0);
        }
    });

    return Object.entries(priceVolumes)
        .map(([price, volume]) => ({
            price: parseFloat(price),
            volume
        }))
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 5); // Top 5 volume clusters
}

// Helper function to find key price levels
function findKeyPriceLevels(data: ProcessedChartDataPoint[]) {
    const levels = new Set<number>();
    const validData = data.filter(d => d.high !== undefined && d.low !== undefined);
    
    if (validData.length === 0) {
        console.warn("No valid price data found");
        return [];
    }

    validData.forEach(d => {
        if (d.high !== undefined && d.low !== undefined) {
            levels.add(Math.round(d.high * 100) / 100);
            levels.add(Math.round(d.low * 100) / 100);
            
            const roundedHigh = Math.round(d.high);
            const roundedLow = Math.round(d.low);
            levels.add(roundedHigh);
            levels.add(roundedLow);
        }
    });

    return Array.from(levels).sort((a, b) => a - b);
}

// Helper function to calculate rate of change
function calculateRateOfChange(data: ProcessedChartDataPoint[], interval: string): string {
    const lookbackPeriods: Record<string, number> = {
        '1D': 5,    // 5 bars for intraday
        '1W': 4,    // 4 weeks
        '1M': 3,    // 3 months
        '1Y': 12    // 12 months
    };

    const periods = lookbackPeriods[interval] || 5;
    const validData = data.filter(d => d.close !== undefined);
    
    if (validData.length === 0) {
        console.warn("No valid price data for rate of change calculation");
        return '0.00%';
    }
    
    if (validData.length <= periods) {
        const startPrice = validData[0]?.close;
        const endPrice = validData[validData.length - 1]?.close;
        
        if (typeof startPrice === 'number' && typeof endPrice === 'number') {
            return ((endPrice - startPrice) / startPrice * 100).toFixed(2) + '%';
        }
        return '0.00%';
    }

    const currentPrice = validData[validData.length - 1]?.close;
    const pastPrice = validData[validData.length - 1 - periods]?.close;
    
    if (typeof currentPrice === 'number' && typeof pastPrice === 'number') {
        return ((currentPrice - pastPrice) / pastPrice * 100).toFixed(2) + '%';
    }
    
    return '0.00%';
}

// Main function to process chart data
export function processChartData(rawData: ChartDataPoint[]): ProcessedChartDataPoint[] {
    return rawData.map((d: ChartDataPoint): ProcessedChartDataPoint => {
        const timestamp = safeParseNumber(d.time);
        if (timestamp === null) {
            console.error("Invalid timestamp in data point:", d);
            throw new Error("Invalid timestamp in data point");
        }

        const open = safeParseNumber(d.open);
        const high = safeParseNumber(d.high);
        const low = safeParseNumber(d.low);
        const close = safeParseNumber(d.close);
        const volume = safeParseNumber(d.volume);

        if (open === null || high === null || low === null || close === null) {
            console.error("Invalid price data in data point:", d);
            throw new Error("Invalid price data in data point");
        }

        return {
            ...d,
            time: timestamp,
            localTime: safeGetLocalTime(timestamp),
            open,
            high,
            low,
            close,
            volume: volume || 0
        };
    });
}

// Main function to calculate chart statistics
export function calculateChartStatistics(processedData: ProcessedChartDataPoint[], interval: string) {
    // Validate data range
    if (processedData.length === 0) {
        throw new Error("No data points provided for analysis");
    }

    // Sort data by time to ensure correct range analysis
    const sortedData = [...processedData].sort((a, b) => a.time - b.time);

    // Find highest and lowest points with their exact data points
    let highestPoint = sortedData[0];
    let lowestPoint = sortedData[0];
    let highestValue = sortedData[0].high;
    let lowestValue = sortedData[0].low;

    sortedData.forEach(point => {
        if (point.high > highestValue) {
            highestValue = point.high;
            highestPoint = point;
        }
        if (point.low < lowestValue) {
            lowestValue = point.low;
            lowestPoint = point;
        }
    });

    const timeRange = {
        start: new Date(sortedData[0].time * 1000).toLocaleString(),
        end: new Date(sortedData[sortedData.length - 1].time * 1000).toLocaleString()
    };

    console.log("[chartAnalysis] Analyzing data range:", timeRange);
    console.log("[chartAnalysis] Price range:", {
        highest: {
            price: highestValue,
            time: new Date(highestPoint.time * 1000).toLocaleString(),
            timestamp: highestPoint.time
        },
        lowest: {
            price: lowestValue,
            time: new Date(lowestPoint.time * 1000).toLocaleString(),
            timestamp: lowestPoint.time
        }
    });

    return {
        priceAction: {
            high: {
                value: highestValue,
                time: new Date(highestPoint.time * 1000).toLocaleString(),
                timestamp: highestPoint.time,
                volume: highestPoint.volume,
                previousSwing: sortedData
                    .filter(d => d.high < highestValue)
                    .reduce((max, d) => Math.max(max, d.high), -Infinity)
            },
            low: {
                value: lowestValue,
                time: new Date(lowestPoint.time * 1000).toLocaleString(),
                timestamp: lowestPoint.time,
                volume: lowestPoint.volume,
                previousSwing: sortedData
                    .filter(d => d.low > lowestValue)
                    .reduce((min, d) => Math.min(min, d.low), Infinity)
            },
            current: {
                price: sortedData[sortedData.length - 1].close,
                volume: sortedData[sortedData.length - 1].volume,
                change: {
                    absolute: sortedData[sortedData.length - 1].close - sortedData[0].open,
                    percentage: ((sortedData[sortedData.length - 1].close - sortedData[0].open) / sortedData[0].open * 100).toFixed(2) + '%'
                },
                trend: sortedData[sortedData.length - 1].close > sortedData[0].open ? 'upward' : 'downward'
            }
        },
        volume: {
            average: sortedData.reduce((sum, d) => sum + (d.volume || 0), 0) / sortedData.length,
            highest: Math.max(...sortedData.map(d => d.volume || 0)),
            lowest: Math.min(...sortedData.map(d => d.volume || 0)),
            trend: (sortedData[sortedData.length - 1]?.volume || 0) > 
                  (sortedData.reduce((sum, d) => sum + (d.volume || 0), 0) / sortedData.length) 
                  ? 'increasing' : 'decreasing',
            distribution: {
                atHigh: highestPoint.volume || 0,
                atLow: lowestPoint.volume || 0,
                volumeProfile: sortedData.reduce((acc, d) => {
                    const priceLevel = Math.round(((d.high + d.low) / 2) * 100) / 100;
                    acc[priceLevel] = (acc[priceLevel] || 0) + (d.volume || 0);
                    return acc;
                }, {} as Record<number, number>)
            }
        },
        momentum: {
            rateOfChange: calculateRateOfChange(sortedData, interval),
            volumeWeightedPrice: sortedData.reduce((sum, d) => sum + (d.close * (d.volume || 0)), 0) /
                               sortedData.reduce((sum, d) => sum + (d.volume || 0), 0),
            priceVelocity: sortedData.slice(-5).map((d, i, arr) => 
                i > 0 ? ((d.close - arr[i-1].close) / arr[i-1].close * 100).toFixed(2) + '%' : '0%'
            )
        },
        patterns: {
            candlesticks: sortedData.slice(-3).map(d => ({
                type: determineCandlestickPattern(d),
                size: Math.abs(d.close - d.open),
                upperShadow: d.high - Math.max(d.open, d.close),
                lowerShadow: Math.min(d.open, d.close) - d.low,
                bodyToShadowRatio: Math.abs(d.close - d.open) / (d.high - d.low)
            })),
            trendPatterns: {
                higherHighs: sortedData.length > 1 && 
                            sortedData[sortedData.length - 1]?.high > sortedData[sortedData.length - 2]?.high,
                higherLows: sortedData.length > 1 && 
                           sortedData[sortedData.length - 1]?.low > sortedData[sortedData.length - 2]?.low,
                lowerHighs: sortedData.length > 1 && 
                           sortedData[sortedData.length - 1]?.high < sortedData[sortedData.length - 2]?.high,
                lowerLows: sortedData.length > 1 && 
                          sortedData[sortedData.length - 1]?.low < sortedData[sortedData.length - 2]?.low
            }
        },
        supportResistance: {
            recentPivots: findPivotPoints(sortedData.slice(-20)),
            volumeClusters: findVolumeClusters(sortedData),
            keyLevels: findKeyPriceLevels(sortedData)
        },
        timeRange: {
            start: timeRange.start,
            end: timeRange.end,
            duration: `${sortedData.length} data points`,
            startTimestamp: sortedData[0].time,
            endTimestamp: sortedData[sortedData.length - 1].time
        }
    };
} 