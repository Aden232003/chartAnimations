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
  onSelect: (ticker: string) => void;
  initialValue?: string;
}

const TickerSearch: React.FC<TickerSearchProps> = ({ onSelect, initialValue = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(initialValue);
  const [filteredTickers, setFilteredTickers] = useState<TickerInfo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let tickersToFilter = allTickers;
    if (selectedCategory !== 'all') {
      tickersToFilter = allTickers.filter(ticker => ticker.exchange === selectedCategory);
    }

    const filtered = tickersToFilter.filter(ticker => 
      ticker.symbol.toLowerCase().includes(search.toLowerCase()) ||
      ticker.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredTickers(filtered);
  }, [search, selectedCategory]);

  const handleSelect = (ticker: TickerInfo) => {
    setSearch(ticker.symbol);
    onSelect(ticker.symbol);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search by company name or ticker symbol..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          ▼
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-2 flex space-x-2 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedCategory('INDEX')}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === 'INDEX'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Indices
            </button>
            <button
              onClick={() => setSelectedCategory('NASDAQ')}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === 'NASDAQ'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              NASDAQ
            </button>
            <button
              onClick={() => setSelectedCategory('NYSE')}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === 'NYSE'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              NYSE
            </button>
            <button
              onClick={() => setSelectedCategory('NSE')}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === 'NSE'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              NSE
            </button>
            <button
              onClick={() => setSelectedCategory('CRYPTO')}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === 'CRYPTO'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Crypto
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredTickers.length > 0 ? (
              filteredTickers.map((ticker) => (
                <div
                  key={ticker.symbol}
                  onClick={() => handleSelect(ticker)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <span className="font-medium">{ticker.symbol}</span>
                    <span className="ml-2 text-gray-600">{ticker.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">{ticker.exchange}</span>
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 text-center">
                No matching instruments found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TickerSearch; 