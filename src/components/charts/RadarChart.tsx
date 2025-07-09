'use client';

import React, { useMemo } from 'react';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { DASHBOARD_COLORS } from '@/styles/dashboardColors';
import { ChartDataPoint } from '@/utils/chartUtils';

// TypeScript Interfaces
export interface RadarChartData {
  entityId: string;
  entityName: string;
  data: ChartDataPoint[];
  color?: string;
}

interface RadarChartProps {
  entities: RadarChartData[];
  width?: number | string;
  height?: number | string;
  showLegend?: boolean;
  animate?: boolean;
  className?: string;
}

// Custom Tooltip Component
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border rounded shadow-sm">
        <p className="font-weight-bold mb-1">{label}</p>
        {payload.map((entry, index: number) => (
          <p key={index} className="mb-0 small" style={{ color: entry.color }}>
            {entry.name}: {entry.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const RadarChart: React.FC<RadarChartProps> = ({
  entities,
  width = '100%',
  height = 300,
  showLegend = true,
  animate = true,
  className = ''
}) => {
  // Memoize the validation to prevent unnecessary re-renders
  const hasValidData = useMemo(() => {
    return entities && entities.length > 0 && entities[0] && entities[0].data && entities[0].data.length > 0;
  }, [entities]);

  if (!hasValidData) {
    return (
      <div className={className} style={{ height }}>
        <div className="d-flex align-items-center justify-content-center h-100">
          <div className="text-center">
            <i className="fas fa-chart-radar text-muted mb-2" style={{ fontSize: '2rem' }}></i>
            <p className="text-muted mb-0">No data available</p>
          </div>
        </div>
      </div>
    );
  }

  // For radar charts to look good, we need at least 3 data points
  // If we have less, we'll create a simple bar-like visualization
  const dataPointCount = entities[0].data.length;
  
  // Merge all entity data for multi-entity comparison
  const mergedData = entities[0].data.map((dataItem, index) => {
    const merged: Record<string, number | string> = {
      name: dataItem.name,
      fullMark: dataItem.maxValue
    };
    
    entities.forEach((entity) => {
      merged[entity.entityName] = entity.data[index]?.value || 0;
    });
    
    return merged;
  });

  // Get colors for entities
  const getEntityColor = (index: number): string => {
    const colors = DASHBOARD_COLORS.radar.primary;
    return colors[index % colors.length];
  };
  
  // For 2 or fewer data points, show a different visualization message
  if (dataPointCount < 3) {
    return (
      <div className={className} style={{ height }}>
        <div className="d-flex align-items-center justify-content-center h-100">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-warning mb-2" style={{ fontSize: '2rem' }}></i>
            <p className="text-muted mb-2">Radar chart needs 3+ data points</p>
            <small className="text-muted">
              Currently {dataPointCount} data point{dataPointCount !== 1 ? 's' : ''} available
            </small>
            <div className="mt-3">
              {entities[0].data.map((dataPoint, idx) => (
                <div key={idx} className="mb-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <small className="text-muted">{dataPoint.name}</small>
                    <small className="font-weight-bold">{dataPoint.value}%</small>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div 
                      className="progress-bar" 
                      style={{ 
                        width: `${dataPoint.value}%`,
                        backgroundColor: getEntityColor(0)
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <ResponsiveContainer width={width} height={height}>
        <RechartsRadarChart data={mergedData}>
          <PolarGrid 
            gridType="polygon"
            radialLines={true}
          />
          <PolarAngleAxis 
            dataKey="name"
            tick={{ fontSize: 12 }}
            className="text-muted"
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, entities[0]?.data[0]?.maxValue || 100]}
            tickCount={6}
            tick={{ fontSize: 10 }}
          />
          
          {entities.map((entity, index) => (
            <Radar
              key={entity.entityId}
              name={entity.entityName}
              dataKey={entity.entityName}
              stroke={entity.color || getEntityColor(index)}
              fill={entity.color || getEntityColor(index)}
              fillOpacity={0.3}
              strokeWidth={2}
              animationDuration={animate ? 1000 : 0}
            />
          ))}
          
          <Tooltip 
            content={<CustomTooltip />}
            wrapperStyle={{ zIndex: 1000 }}
          />
          
          {showLegend && entities.length > 1 && (
            <Legend 
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '14px'
              }}
            />
          )}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChart;

