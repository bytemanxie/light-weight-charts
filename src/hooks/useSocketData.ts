import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { CandlestickData, MarketMakerOrder, VolumeData, Transaction, ChartRefs } from './types';

export function useSocketData(chartRefs: ChartRefs) {
  const { chartRef, candlestickSeriesRef, volumeSeriesRef } = chartRefs;
  const [marketMakerOrders, setMarketMakerOrders] = useState<MarketMakerOrder[]>([]);
  const [latestPrice, setLatestPrice] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const transactionCountRef = useRef<number>(0);
  const [transactionsPerSecond, setTransactionsPerSecond] = useState<number>(0);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const pendingTransactionsRef = useRef<Transaction[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const initialDataLoadedRef = useRef<boolean>(false);
  const historicalDataRef = useRef<CandlestickData[]>([]);
  const [isLoadingMoreData, setIsLoadingMoreData] = useState<boolean>(false);

  // Function to request more historical data
  const requestMoreHistoricalData = useCallback((limit: number = 60, before?: number) => {
    if (socketRef.current && !isLoadingMoreData) {
      setIsLoadingMoreData(true);
      socketRef.current.emit('request-historical-data', { limit, before });
    }
  }, [isLoadingMoreData]);

  // Function to update chart with historical data
  const updateChartWithHistoricalData = useCallback((data: CandlestickData[]) => {
    if (candlestickSeriesRef.current && volumeSeriesRef.current) {
      // Merge with existing data if needed
      const mergedData = [...historicalDataRef.current, ...data].sort((a, b) => {
        // Sort by time
        return typeof a.time === 'number' && typeof b.time === 'number' 
          ? a.time - b.time 
          : String(a.time).localeCompare(String(b.time));
      });
      
      // Remove duplicates (by time)
      const uniqueData = mergedData.filter((item, index, self) => 
        index === self.findIndex(t => t.time === item.time)
      );
      
      // Update the ref
      historicalDataRef.current = uniqueData;
      
      // Update the chart
      candlestickSeriesRef.current?.setData(uniqueData);

      // Set volume data
      const volumeData: VolumeData[] = uniqueData.map(item => ({
        time: item.time,
        value: item.volume,
        color: item.close >= item.open ? '#26a69a' : '#ef5350',
      }));

      volumeSeriesRef.current.setData(volumeData);

      // Set latest price
      if (uniqueData.length > 0) {
        setLatestPrice(uniqueData[uniqueData.length - 1].close);
      }
    }
  }, [candlestickSeriesRef, volumeSeriesRef]);

  useEffect(() => {
    // Get the socket server URL from environment variables or use a default
    const socketServerUrl = import.meta.env.VITE_SOCKET_SERVER_URL || 'http://localhost:3001';
    
    // Connect to WebSocket server
    socketRef.current = io(socketServerUrl);

    // Handle historical data
    socketRef.current.on('historical-data', (data: CandlestickData[]) => {
      if (candlestickSeriesRef.current && volumeSeriesRef.current) {
        // Store the historical data
        historicalDataRef.current = data;
        
        // Update the chart
        candlestickSeriesRef.current?.setData(data);

        // Set volume data
        const volumeData: VolumeData[] = data.map(item => ({
          time: item.time,
          value: item.volume,
          color: item.close >= item.open ? '#26a69a' : '#ef5350',
        }));

        volumeSeriesRef.current.setData(volumeData);

        // Set latest price
        if (data.length > 0) {
          setLatestPrice(data[data.length - 1].close);
        }

        // Only fit content on initial load
        if (chartRef.current && !initialDataLoadedRef.current) {
          chartRef.current.timeScale().fitContent();
          initialDataLoadedRef.current = true;
        }
      }
    });

    // Handle response to historical data request
    socketRef.current.on('historical-data-response', (data: CandlestickData[]) => {
      updateChartWithHistoricalData(data);
      setIsLoadingMoreData(false);
    });

    // Handle real-time candlestick updates
    socketRef.current.on('candlestick-update', (data: CandlestickData) => {
      try {
        if (candlestickSeriesRef.current && volumeSeriesRef.current) {
          // Update candlestick series with new data
          candlestickSeriesRef.current?.update(data);

          // Update volume series with new data
          volumeSeriesRef.current.update({
            time: data.time,
            value: data.volume,
            color: data.close >= data.open ? 'rgba(0, 150, 136, 0.5)' : 'rgba(255, 82, 82, 0.5)'
          });

          // Update latest price
          setLatestPrice(data.close);

          // Add to our local historical data cache
          historicalDataRef.current = [...historicalDataRef.current, data]
            // Keep only the most recent 1000 candles in the client-side cache
            .slice(-1000);

          // Don't fit content on updates to preserve user's view state
          // This allows users to zoom and pan freely without disruption
        }
      } catch (error) {
        console.error('Error updating candlestick chart:', error);
      }
    });

    // Handle market maker order updates
    socketRef.current.on('market-maker-update', (data: MarketMakerOrder[]) => {
      setMarketMakerOrders(data);
    });

    // Handle transaction updates
    socketRef.current.on('transactions-update', (data: Transaction[]) => {
      // Add new transactions to pending queue
      pendingTransactionsRef.current = [...pendingTransactionsRef.current, ...data];
      
      // Update transaction count
      transactionCountRef.current += data.length;
      
      // Update total transactions
      setTotalTransactions(prev => prev + data.length);
      
      // Process transactions in batches using requestAnimationFrame for better performance
      if (animationFrameRef.current === null) {
        animationFrameRef.current = requestAnimationFrame(processTransactions);
      }
    });

    // Calculate transactions per second
    const tpsInterval = setInterval(() => {
      setTransactionsPerSecond(transactionCountRef.current);
      transactionCountRef.current = 0;
    }, 1000);

    // Process transactions in batches
    const processTransactions = () => {
      // Take a batch of transactions to process
      const batch = pendingTransactionsRef.current.slice(0, 100);
      pendingTransactionsRef.current = pendingTransactionsRef.current.slice(100);
      
      // Update state with new transactions
      setTransactions(prevTransactions => {
        // Keep only the most recent 100 transactions to avoid memory issues
        return [...prevTransactions, ...batch].slice(-100);
      });
      
      // Continue processing if there are more transactions
      if (pendingTransactionsRef.current.length > 0) {
        animationFrameRef.current = requestAnimationFrame(processTransactions);
      } else {
        animationFrameRef.current = null;
      }
    };

    return () => {
      // Clean up
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      
      clearInterval(tpsInterval);
      
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [chartRef, candlestickSeriesRef, volumeSeriesRef, updateChartWithHistoricalData]);

  // Add a scroll event listener to the chart to load more data when scrolling to the left
  useEffect(() => {
    if (chartRef.current) {
      const handleTimeRangeChanged = () => {
        const visibleRange = chartRef.current?.timeScale().getVisibleRange();
        if (visibleRange && historicalDataRef.current.length > 0) {
          const oldestVisibleTime = visibleRange.from;
          const oldestDataTime = historicalDataRef.current[0].time;
          
          // If we're close to the oldest data we have, request more
          if (typeof oldestVisibleTime === 'number' && typeof oldestDataTime === 'number' &&
              oldestVisibleTime <= oldestDataTime + 5 * 60) { // Within 5 minutes of oldest data
            requestMoreHistoricalData(60, oldestDataTime);
          }
        }
      };
      
      chartRef.current.timeScale().subscribeVisibleTimeRangeChange(handleTimeRangeChanged);
      
      return () => {
        chartRef.current?.timeScale().unsubscribeVisibleTimeRangeChange(handleTimeRangeChanged);
      };
    }
  }, [chartRef, requestMoreHistoricalData]);

  return {
    marketMakerOrders,
    latestPrice,
    transactions,
    transactionsPerSecond,
    totalTransactions,
    requestMoreHistoricalData,
    isLoadingMoreData
  };
}
