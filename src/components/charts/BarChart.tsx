import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

interface BarChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  height?: number;
  showGrid?: boolean;
  gradient?: boolean;
  formatValue?: (value: number) => string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 300,
  showGrid = true,
  gradient = true,
  formatValue = (v) => `R$ ${v.toLocaleString('pt-BR')}`,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-lg border shadow-lg ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <p className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {label}
          </p>
          <p className="text-sm text-primary">
            {formatValue(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const defaultColor = '#0ea5e9';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity={1} />
            <stop offset="100%" stopColor="#0284c7" stopOpacity={0.8} />
          </linearGradient>
        </defs>
        {showGrid && (
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} 
            vertical={false}
          />
        )}
        <XAxis 
          dataKey="name" 
          stroke={isDark ? '#6b7280' : '#9ca3af'}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke={isDark ? '#6b7280' : '#9ca3af'}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
        <Bar 
          dataKey="value" 
          radius={[6, 6, 0, 0]}
          animationBegin={0}
          animationDuration={800}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={gradient ? 'url(#barGradient)' : (entry.color || defaultColor)} 
            />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;
