import React, { useState } from 'react';
import Chart from './components/Chart';
import DataInput from './components/DataInput';
import StockDataFetcher from './components/StockDataFetcher';
import { ChartData, ChartMetadata } from './types';

function App() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [metadata, setMetadata] = useState<ChartMetadata | null>(null);

  const handleDataSubmit = (data: ChartData[], meta: ChartMetadata) => {
    if (!Array.isArray(data)) {
      console.error('Invalid data format received:', data);
      return;
    }
    setChartData(data);
    setMetadata(meta);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-6xl sm:mx-auto w-full px-4">
        <div className="relative px-4 py-8 bg-white shadow-lg sm:rounded-3xl sm:p-12">
          <div className="mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-8 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-3xl font-bold text-center mb-8">Stock Chart Visualizer</h1>
                
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Fetch Stock Data</h2>
                  <StockDataFetcher onDataFetch={handleDataSubmit} />
                </div>

                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Manual Data Input</h2>
                  <DataInput onDataSubmit={handleDataSubmit} />
                </div>

                {chartData && chartData.length > 0 && metadata && (
                  <div className="mt-8 overflow-hidden">
                    <h2 className="text-xl font-semibold mb-4">
                      {metadata.name} 
                      {metadata.timeframe && ` (${metadata.timeframe})`}
                    </h2>
                    <div className="flex justify-center items-center w-full">
                      <div className="w-full max-w-[95%] overflow-x-auto">
                        <Chart
                          data={chartData}
                          dimensions={{
                            width: 900,
                            height: 450,
                            margin: { top: 20, right: 30, bottom: 30, left: 60 }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;