import { useRef } from 'react'
import {
  useChart,
  useSocketData,
  useTransactionDisplay,
  useMarketMakerDisplay
} from './hooks';
import {
  DashboardContainer,
  Header,
  Title,
  PriceDisplay,
  MainContent,
  ChartContainer,
  SidePanel,
  Panel,
  MarketMakerHeader,
  TransactionHeader,
  HeaderText,
  ContentContainer,
  TableHeader,
  ScrollableContent,
  Row,
  AnimatedRow,
  PriceText,
  Badge,
  TimeText,
  Footer,
  StatBox,
  StatLabel,
  StatValue
} from './styles/StyledComponents';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Initialize chart
  const chartRefs = useChart(chartContainerRef);

  // Connect to WebSocket and handle data
  const {
    marketMakerOrders,
    latestPrice,
    transactions,
    transactionsPerSecond,
    totalTransactions
  } = useSocketData(chartRefs);

  // Format and display transactions
  const { formattedTransactions, formatPrice } = useTransactionDisplay(transactions);

  // Format and display market maker orders
  const { formattedMarketMakerOrders } = useMarketMakerDisplay(marketMakerOrders);

  return (
    <ErrorBoundary>
      <DashboardContainer>
        <Header>
          <Title>Trading Dashboard</Title>
          {latestPrice && (
            <PriceDisplay>
              <span>Current Price: </span>
              <PriceText isBuy={true}>${formatPrice(latestPrice)}</PriceText>
            </PriceDisplay>
          )}
        </Header>

        <MainContent>
          <ChartContainer ref={chartContainerRef} />

          <SidePanel>
            {/* Market Maker Orders Panel */}
            <ErrorBoundary>
              <Panel>
                <MarketMakerHeader>
                  <HeaderText>Market Maker Orders</HeaderText>
                </MarketMakerHeader>
                <ContentContainer>
                  <TableHeader columns={3}>
                    <span>Price</span>
                    <span>Size</span>
                    <span>Side</span>
                  </TableHeader>
                  <ScrollableContent>
                    {formattedMarketMakerOrders.map(order => (
                      <Row
                        key={order.id}
                        columns={3}
                        isBuy={order.side === 'BUY'}
                      >
                        <PriceText isBuy={order.side === 'BUY'}>{order.formattedPrice}</PriceText>
                        <span>{order.formattedSize}</span>
                        <span>
                          <Badge isBuy={order.side === 'BUY'}>
                            {order.side}
                          </Badge>
                        </span>
                      </Row>
                    ))}
                  </ScrollableContent>
                </ContentContainer>
              </Panel>
            </ErrorBoundary>

            {/* Live Transactions Panel */}
            <ErrorBoundary>
              <Panel>
                <TransactionHeader>
                  <HeaderText>Live Transactions</HeaderText>
                </TransactionHeader>
                <ContentContainer>
                  <TableHeader columns={4}>
                    <span>Price</span>
                    <span>Volume</span>
                    <span>Side</span>
                    <span>Time</span>
                  </TableHeader>
                  <ScrollableContent>
                    {formattedTransactions.map((tx, index) => (
                      <AnimatedRow
                        key={tx.id}
                        columns={4}
                        isBuy={tx.side === 'BUY'}
                        index={index}
                      >
                        <PriceText isBuy={tx.side === 'BUY'}>{tx.formattedPrice}</PriceText>
                        <span>{tx.formattedVolume}</span>
                        <span>
                          <Badge isBuy={tx.side === 'BUY'}>
                            {tx.side}
                          </Badge>
                        </span>
                        <TimeText>{tx.time}</TimeText>
                      </AnimatedRow>
                    ))}
                  </ScrollableContent>
                </ContentContainer>
                <Footer>
                  <StatBox>
                    <StatLabel type="tps">TPS:</StatLabel>
                    <StatValue>{transactionsPerSecond}</StatValue>
                  </StatBox>
                  <StatBox>
                    <StatLabel type="total">Total:</StatLabel>
                    <StatValue>{totalTransactions.toLocaleString()}</StatValue>
                  </StatBox>
                </Footer>
              </Panel>
            </ErrorBoundary>
          </SidePanel>
        </MainContent>
      </DashboardContainer>
    </ErrorBoundary>
  )
}

export default App
