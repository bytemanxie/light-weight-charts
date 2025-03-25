import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import * as LightweightCharts from 'lightweight-charts'
import { CandlestickSeries, HistogramSeries } from 'lightweight-charts'
import { io, Socket } from 'socket.io-client'
import './App.css'

// Define interfaces for our data types
interface CandlestickData {
  time: string | number; // Use string or number to be compatible with Time type
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface MarketMakerOrder {
  price: number;
  size: number;
  side: 'buy' | 'sell';
}

interface VolumeData {
  time: string | number;
  value: number;
  color: string;
}

interface Transaction {
  id: string;
  price: number;
  volume: number;
  side: 'buy' | 'sell';
  timestamp: number;
}

function App() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<LightweightCharts.IChartApi | null>(null);
  // Using any type to bypass TypeScript errors with the chart library
  const candlestickSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);
  const [marketMakerOrders, setMarketMakerOrders] = useState<MarketMakerOrder[]>([]);
  const [latestPrice, setLatestPrice] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const transactionCountRef = useRef<number>(0);
  const [transactionsPerSecond, setTransactionsPerSecond] = useState<number>(0);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const pendingTransactionsRef = useRef<Transaction[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Initialize chart
    if (chartContainerRef.current) {
      const chartOptions: LightweightCharts.DeepPartial<LightweightCharts.ChartOptions> = {
        layout: {
          background: { color: '#222' },
          textColor: '#DDD',
        },
        grid: {
          vertLines: { color: '#444' },
          horzLines: { color: '#444' },
        },
        width: chartContainerRef.current.clientWidth,
        height: 500,
      };
      
      chartRef.current = LightweightCharts.createChart(chartContainerRef.current, chartOptions);
      
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
      volumeSeriesRef.current.priceScale().applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });
      
      // Handle window resize
      const handleResize = (): void => {
        if (chartRef.current && chartContainerRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      // Connect to WebSocket server
      socketRef.current = io('http://localhost:3001');
      
      // Handle historical data
      socketRef.current.on('historical-data', (data: CandlestickData[]) => {
        if (candlestickSeriesRef.current && volumeSeriesRef.current) {
          candlestickSeriesRef.current.setData(data);
          
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
          
          // Fit content
          if (chartRef.current) {
            chartRef.current.timeScale().fitContent();
          }
        }
      });
      
      // Handle real-time candlestick updates
      socketRef.current.on('candlestick-update', (data: CandlestickData) => {
        try {
          if (candlestickSeriesRef.current && volumeSeriesRef.current) {
            // Update candlestick series with new data
            candlestickSeriesRef.current.update(data);
            
            // Update volume series with new data
            volumeSeriesRef.current.update({
              time: data.time,
              value: data.volume,
              color: data.close >= data.open ? 'rgba(0, 150, 136, 0.5)' : 'rgba(255, 82, 82, 0.5)'
            });
            
            // Update latest price
            setLatestPrice(data.close);
            
            // Update chart to ensure it renders the latest data
            chartRef.current?.timeScale().fitContent();
          }
        } catch (error) {
          console.error('Error updating candlestick chart:', error);
        }
      });
      
      // Handle market maker data
      socketRef.current.on('market-maker-data', (data: MarketMakerOrder[]) => {
        if (Array.isArray(data)) {
          setMarketMakerOrders(data);
        } else {
          console.error('Invalid market maker data received:', data);
          setMarketMakerOrders([]);
        }
      });
      
      // Handle market maker updates
      socketRef.current.on('market-maker-update', (data: MarketMakerOrder[]) => {
        if (Array.isArray(data)) {
          setMarketMakerOrders(data);
        } else {
          console.error('Invalid market maker update received:', data);
        }
      });
      
      return () => {
        // Clean up
        window.removeEventListener('resize', handleResize);
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
        if (chartRef.current) {
          chartRef.current.remove();
        }
      };
    }
  }, []);

  useEffect(() => {
    // Create a faster update interval for transaction counter display
    const counterUpdateInterval = setInterval(() => {
      setTransactionsPerSecond(transactionCountRef.current); 
    }, 1000); // Update counter every second
    
    // Reset transaction count every second for accurate per-second metrics
    const resetInterval = setInterval(() => {
      transactionCountRef.current = 0;
    }, 1000);
    
    return () => {
      clearInterval(counterUpdateInterval);
      clearInterval(resetInterval);
    };
  }, []);

  // Limit the number of transactions displayed to improve performance
  const displayedTransactions = useMemo(() => {
    // Only display the 20 most recent transactions for better performance with very high refresh rates
    return transactions.slice(0, 20);
  }, [transactions]);

  const formattedTransactions = useMemo(() => {
    return displayedTransactions.map((tx) => (
      <div 
        key={tx.id} 
        className={`transaction-row ${tx.side === 'buy' ? 'buy' : 'sell'}`}
      >
        <span>${tx.price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
        <span>{tx.volume.toFixed(4)}</span>
        <span>{tx.side.toUpperCase()}</span>
        <span>{new Date(tx.timestamp).toLocaleTimeString()}</span>
      </div>
    ));
  }, [displayedTransactions]);

  // Format price with commas
  const formatPrice = (price: number | null): string => {
    return price ? price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.00";
  };

  const updateTransactionsWithRAF = useCallback((newTransactions: Transaction[]) => {
    // Add new transactions to pending queue
    pendingTransactionsRef.current = [...newTransactions, ...pendingTransactionsRef.current];
    
    // Update transaction count
    transactionCountRef.current += newTransactions.length;
    setTotalTransactions(prevTotal => prevTotal + newTransactions.length);
    
    // If no animation frame is scheduled, schedule one
    if (animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(() => {
        // Update state with all pending transactions
        setTransactions(prevTransactions => {
          const combined = [...pendingTransactionsRef.current, ...prevTransactions];
          // Reset pending transactions
          pendingTransactionsRef.current = [];
          // Clear animation frame reference
          animationFrameRef.current = null;
          // Keep only the most recent 500 transactions
          return combined.slice(0, 500);
        });
      });
    }
  }, []);

  useEffect(() => {
    socketRef.current?.on('transactions-update', (data: Transaction[]) => {
      updateTransactionsWithRAF(data);
    });
    
    return () => {
      socketRef.current?.off('transactions-update');
    };
  }, [socketRef.current, updateTransactionsWithRAF]);

  // Memoize market maker orders to prevent unnecessary re-renders
  const formattedMarketMakerOrders = useMemo(() => {
    return (
      <div className="order-book">
        <div className="order-book-header">
          <span>Price</span>
          <span>Size</span>
          <span>Side</span>
        </div>
        <div className="order-book-content">
          {marketMakerOrders
            .sort((a, b) => b.price - a.price)
            .map((order, index) => (
              <div 
                key={index} 
                className={`order-row ${order.side === 'buy' ? 'buy' : 'sell'}`}
              >
                <span>${order.price ? order.price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.00"}</span>
                <span>{order.size ? order.size.toFixed(2) : "0.00"}</span>
                <span>{order.side ? order.side.toUpperCase() : ""}</span>
              </div>
            ))
          }
        </div>
      </div>
    );
  }, [marketMakerOrders]);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Trading Dashboard</h1>
        {latestPrice && (
          <div className="price-display">
            <span>Current Price: </span>
            <span className="price">${formatPrice(latestPrice)}</span>
          </div>
        )}
      </header>
      
      <div className="dashboard-content">
        <div className="chart-container" ref={chartContainerRef}></div>
        
        <div className="market-data-container">
          <div className="market-maker-container">
            <h2>Market Maker Orders</h2>
            {formattedMarketMakerOrders}
          </div>
          
          <div className="transactions-container">
            <h2>Live Transactions</h2>
            <div className="transactions-feed">
              <div className="transactions-header">
                <span>Price</span>
                <span>Volume</span>
                <span>Side</span>
                <span>Time</span>
              </div>
              <div className="transactions-content">
                {formattedTransactions}
              </div>
            </div>
            <div className="transactions-per-second">
              <span>Transactions per second: {transactionsPerSecond}</span>
            </div>
            <div className="total-transactions">
              <span>Total Transactions: {totalTransactions}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
