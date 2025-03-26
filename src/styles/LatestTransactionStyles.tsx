import styled from 'styled-components';
import { PriceText } from './StyledComponents';

// Latest Transaction Panel
export const LatestTransactionPanel = styled.div`
  background-color: #222;
  border-radius: 0.5rem;
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid #333;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
`;

export const LatestTransactionHeader = styled.div`
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid #333;
`;

export const LatestTransactionContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const LatestTransactionDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

export const LatestTransactionPrice = styled(PriceText)`
  font-size: 1.5rem;
  font-weight: bold;
`;

export const LatestTransactionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;
