import express, { Application, Request, Response } from 'express';
import { createServer, Server } from 'http';
import { Server as IOServer, Socket } from 'socket.io';
import cors from 'cors';
import { CircularBuffer } from './utils/CircularBuffer';

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
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Enable CORS
app.use(cors());

// Current price for generating data
let currentPrice: number = 10000.00;

// Maximum number of historical candlesticks to keep in memory
const MAX_HISTORICAL_DATA_SIZE = 1000;

// Initialize circular buffer for historical data
const historicalDataBuffer = new CircularBuffer<CandlestickData>(MAX_HISTORICAL_DATA_SIZE);

// Generate random price movement
function generatePriceMovement(): number {
  return (Math.random() - 0.5) * 20;
}

// Generate candlestick data
function generateCandlestick(timestamp: number): CandlestickData {
  const priceMovement = generatePriceMovement();
  currentPrice += priceMovement;
  
  const open = currentPrice;
  const close = currentPrice + generatePriceMovement();
  const high = Math.max(open, close) + Math.abs(generatePriceMovement() * 0.5);
  const low = Math.min(open, close) - Math.abs(generatePriceMovement() * 0.5);
  
  return {
    time: timestamp,
    open: Number(open.toFixed(2)),
    high: Number(high.toFixed(2)),
    low: Number(low.toFixed(2)),
    close: Number(close.toFixed(2)),
    volume: Number((Math.random() * 10).toFixed(2))
  };
}

// Generate market maker orders with proper initialization
function generateMarketMakerOrders(): MarketMakerOrder[] {
  const orders: MarketMakerOrder[] = [];
  
  // Generate buy orders (below current price)
  for (let i = 0; i < 10; i++) {
    const priceOffset = (i + 1) * 10 + Math.random() * 5;
    orders.push({
      price: Number((currentPrice - priceOffset).toFixed(2)),
      size: Number((Math.random() * 5).toFixed(4)),
      side: 'buy'
    });
  }
  
  // Generate sell orders (above current price)
  for (let i = 0; i < 10; i++) {
    const priceOffset = (i + 1) * 10 + Math.random() * 5;
    orders.push({
      price: Number((currentPrice + priceOffset).toFixed(2)),
      size: Number((Math.random() * 5).toFixed(4)),
      side: 'sell'
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

// Initialize historical data
function initializeHistoricalData(): void {
  // Clear existing data
  historicalDataBuffer.clear();
  
  // Generate initial historical data (1 hour of minute candles)
  let timestamp: number = Date.now() - 60 * 60 * 1000; // Start from 1 hour ago
  
  for (let i = 0; i < 60; i++) {
    timestamp += 60 * 1000; // Add 1 minute
    historicalDataBuffer.push(generateCandlestick(timestamp));
  }
}

// Initialize historical data on server start
initializeHistoricalData();

// Add REST endpoint for paginated historical data
app.get('/api/historical-data', (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 60;
  const data = historicalDataBuffer.getLatest(limit);
  res.json(data);
});

// Socket.io connection
io.on('connection', (socket: Socket) => {
  console.log('New client connected');
  
  // Send initial historical data (limited to the most recent 60 candles)
  const initialData = historicalDataBuffer.getLatest(60);
  socket.emit('historical-data', initialData);
  socket.emit('market-maker-data', generateMarketMakerOrders());
  
  // Handle request for more historical data
  socket.on('request-historical-data', (params: { limit: number, before?: number }) => {
    const { limit = 60, before } = params;
    const data = historicalDataBuffer.getLatest(limit);
    socket.emit('historical-data-response', data);
  });
  
  // Send candlestick updates every 100ms (real-time)
  const candlestickInterval = setInterval(() => {
    const timestamp = Date.now();
    const candlestick = generateCandlestick(timestamp);
    
    // Add to historical buffer
    historicalDataBuffer.push(candlestick);
    
    // Send update to client
    socket.emit('candlestick-update', candlestick);
  }, 100);
  
  // Send market maker updates every 100ms (real-time)
  const marketMakerInterval = setInterval(() => {
    const updatedMarketMakerOrders = generateMarketMakerOrders();
    socket.emit('market-maker-update', updatedMarketMakerOrders);
  }, 100);
  
  // Send transaction updates at a rate of 5-6 transactions per second
  const transactionInterval = setInterval(() => {
    // Generate 1 transaction per interval
    const transactions: Transaction[] = generateTransactions(1);
    socket.emit('transactions-update', transactions);
  }, 200); // Send a transaction every 200ms (5 per second)
  
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
