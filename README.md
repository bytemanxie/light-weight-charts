# Trading Dashboard with Market Maker Visualization

A real-time trading dashboard that displays candlestick charts and market maker orders using TradingView's lightweight-charts library. The application includes a simulated backend that generates virtual market data.

## Features

- Real-time candlestick chart using TradingView's lightweight-charts
- Volume indicator below the price chart
- Market maker order book visualization
- WebSocket connection for real-time data updates
- Simulated backend that generates virtual market data
- TypeScript support for improved type safety and developer experience

## Tech Stack

- **Frontend**: React, TypeScript, Vite, lightweight-charts
- **Backend**: Node.js, Express, Socket.io, TypeScript
- **Data**: Virtual data generation for simulating market activity

## Getting Started

### Prerequisites

- Node.js (v22 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

1. Start both the backend server and frontend development server with a single command:
   ```bash
   npm start
   ```
   
   This will concurrently run both the backend and frontend servers.

2. Alternatively, you can run them separately:
   
   Start the backend server:
   ```bash
   npm run server
   ```

   In a separate terminal, start the frontend development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to the URL shown in your terminal (typically http://localhost:5173)

## Project Structure

- `server.ts` - TypeScript backend server that generates virtual market data
- `src/App.tsx` - Main React component with TradingView chart and market maker visualization
- `src/App.css` - Styling for the trading dashboard
- `src/index.css` - Base styling for the application
- `tsconfig.json` - TypeScript configuration for the frontend
- `tsconfig.node.json` - TypeScript configuration for Node.js

## TypeScript Migration

The project has been migrated from JavaScript to TypeScript to provide better type safety and developer experience. Key benefits include:

- Type definitions for data structures like `CandlestickData` and `MarketMakerOrder`
- Improved IDE support with autocompletion and error checking
- Better code maintainability and refactoring capabilities

## How It Works

The backend server generates virtual market data including candlestick data and market maker orders. This data is sent to the frontend via WebSocket connections. The frontend displays this data using TradingView's lightweight-charts library and updates in real-time as new data arrives.

## Customization

You can customize various aspects of the application:

- Adjust the chart appearance in the `chartOptions` object in `App.tsx`
- Modify the data generation parameters in `server.ts`
- Change the styling in `App.css`
