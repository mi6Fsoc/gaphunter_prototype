import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { PainPoint } from '../types';

interface PainPointChartProps {
  data: PainPoint[];
}

export const PainPointChart: React.FC<PainPointChartProps> = ({ data }) => {
  // Sort by count descending
  const sortedData = [...data].sort((a, b) => b.count - a.count);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#27272a" />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="category" 
            type="category" 
            width={120} 
            tick={{ fontSize: 12, fill: '#a1a1aa' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            cursor={{ fill: '#27272a', opacity: 0.4 }}
            contentStyle={{ 
              backgroundColor: '#18181b', 
              border: '1px solid #27272a', 
              borderRadius: '0px',
              color: '#f4f4f5'
            }}
            itemStyle={{ color: '#e4e4e7' }}
          />
          <Bar dataKey="count" radius={[0, 0, 0, 0]} barSize={24}>
            {sortedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.severity === 'High' ? '#ffffff' : entry.severity === 'Medium' ? '#a1a1aa' : '#52525b'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};