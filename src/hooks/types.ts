export interface CandlestickData {
  time: string | number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketMakerOrder {
  price: number;
  size: number;
  side: 'buy' | 'sell';
}

export interface VolumeData {
  time: string | number;
  value: number;
  color: string;
}

export interface Transaction {
  id: string;
  price: number;
  volume: number;
  side: 'buy' | 'sell';
  timestamp: number;
}

// Define the series API interface for chart series
export interface ISeriesApi {
  update(data: any): void;
  setData(data: readonly any[]): void;
  data(): readonly any[];
  priceScale(): {
    applyOptions(options: any): void;
  };
}

export interface ChartRefs {
  chartRef: React.RefObject<any>;
  candlestickSeriesRef: React.RefObject<ISeriesApi | null>;
  volumeSeriesRef: React.RefObject<ISeriesApi | null>;
}
