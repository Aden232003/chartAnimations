import React, { useState, useEffect, useRef } from 'react';

interface TickerInfo {
  symbol: string;
  name: string;
  exchange: string;
}

// Common indices
const indices: TickerInfo[] = [
  { symbol: '^GSPC', name: 'S&P 500', exchange: 'INDEX' },
  { symbol: '^DJI', name: 'Dow Jones Industrial Average', exchange: 'INDEX' },
  { symbol: '^IXIC', name: 'NASDAQ Composite', exchange: 'INDEX' },
  { symbol: '^RUT', name: 'Russell 2000', exchange: 'INDEX' },
  { symbol: '^VIX', name: 'CBOE Volatility Index', exchange: 'INDEX' },
  { symbol: '^NSEI', name: 'NIFTY 50', exchange: 'INDEX' },
  { symbol: '^BSESN', name: 'S&P BSE SENSEX', exchange: 'INDEX' },
  { symbol: '^N225', name: 'Nikkei 225', exchange: 'INDEX' },
  { symbol: '^HSI', name: 'Hang Seng Index', exchange: 'INDEX' },
  { symbol: '^FTSE', name: 'FTSE 100', exchange: 'INDEX' },
  { symbol: '^GDAXI', name: 'DAX Performance Index', exchange: 'INDEX' },
  { symbol: '^FCHI', name: 'CAC 40', exchange: 'INDEX' },
];

// US Popular Stocks
const usStocks: TickerInfo[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ' },
  { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE' },
  { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE' },
  { symbol: 'WMT', name: 'Walmart Inc.', exchange: 'NYSE' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE' },
  { symbol: 'PG', name: 'Procter & Gamble Co.', exchange: 'NYSE' },
];

// Indian Popular Stocks
const indianStocks: TickerInfo[] = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', exchange: 'NSE' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', exchange: 'NSE' },
  { symbol: 'INFY.NS', name: 'Infosys Limited', exchange: 'NSE' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Limited', exchange: 'NSE' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Limited', exchange: 'NSE' },
  { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever', exchange: 'NSE' },
  { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel Limited', exchange: 'NSE' },
  { symbol: 'WIPRO.NS', name: 'Wipro Limited', exchange: 'NSE' },
  { symbol: 'AXISBANK.NS', name: 'Axis Bank Limited', exchange: 'NSE' },
  { symbol: 'SBIN.NS', name: 'State Bank of India', exchange: 'NSE' },
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors Limited', exchange: 'NSE' },
  { symbol: 'MARUTI.NS', name: 'Maruti Suzuki India', exchange: 'NSE' },
];

// Crypto
const cryptoTickers: TickerInfo[] = [
  { symbol: 'BTC-USD', name: 'Bitcoin USD', exchange: 'CRYPTO' },
  { symbol: 'ETH-USD', name: 'Ethereum USD', exchange: 'CRYPTO' },
  { symbol: 'USDT-USD', name: 'Tether USD', exchange: 'CRYPTO' },
  { symbol: 'BNB-USD', name: 'Binance Coin USD', exchange: 'CRYPTO' },
  { symbol: 'XRP-USD', name: 'XRP USD', exchange: 'CRYPTO' },
  { symbol: 'ADA-USD', name: 'Cardano USD', exchange: 'CRYPTO' },
  { symbol: 'DOGE-USD', name: 'Dogecoin USD', exchange: 'CRYPTO' },
  { symbol: 'SOL-USD', name: 'Solana USD', exchange: 'CRYPTO' },
];

// Combine all tickers
const allTickers: TickerInfo[] = [
  ...indices,
  ...usStocks,
  ...indianStocks,
  ...cryptoTickers,
];

interface TickerSearchProps {
  value: string;
  onChange: (value: string) => void;
}

const TickerSearch: React.FC<TickerSearchProps> = ({ value, onChange }) => {
  return (
    <div>
      <label htmlFor="ticker" className="block text-sm font-medium text-gray-700">
        Stock Ticker
      </label>
      <input
        type="text"
        id="ticker"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter stock ticker (e.g., AAPL, BTC-USD)"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      />
    </div>
  );
};

export default TickerSearch; 