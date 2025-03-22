export interface ChartData {
  Date: string;
  Close: number;
  Open?: number;
  High?: number;
  Low?: number;
}

export interface ChartDimensions {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export type ChartType = 'line' | 'candlestick' | 'bar';

export interface ChartStyle {
  lineColor: string;
  lineWidth: number;
  candlestickUpColor: string;
  candlestickDownColor: string;
  barColor: string;
  backgroundColor: string;
  gridColor: string;
  textColor: string;
}

export interface ChartConfig {
  yRange: [number, number];
  tickInterval: string;
  tickFormat: string;
  type: ChartType;
  style: ChartStyle;
  enableZoom: boolean;
  enablePan: boolean;
  enableTooltip: boolean;
}

export interface ChartMetadata {
  name: string;
  timeframe: string;
  startDate: string;
  endDate: string;
}

export interface CandlestickData {
  Date: Date;
  Open: number;
  High: number;
  Low: number;
  Close: number;
}