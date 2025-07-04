'use client';

import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { DASHBOARD_COLORS } from '@/styles/dashboardColors';

// TypeScript Interfaces
export interface PillarData {
  pillar: string;
  score: number;
  fullMark: 100;
}

export interface TeamRadarData {
  teamId: string;
  teamName: string;
  data: PillarData[];
  color?: string;
}

interface TeamRadarChartProps {
  teams: TeamRadarData[];
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

const TeamRadarChart: React.FC<TeamRadarChartProps> = ({
  teams,
  width = '100%',
  height = 300,
  showLegend = true,
  animate = true,
  className = ''
}) => {
  // Check if we have valid data
  if (!teams || teams.length === 0 || teams[0].data.length === 0) {
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

  // For radar charts to look good, we need at least 3 pillars
  // If we have less, we'll create a simple bar-like visualization
  const pillarCount = teams[0].data.length;
  
  // Merge all team data for multi-team comparison
  const mergedData = teams[0].data.map((pillarItem, index) => {
    const merged: Record<string, number | string> = {
      pillar: pillarItem.pillar,
      fullMark: 100
    };
    
    teams.forEach((team) => {
      merged[team.teamName] = team.data[index]?.score || 0;
    });
    
    return merged;
  });

  // Get colors for teams
  const getTeamColor = (index: number): string => {
    const teamColors = DASHBOARD_COLORS.radar.primary;
    return teamColors[index % teamColors.length];
  };
  
  // For 2 or fewer pillars, show a different visualization message
  if (pillarCount < 3) {
    return (
      <div className={className} style={{ height }}>
        <div className="d-flex align-items-center justify-content-center h-100">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-warning mb-2" style={{ fontSize: '2rem' }}></i>
            <p className="text-muted mb-2">Radar chart needs 3+ pillars</p>
            <small className="text-muted">
              Currently {pillarCount} pillar{pillarCount !== 1 ? 's' : ''} available
            </small>
            <div className="mt-3">
              {teams[0].data.map((pillar, idx) => (
                <div key={idx} className="mb-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <small className="text-muted">{pillar.pillar}</small>
                    <small className="font-weight-bold">{pillar.score}%</small>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div 
                      className="progress-bar" 
                      style={{ 
                        width: `${pillar.score}%`,
                        backgroundColor: getTeamColor(0)
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
        <RadarChart data={mergedData}>
          <PolarGrid 
            gridType="polygon"
            radialLines={true}
          />
          <PolarAngleAxis 
            dataKey="pillar"
            tick={{ fontSize: 12 }}
            className="text-muted"
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tickCount={6}
            tick={{ fontSize: 10 }}
          />
          
          {teams.map((team, index) => (
            <Radar
              key={team.teamId}
              name={team.teamName}
              dataKey={team.teamName}
              stroke={team.color || getTeamColor(index)}
              fill={team.color || getTeamColor(index)}
              fillOpacity={0.3}
              strokeWidth={2}
              animationDuration={animate ? 1000 : 0}
            />
          ))}
          
          <Tooltip 
            content={<CustomTooltip />}
            wrapperStyle={{ zIndex: 1000 }}
          />
          
          {showLegend && teams.length > 1 && (
            <Legend 
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '14px'
              }}
            />
          )}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TeamRadarChart;

// Helper function to transform API data to radar format
export const transformToRadarData = (
  pillarScores: Record<string, { name: string; score: number; actualScore: number; potentialScore: number }>
): PillarData[] => {
  return Object.entries(pillarScores).map(([, pillar]) => ({
    pillar: pillar.name,
    score: Math.round(pillar.score), // Already a percentage
    fullMark: 100
  }));
};