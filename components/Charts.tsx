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
  const sortedData = [...data].sort((a, b) => b.count - a.count);

  const getBarColor = (severity: string) => {
    switch (severity) {
      case 'High':
        return '#E85D22'; // Lumina primary
      case 'Medium':
        return '#EA580C'; // Lumina accent
      default:
        return '#71717A';
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item: PainPoint = payload[0].payload;
      return (
        <div className="bg-[#1A1A1A] border border-[#2E2E32] rounded-lg p-3 shadow-xl text-xs font-sans">
          <div className="flex items-center justify-between gap-4 mb-1">
            <span className="font-semibold text-white">{item.category}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${
              item.severity === 'High' ? 'bg-[#E85D22]/20 text-[#E85D22]' : 'bg-white/10 text-zinc-300'
            }`}>
              {item.severity} Priority
            </span>
          </div>
          <p className="text-zinc-400 mb-2 max-w-[200px] leading-relaxed">{item.description}</p>
          <div className="flex items-baseline gap-1 pt-1.5 border-t border-[#2A2A2E]">
            <span className="font-mono text-sm font-bold text-white">{item.count}</span>
            <span className="text-[11px] text-zinc-500">mentions in sample</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[280px] w-full font-sans">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="2 2" horizontal={false} stroke="#222225" />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="category" 
            type="category" 
            width={110} 
            tick={{ fontSize: 13, fill: '#D4D4D8', fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(232, 93, 34, 0.05)' }} />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
            {sortedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getBarColor(entry.severity)} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const RatingBreakdownBar: React.FC<{ averageRating: number; totalReviews: number }> = ({ 
  averageRating, 
  totalReviews 
}) => {
  // Estimate negative distribution based on typical SaaS friction
  const oneStar = Math.round(totalReviews * 0.45);
  const twoStar = Math.round(totalReviews * 0.35);
  const threeStar = Math.max(0, totalReviews - oneStar - twoStar);

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold tracking-tight text-white font-sans">{averageRating.toFixed(1)}</span>
          <span className="text-sm text-zinc-500 font-mono">/ 5.0</span>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-lumina-orange font-semibold uppercase tracking-wider">High Vulnerability</span>
          <p className="text-xs text-zinc-400">{totalReviews} verified reviews</p>
        </div>
      </div>

      {/* Segmented bar */}
      <div className="h-2.5 w-full bg-[#141416] rounded-full overflow-hidden flex gap-1 p-0.5 border border-[#26262B]">
        <div 
          className="h-full bg-lumina-orange rounded-full" 
          style={{ width: `${(oneStar / totalReviews) * 100}%` }} 
          title={`1 Star: ${oneStar}`}
        />
        <div 
          className="h-full bg-lumina-accent rounded-full opacity-80" 
          style={{ width: `${(twoStar / totalReviews) * 100}%` }} 
          title={`2 Star: ${twoStar}`}
        />
        <div 
          className="h-full bg-zinc-600 rounded-full opacity-60" 
          style={{ width: `${(threeStar / totalReviews) * 100}%` }} 
          title={`3 Star: ${threeStar}`}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-lumina-orange"></span>
          1★ ({oneStar})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-lumina-accent"></span>
          2★ ({twoStar})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-zinc-600"></span>
          3★ ({threeStar})
        </span>
      </div>
    </div>
  );
};