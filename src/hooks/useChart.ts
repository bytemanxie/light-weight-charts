import { useRef, useEffect } from 'react';
import * as LightweightCharts from 'lightweight-charts';
import { CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import { ChartRefs, ISeriesApi } from './types';

// Define specific interfaces for the series based on their usage

export function useChart(containerRef: React.RefObject<HTMLDivElement | null>): ChartRefs {
  const chartRef = useRef<LightweightCharts.IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi | null>(null);

  useEffect(() => {
    // Initialize chart
    if (containerRef.current) {
      const chartOptions: LightweightCharts.DeepPartial<LightweightCharts.ChartOptions> = {
        layout: {
          background: { color: '#222' },
          textColor: '#DDD',
        },
        grid: {
          vertLines: { color: '#444' },
          horzLines: { color: '#444' },
        },
        width: containerRef.current.clientWidth,
        height: 500,
      };
      
      chartRef.current = LightweightCharts.createChart(containerRef.current, chartOptions);
      
      // Use the new API format for v5.0.4
      candlestickSeriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });
      
      // Create volume series using the new API format
      volumeSeriesRef.current = chartRef.current.addSeries(HistogramSeries, {
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
      });
      
      // Configure the price scale for the volume series
      if (volumeSeriesRef.current) {
        volumeSeriesRef.current.priceScale().applyOptions({
          scaleMargins: {
            top: 0.8,
            bottom: 0,
          },
        });
      }
      
      // Handle window resize
      const handleResize = (): void => {
        if (chartRef.current && containerRef.current) {
          chartRef.current.applyOptions({
            width: containerRef.current.clientWidth,
          });
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        // Clean up
        window.removeEventListener('resize', handleResize);
        if (chartRef.current) {
          chartRef.current.remove();
        }
      };
    }
  }, [containerRef]);

  return {
    chartRef,
    candlestickSeriesRef,
    volumeSeriesRef
  };
}
