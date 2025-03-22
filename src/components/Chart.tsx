import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface StockData {
  Date: string;
  Close: number;
  Open: number;
  High: number;
  Low: number;
}

interface ChartProps {
  data: StockData[];
}

const Chart: React.FC<ChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Set dimensions
    const margin = { top: 20, right: 30, bottom: 30, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Parse dates
    const parseDate = d3.timeParse('%Y-%m-%d');
    const dates = data.map(d => parseDate(d.Date)!);

    // Set scales
    const x = d3.scaleTime()
      .domain(d3.extent(dates) as [Date, Date])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([
        d3.min(data, d => Math.min(d.Low, d.Close)) as number * 0.95,
        d3.max(data, d => Math.max(d.High, d.Close)) as number * 1.05
      ])
      .range([height, 0]);

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append('g')
      .call(d3.axisLeft(y));

    // Add line
    const line = d3.line<StockData>()
      .x(d => x(parseDate(d.Date)!))
      .y(d => y(d.Close));

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('d', line);

    // Add candlesticks
    svg.selectAll('line.candlestick')
      .data(data)
      .enter()
      .append('line')
      .attr('class', 'candlestick')
      .attr('x1', d => x(parseDate(d.Date)!))
      .attr('x2', d => x(parseDate(d.Date)!))
      .attr('y1', d => y(d.High))
      .attr('y2', d => y(d.Low))
      .attr('stroke', 'black')
      .attr('stroke-width', 1);

    svg.selectAll('rect.candlestick')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'candlestick')
      .attr('x', d => x(parseDate(d.Date)!) - 3)
      .attr('y', d => y(Math.max(d.Open, d.Close)))
      .attr('width', 6)
      .attr('height', d => Math.abs(y(d.Open) - y(d.Close)))
      .attr('fill', d => d.Open > d.Close ? 'red' : 'green');

  }, [data]);

  return (
    <div className="chart-container">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default Chart;