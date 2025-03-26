import styled, { keyframes, css } from 'styled-components';

// Keyframes
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Flicker animation for transactions lower in the list
const flicker = keyframes`
  0% { opacity: 0.7; }
  25% { opacity: 0.9; }
  50% { opacity: 0.7; }
  75% { opacity: 0.8; }
  100% { opacity: 0.7; }
`;

// Common styles
const panelStyles = css`
  height: 400px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #222;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
  border: 1px solid #333;
`;

const headerStyles = css`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #333;
`;

const scrollableStyles = css`
  flex: 1;
  overflow-y: auto;
  position: relative;
  scrollbar-width: thin;
  scrollbar-color: #444 #222;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #222;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 3px;
  }
`;

// Styled Components
export const Panel = styled.div`
  ${panelStyles}
`;

export const MarketMakerHeader = styled.div`
  ${headerStyles}
  background: linear-gradient(to right, #1e3a8a, #1e40af);
`;

export const TransactionHeader = styled.div`
  ${headerStyles}
  background: linear-gradient(to right, #4a5568, #2d3748);
`;

export const HeaderText = styled.h2`
  font-size: 1.125rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
`;

export const ContentContainer = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
`;

export const TableHeader = styled.div<{ columns: number }>`
  display: grid;
  grid-template-columns: ${props => `repeat(${props.columns}, 1fr)`};
  padding: 0.625rem 0;
  border-bottom: 2px solid #444;
  font-weight: bold;
  font-size: 0.875rem;
  color: #aaa;
`;

export const ScrollableContent = styled.div`
  ${scrollableStyles}
`;

export const Row = styled.div<{ columns: number; isBuy?: boolean }>`
  display: grid;
  grid-template-columns: ${props => `repeat(${props.columns}, 1fr)`};
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.875rem;
  transition: background-color 0.2s ease;
  background-color: ${props => 
    props.isBuy 
      ? 'rgba(38, 166, 154, 0.05)' 
      : 'rgba(239, 83, 80, 0.05)'};
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

export const PriceText = styled.span<{ isBuy?: boolean }>`
  color: ${props => props.isBuy ? '#26a69a' : '#ef5350'};
`;

export const Badge = styled.span<{ isBuy?: boolean }>`
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-block;
  text-align: center;
  width: fit-content;
  background-color: ${props => 
    props.isBuy 
      ? 'rgba(38, 166, 154, 0.2)' 
      : 'rgba(239, 83, 80, 0.2)'};
  color: ${props => props.isBuy ? '#26a69a' : '#ef5350'};
`;

export const Footer = styled.div`
  background-color: #1a1a1a;
  padding: 1rem;
  border-top: 1px solid #333;
  display: flex;
  justify-content: space-between;
`;

export const StatBox = styled.div`
  padding: 0.5rem 0.75rem;
  background-color: #2d3748;
  border-radius: 0.5rem;
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.2);
`;

export const StatLabel = styled.span<{ type: 'tps' | 'total' }>`
  font-weight: 500;
  margin-right: 0.25rem;
  color: ${props => props.type === 'tps' ? '#ffc107' : '#4caf50'};
`;

export const StatValue = styled.span`
  font-weight: bold;
  color: white;
`;

export const TimeText = styled.span`
  color: #aaa;
`;

// Define the interface for AnimatedRow props
interface AnimatedRowProps {
  columns: number;
  isBuy?: boolean;
  index?: number;
}

// Updated AnimatedRow with position-based animation
export const AnimatedRow = styled(Row)<AnimatedRowProps>`
  animation: ${props => !!props.index && css`${flicker} 1.5s ease-in-out infinite`};
  opacity: ${props => props.index === 0 ? 1 : 0.8};
  
  ${props => props.index === 0 && css`
    position: relative;
    z-index: 2;
    font-weight: 500;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  `}
`;

export const DashboardContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #1a1a1a;
  color: #f0f0f0;
`;

export const Header = styled.header`
  height: 60px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #444;
  background-color: #222;
`;

export const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
`;

export const PriceDisplay = styled.div`
  font-size: 18px;
`;

export const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 20px;
  
  @media (min-width: 1024px) {
    flex-direction: row;
  }
`;

export const ChartContainer = styled.div`
  flex: 1;
  height: 500px;
  background-color: #222;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
  border: 1px solid #333;
  overflow: hidden;
`;

export const SidePanel = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  @media (min-width: 1024px) {
    width: 400px;
  }
`;
