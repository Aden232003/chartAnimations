import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ChartData, ChartConfig } from '../types';

interface ChartProps {
  data: ChartData[];
  dimensions: {
    width: number;
    height: number;
    margin: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
  config?: Partial<ChartConfig>;
}

const Chart: React.FC<ChartProps> = ({
  data,
  dimensions,
  config = {}
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [key, setKey] = useState(0); // Key to force remount and reload animation

  // Calculate dimensions based on expanded state
  const chartDimensions = isExpanded ? {
    width: 1440, // 75% of 1920
    height: 810, // 75% of 1080
    margin: {
      top: 50,
      right: 50,
      bottom: 50,
      left: 70
    }
  } : dimensions;

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleReload = () => {
    setKey(prev => prev + 1); // Force remount of component
  };

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Add white background
    svg.append('rect')
      .attr('width', chartDimensions.width)
      .attr('height', chartDimensions.height)
      .attr('fill', 'white');

    const { width, height, margin } = chartDimensions;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(d.Date)) as [Date, Date])
      .range([0, innerWidth]);

    const minClose = d3.min(data, d => d.Close);
    const maxClose = d3.max(data, d => d.Close);
    
    if (!minClose || !maxClose) return;

    const yScale = d3.scaleLinear()
      .domain([minClose * 0.95, maxClose * 1.05])
      .range([innerHeight, 0]);

    // Create chart group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat(() => '')
      );

    // Add axes with styling
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .ticks(isExpanded ? 10 : 6)
        .tickSize(0))
      .call(g => g.select('.domain').attr('stroke', '#ccc'))
      .call(g => g.selectAll('text')
        .style('font-size', isExpanded ? '14px' : '12px')
        .style('color', '#666'));

    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale)
        .ticks(isExpanded ? 10 : 6)
        .tickSize(0))
      .call(g => g.select('.domain').attr('stroke', '#ccc'))
      .call(g => g.selectAll('text')
        .style('font-size', isExpanded ? '14px' : '12px')
        .style('color', '#666'));

    // Create line generator with straight lines
    const line = d3.line<ChartData>()
      .x(d => xScale(new Date(d.Date)))
      .y(d => yScale(d.Close))
      .curve(d3.curveLinear); // Changed to straight lines

    // Add the line path with animation
    const path = g.append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', '#000')
      .attr('stroke-width', isExpanded ? 2 : 1.5)
      .attr('d', line);

    // Get the total length of the path
    const totalLength = path.node()?.getTotalLength() || 0;

    // Set up the animation
    path
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0);

  }, [data, chartDimensions, key, isExpanded]);

  return (
    <div className="chart-wrapper" style={{ position: 'relative' }}>
      <div className="chart-controls" style={{
        position: isExpanded ? 'fixed' : 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1050,
        display: 'flex',
        gap: '10px',
        padding: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <button
          onClick={handleReload}
          className="chart-button"
          style={{
            padding: '8px 16px',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: isExpanded ? '16px' : '14px'
          }}
        >
          Reload
        </button>
        <button
          onClick={handleExpand}
          className="chart-button"
          style={{
            padding: '8px 16px',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: isExpanded ? '16px' : '14px'
          }}
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      <div style={{
        position: isExpanded ? 'fixed' : 'relative',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        zIndex: isExpanded ? 1000 : 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          position: 'relative',
          width: 'fit-content',
          height: 'fit-content',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: isExpanded ? '0 4px 16px rgba(0, 0, 0, 0.1)' : 'none'
        }}>
          <svg
            key={key}
            ref={svgRef}
            width={chartDimensions.width}
            height={chartDimensions.height}
            style={{ 
              overflow: 'visible',
              backgroundColor: 'white',
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Chart;