import { Plan, StockData } from '../types';

export const PLANS: Plan[] = [
  { id: '1', name: '1ST PLAN', price: 10, minProfit: 0.4, maxProfit: 0.8, durationDays: 30 },
  { id: '2', name: '2ND PLAN', price: 20, minProfit: 0.8, maxProfit: 1.8, durationDays: 30 },
  { id: '3', name: '3RD PLAN', price: 50, minProfit: 2.0, maxProfit: 3.0, durationDays: 30 },
  { id: '4', name: '4TH PLAN', price: 100, minProfit: 4.0, maxProfit: 5.0, durationDays: 30 },
  { id: '5', name: '5TH PLAN', price: 300, minProfit: 10.0, maxProfit: 15.0, durationDays: 30 },
  { id: '6', name: '6TH PLAN', price: 500, minProfit: 18.0, maxProfit: 25.0, durationDays: 30 },
  { id: '7', name: '7TH PLAN', price: 1000, minProfit: 30.0, maxProfit: 50.0, durationDays: 30 },
];

export const INITIAL_STOCKS: StockData[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 63132.90,
    change: 912.40,
    changePercent: 1.46,
    type: 'crypto',
    history: generateHistory(63132.90, 1.46)
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 1748.71,
    change: 11.20,
    changePercent: 0.64,
    type: 'crypto',
    history: generateHistory(1748.71, 0.64)
  },
  {
    symbol: 'BNB',
    name: 'BNB',
    price: 571.44,
    change: 6.12,
    changePercent: 1.08,
    type: 'crypto',
    history: generateHistory(571.44, 1.08)
  },
  {
    symbol: 'XRP',
    name: 'Ripple',
    price: 1.10,
    change: 0.0065,
    changePercent: 0.60,
    type: 'crypto',
    history: generateHistory(1.10, 0.60)
  },
  {
    symbol: 'ASTER',
    name: 'Aster',
    price: 0.623,
    change: 0.003,
    changePercent: 0.48,
    type: 'crypto',
    history: generateHistory(0.623, 0.48)
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 182.51,
    change: -2.31,
    changePercent: -1.25,
    type: 'stock',
    history: generateHistory(182.51, -1.25)
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    price: 415.84,
    change: 4.88,
    changePercent: 1.19,
    type: 'stock',
    history: generateHistory(415.84, 1.19)
  },
  {
    symbol: 'META',
    name: 'Meta Platforms',
    price: 498.24,
    change: 12.44,
    changePercent: 2.56,
    type: 'stock',
    history: generateHistory(498.24, 2.56)
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 221.55,
    change: -0.85,
    changePercent: -0.38,
    type: 'stock',
    history: generateHistory(221.55, -0.38)
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    price: 128.20,
    change: 5.75,
    changePercent: 4.69,
    type: 'stock',
    history: generateHistory(128.20, 4.69)
  }
];

function generateHistory(basePrice: number, percentChange: number) {
  const points = [];
  const now = new Date();
  let currentPrice = basePrice - (basePrice * (percentChange / 100));
  
  for (let i = 15; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000);
    const randomFactor = (Math.random() - 0.48) * (basePrice * 0.004);
    currentPrice += randomFactor;
    points.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: Number(currentPrice.toFixed(2))
    });
  }
  return points;
}

export function updateStockPrices(stocks: StockData[]): StockData[] {
  return stocks.map(stock => {
    const changeFactor = (Math.random() - 0.5) * 0.002; // max 0.1% change
    const newPrice = Number((stock.price * (1 + changeFactor)).toFixed(stock.price > 100 ? 2 : 4));
    const totalChange = newPrice - (stock.price - stock.change);
    const totalPercent = Number(((totalChange / (newPrice - totalChange)) * 100).toFixed(2));
    
    const now = new Date();
    const newHistory = [...stock.history.slice(1), {
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: newPrice
    }];

    return {
      ...stock,
      price: newPrice,
      change: Number(totalChange.toFixed(stock.price > 100 ? 2 : 4)),
      changePercent: totalPercent,
      history: newHistory
    };
  });
}
