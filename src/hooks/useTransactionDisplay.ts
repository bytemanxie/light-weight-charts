import { useMemo } from 'react';
import { Transaction } from './types';

export function useTransactionDisplay(transactions: Transaction[]) {
  // Limit the number of transactions displayed to improve performance
  const displayedTransactions = useMemo(() => {
    // Sort transactions by timestamp (most recent first)
    const sortedTransactions = [...transactions].sort((a, b) => b.timestamp - a.timestamp);
    // Only display the 20 most recent transactions for better performance with very high refresh rates
    return sortedTransactions.slice(0, 20);
  }, [transactions]);

  // Format price with commas
  const formatPrice = (price: number | null): string => {
    return price ? price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.00";
  };

  const formattedTransactions = useMemo(() => {
    return displayedTransactions.map((tx) => ({
      id: tx.id,
      className: `grid grid-cols-4 py-2 border-b border-opacity-5 border-white text-sm h-[35px] animate-fadeIn ${tx.side === 'buy'
          ? 'bg-[rgba(38,166,154,0.05)]'
          : 'bg-[rgba(239,83,80,0.05)]'
        }`,
      priceClassName: tx.side === 'buy' ? 'text-[#26a69a]' : 'text-[#ef5350]',
      formattedPrice: `$${tx.price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
      formattedVolume: tx.volume.toFixed(4),
      side: tx.side.toUpperCase(),
      time: new Date(tx.timestamp).toLocaleTimeString()
    }));
  }, [displayedTransactions]);

  return {
    formattedTransactions,
    formatPrice
  };
}
