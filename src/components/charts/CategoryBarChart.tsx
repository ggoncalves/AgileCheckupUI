'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface CategoryData {
  name: string;
  score: number;
  actualScore: number;
  potentialScore: number;
}

interface CategoryBarChartProps {
  categories: CategoryData[];
  color: string;
  height?: number;
  className?: string;
}

const CategoryBarChart: React.FC<CategoryBarChartProps> = ({
  categories,
  color,
  height = 300,
  className = ''
}) => {
  const data = categories.map(category => ({
    name: category.name.length > 15 ? `${category.name.substring(0, 15)}...` : category.name,
    fullName: category.name,
    score: Math.round(category.score),
    actualScore: category.actualScore,
    potentialScore: category.potentialScore
  }));

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value: number) => [
              `${value}%`,
              'Score'
            ]}
            labelFormatter={(label: string, payload: Array<{ payload: { fullName: string } }>) => {
              const item = payload?.[0]?.payload;
              return item ? item.fullName : label;
            }}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          <Bar 
            dataKey="score" 
            fill={color}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryBarChart;