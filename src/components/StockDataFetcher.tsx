import React, { useState } from 'react';
import TickerSearch from './TickerSearch';
import { ChartData, ChartMetadata } from '../types';

interface StockDataFetcherProps {
  onDataFetch: (data: ChartData[], metadata: ChartMetadata) => void;
}

const StockDataFetcher: React.FC<StockDataFetcherProps> = ({ onDataFetch }) => {
  const [ticker, setTicker] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeframe, setTimeframe] = useState('daily');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const url = baseUrl ? `${baseUrl}/fetch-stock-data` : '/api/fetch-stock-data';
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticker, startDate, endDate, timeframe }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to fetch stock data');
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received from server');
      }

      // Transform the data to ensure it matches ChartData interface
      const chartData: ChartData[] = data.map((item: any) => ({
        Date: item.Date,
        Close: Number(item.Close),
        Open: item.Open ? Number(item.Open) : undefined,
        High: item.High ? Number(item.High) : undefined,
        Low: item.Low ? Number(item.Low) : undefined,
      }));

      if (chartData.length === 0) {
        throw new Error('No data available for the selected period');
      }

      onDataFetch(chartData, {
        name: ticker,
        timeframe: `${timeframe} (${startDate} to ${endDate})`,
        startDate,
        endDate,
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Stock Ticker
        </label>
        <TickerSearch
          onSelect={setTicker}
          initialValue={ticker}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Timeframe
        </label>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm mt-2 p-2 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !ticker || !startDate || !endDate}
        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
          isLoading || !ticker || !startDate || !endDate
            ? 'bg-blue-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isLoading ? 'Fetching...' : 'Fetch Data'}
      </button>
    </form>
  );
};

export default StockDataFetcher; 