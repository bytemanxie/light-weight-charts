import express, { Application } from 'express';
import { createServer, Server } from 'http';
import { Server as IOServer, Socket } from 'socket.io';
import cors from 'cors';

// Define interfaces for our data types
interface CandlestickData {
  time: number;
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

interface Transaction {
  id: string;
  price: number;
  volume: number;
  side: 'buy' | 'sell';
  timestamp: number;
}

const app: Application = express();
const server: Server = createServer(app);
const io: IOServer = new IOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

// Initial price and market maker data
let currentPrice: number = 50000;
let marketMakerOrders: MarketMakerOrder[] = [
  { price: 49800, size: 10.5, side: 'buy' },
  { price: 49900, size: 5.2, side: 'buy' },
  { price: 50100, size: 7.8, side: 'sell' },
  { price: 50200, size: 12.3, side: 'sell' }
];

// Generate random price movement
function generatePriceMovement(): number {
  // Random price change between -100 and 100
  const change: number = (Math.random() - 0.5) * 200;
  currentPrice = Math.max(40000, Math.min(60000, currentPrice + change));
  return currentPrice;
}

// Generate candlestick data
function generateCandlestick(timestamp: number): CandlestickData {
  const open: number = currentPrice;
  const high: number = open + Math.random() * 50;
  const low: number = open - Math.random() * 50;
  const close: number = generatePriceMovement();
  
  return {
    time: timestamp / 1000, // Convert to seconds for TradingView
    open,
    high,
    low,
    close,
    volume: Math.random() * 100
  };
}

// Generate market maker orders with proper initialization
function generateMarketMakerOrders(): MarketMakerOrder[] {
  // Create a new array of market maker orders
  const orders: MarketMakerOrder[] = [];
  
  // Generate 5-10 random orders
  const numOrders = 5 + Math.floor(Math.random() * 5);
  
  for (let i = 0; i < numOrders; i++) {
    const side: 'buy' | 'sell' = Math.random() > 0.5 ? 'buy' : 'sell';
    const priceOffset: number = side === 'buy' ? -Math.random() * 500 : Math.random() * 500;
    
    orders.push({
      price: currentPrice + priceOffset,
      size: Math.random() * 15,
      side
    });
  }
  
  return orders;
}

// Generate random transactions
function generateTransactions(count: number = 5): Transaction[] {
  const transactions: Transaction[] = [];
  
  for (let i = 0; i < count; i++) {
    const side: 'buy' | 'sell' = Math.random() > 0.5 ? 'buy' : 'sell';
    // Transactions happen close to current price with some variance
    const priceVariance = (Math.random() - 0.5) * 100;
    const price = currentPrice + priceVariance;
    
    transactions.push({
      id: Math.random().toString(36).substring(2, 15),
      price: Number(price.toFixed(2)),
      volume: Number((Math.random() * 2).toFixed(4)),
      side,
      timestamp: Date.now() + i
    });
  }
  
  return transactions;
}

// Socket.io connection
io.on('connection', (socket: Socket) => {
  console.log('New client connected');
  
  // Send initial historical data
  const historicalData: CandlestickData[] = [];
  let timestamp: number = Date.now() - 60 * 60 * 1000; // Start from 1 hour ago
  
  for (let i = 0; i < 60; i++) {
    timestamp += 60 * 1000; // Add 1 minute
    historicalData.push(generateCandlestick(timestamp));
  }
  
  socket.emit('historical-data', historicalData);
  socket.emit('market-maker-data', generateMarketMakerOrders());
  
  // Send candlestick updates every 1000ms (real-time)
  const candlestickInterval = setInterval(() => {
    const timestamp = Date.now();
    const candlestick = generateCandlestick(timestamp);
    historicalData.push(candlestick);
    socket.emit('candlestick-update', candlestick);
  }, 1000);
  
  // Send market maker updates every 100ms (real-time)
  const marketMakerInterval = setInterval(() => {
    const updatedMarketMakerOrders = generateMarketMakerOrders();
    socket.emit('market-maker-update', updatedMarketMakerOrders);
  }, 100);
  
  // Send transaction updates at maximum frequency (every 10ms)
  const transactionInterval = setInterval(() => {
    const transactions: Transaction[] = generateTransactions(100); // Generate 100 transactions per batch
    socket.emit('transactions-update', transactions);
  }, 10); // Send 100 batches per second (approximately 10,000 transactions per second)
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
    clearInterval(candlestickInterval);
    clearInterval(marketMakerInterval);
    clearInterval(transactionInterval);
  });
});

const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
