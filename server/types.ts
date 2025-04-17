export interface ChartDataPoint {
    time: string | number;
    open: string | number;
    high: string | number;
    low: string | number;
    close: string | number;
    volume?: number;
    [key: string]: any;  // Allow for additional properties
}

export interface ProcessedChartDataPoint {
    time: number;
    localTime: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
    [key: string]: any;  // Allow for additional properties
}

export interface ChartStatistics {
    priceAction: {
        high: {
            value: number;
            time?: string;
            volume?: number;
            previousSwing: number;
        };
        low: {
            value: number;
            time?: string;
            volume?: number;
            previousSwing: number;
        };
        current: {
            price: number;
            volume?: number;
            change: {
                absolute: number;
                percentage: string;
            };
            trend: 'upward' | 'downward';
        };
    };
    volume: {
        average: number;
        highest: number;
        lowest: number;
        trend: 'increasing' | 'decreasing';
        distribution: {
            atHigh: number;
            atLow: number;
            volumeProfile: Record<number, number>;
        };
    };
    momentum: {
        rateOfChange: string;
        volumeWeightedPrice: number;
        priceVelocity: string[];
    };
    patterns: {
        candlesticks: Array<{
            type: string;
            size: number;
            upperShadow: number;
            lowerShadow: number;
            bodyToShadowRatio: number;
        }>;
        trendPatterns: {
            higherHighs: boolean;
            higherLows: boolean;
            lowerHighs: boolean;
            lowerLows: boolean;
        };
    };
    supportResistance: {
        recentPivots: Array<{
            type: 'support' | 'resistance';
            price: number;
            time: string;
        }>;
        volumeClusters: Array<{
            price: number;
            volume: number;
        }>;
        keyLevels: number[];
    };
    timeRange: {
        start: string;
        end: string;
        duration: string;
    };
} 