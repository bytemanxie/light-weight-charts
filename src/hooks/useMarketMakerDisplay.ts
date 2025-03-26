import { useMemo } from 'react';
import { MarketMakerOrder } from './types';

export function useMarketMakerDisplay(marketMakerOrders: MarketMakerOrder[]) {
  // Memoize market maker orders to prevent unnecessary re-renders
  const formattedMarketMakerOrders = useMemo(() => {
    // Separate buy and sell orders
    const buyOrders = marketMakerOrders
      .filter(order => order.side === 'buy')
      .sort((a, b) => b.price - a.price);
      
    const sellOrders = marketMakerOrders
      .filter(order => order.side === 'sell')
      .sort((a, b) => a.price - b.price);
      
    // Combine orders with most recent at the top
    const sortedOrders = [...sellOrders, ...buyOrders];
    
    return sortedOrders.map((order, index) => ({
      id: index,
      className: `grid grid-cols-3 py-2 border-b border-opacity-5 border-white text-sm ${order.side === 'buy'
          ? 'bg-[rgba(38,166,154,0.05)]'
          : 'bg-[rgba(239,83,80,0.05)]'
        }`,
      priceClassName: order.side === 'buy' ? 'text-[#26a69a]' : 'text-[#ef5350]',
      formattedPrice: `$${order.price ? order.price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.00"}`,
      formattedSize: order.size ? order.size.toFixed(2) : "0.00",
      side: order.side ? order.side.toUpperCase() : ""
    }));
  }, [marketMakerOrders]);

  return {
    formattedMarketMakerOrders
  };
}
