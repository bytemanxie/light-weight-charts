// CSS-in-JS styles for complex effects
export const styles = {
  // Panel styles
  panel: {
    height: '400px',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    backgroundColor: '#222',
    borderRadius: '0.5rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
    border: '1px solid #333',
  },
  
  // Header styles with gradient
  marketMakerHeader: {
    background: 'linear-gradient(to right, #1e3a8a, #1e40af)',
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #333',
  },
  
  transactionHeader: {
    background: 'linear-gradient(to right, #4a5568, #2d3748)',
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #333',
  },
  
  headerText: {
    fontSize: '1.125rem',
    fontWeight: 'bold',
    color: 'white',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
  },
  
  // Content area
  contentContainer: {
    flex: 1,
    padding: '1rem',
    overflowY: 'hidden' as const,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  
  // Table header
  tableHeader: {
    display: 'grid',
    padding: '0.625rem 0',
    borderBottom: '2px solid #444',
    fontWeight: 'bold',
    fontSize: '0.875rem',
    color: '#aaa',
  },
  
  // Scrollable content area
  scrollableContent: {
    flex: 1,
    overflowY: 'auto' as const,
    position: 'relative' as const,
    scrollbarWidth: 'thin',
    scrollbarColor: '#444 #222',
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: '#222',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#444',
      borderRadius: '3px',
    },
  },
  
  // Row styles
  row: {
    display: 'grid',
    padding: '0.5rem 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    fontSize: '0.875rem',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
  },
  
  // Buy/Sell badge
  badge: {
    padding: '0.25rem 0.5rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '500',
    display: 'inline-block',
    textAlign: 'center' as const,
    width: 'fit-content',
  },
  
  buyBadge: {
    backgroundColor: 'rgba(38, 166, 154, 0.2)',
    color: '#26a69a',
  },
  
  sellBadge: {
    backgroundColor: 'rgba(239, 83, 80, 0.2)',
    color: '#ef5350',
  },
  
  // Footer styles
  footer: {
    backgroundColor: '#1a1a1a',
    padding: '1rem',
    borderTop: '1px solid #333',
    display: 'flex',
    justifyContent: 'space-between',
  },
  
  statBox: {
    padding: '0.5rem 0.75rem',
    backgroundColor: '#2d3748',
    borderRadius: '0.5rem',
    boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)',
  },
  
  statLabel: {
    fontWeight: '500',
    marginRight: '0.25rem',
  },
  
  tpsLabel: {
    color: '#ffc107',
  },
  
  totalLabel: {
    color: '#4caf50',
  },
  
  statValue: {
    fontWeight: 'bold',
    color: 'white',
  },
  
  // Animation for new items
  fadeIn: {
    animation: 'fadeIn 0.5s ease-in-out',
  },
  
  '@keyframes fadeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
};
