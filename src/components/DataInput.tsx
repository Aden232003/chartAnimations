import React, { useState } from 'react';
import { ChartData } from '../types';

interface DataInputProps {
  onDataSubmit: (data: ChartData[], metadata: ChartMetadata) => void;
}

interface ChartMetadata {
  name: string;
  timeframe: string;
  startDate: string;
  endDate: string;
}

const DataInput: React.FC<DataInputProps> = ({ onDataSubmit }) => {
  const [inputMethod, setInputMethod] = useState<'file' | 'manual'>('file');
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [chartName, setChartName] = useState('');
  const [timeframe, setTimeframe] = useState('');

  const parseCSV = (text: string): ChartData[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',');
    const dateIndex = headers.findIndex(h => h.toLowerCase().includes('date'));
    const closeIndex = headers.findIndex(h => h.toLowerCase().includes('close'));

    if (dateIndex === -1 || closeIndex === -1) {
      throw new Error('CSV must contain Date and Close columns');
    }

    return lines.slice(1).map(line => {
      const values = line.split(',');
      return {
        Date: values[dateIndex].trim(),
        Close: parseFloat(values[closeIndex])
      };
    });
  };

  const parseJSON = (text: string): ChartData[] => {
    const data = JSON.parse(text);
    if (!Array.isArray(data)) {
      throw new Error('JSON must be an array of objects');
    }
    return data;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = file.name.toLowerCase().endsWith('.csv')
          ? parseCSV(text)
          : parseJSON(text);

        const sortedData = data.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());
        
        onDataSubmit(sortedData, {
          name: chartName || file.name,
          timeframe,
          startDate: sortedData[0].Date,
          endDate: sortedData[sortedData.length - 1].Date
        });
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse file');
      }
    };
    reader.readAsText(file);
  };

  const handleManualSubmit = () => {
    try {
      const data = manualInput.trim().startsWith('[')
        ? parseJSON(manualInput)
        : parseCSV(manualInput);

      const sortedData = data.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());
      
      onDataSubmit(sortedData, {
        name: chartName || 'Custom Chart',
        timeframe,
        startDate: sortedData[0].Date,
        endDate: sortedData[sortedData.length - 1].Date
      });
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse input');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Chart Name</label>
        <input
          type="text"
          value={chartName}
          onChange={(e) => setChartName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter chart name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Timeframe</label>
        <input
          type="text"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="e.g., Daily, Monthly, Yearly"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Input Method</label>
        <select
          value={inputMethod}
          onChange={(e) => setInputMethod(e.target.value as 'file' | 'manual')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="file">File Upload</option>
          <option value="manual">Manual Input</option>
        </select>
      </div>

      {inputMethod === 'file' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700">Upload File (CSV or JSON)</label>
          <input
            type="file"
            accept=".csv,.json"
            onChange={handleFileUpload}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700">Manual Input (CSV or JSON)</label>
          <textarea
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            rows={10}
            placeholder="Enter your data here..."
          />
          <button
            onClick={handleManualSubmit}
            className="mt-2 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Submit
          </button>
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-700">Example Formats:</h3>
        <div className="mt-2 space-y-2">
          <div>
            <h4 className="text-xs font-medium text-gray-600">CSV Format:</h4>
            <pre className="bg-gray-100 p-2 rounded mt-1">
Date,Close
2024-01-01,100.50
2024-01-02,101.75</pre>
          </div>
          <div>
            <h4 className="text-xs font-medium text-gray-600">JSON Format:</h4>
            <pre className="bg-gray-100 p-2 rounded mt-1">
{`[
  {"Date": "2024-01-01", "Close": 100.50},
  {"Date": "2024-01-02", "Close": 101.75}
]`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataInput; 