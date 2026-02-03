import React from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

interface AreaChartProps {
  data: Array<{ name: string; value: number; value2?: number }>;
  dataKey?: string;
  dataKey2?: string;
  color?: string;
  color2?: string;
  height?: number;
  showGrid?: boolean;
  formatValue?: (value: number) => string;
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  dataKey = 'value',
  dataKey2,
  color = '#0ea5e9',
  color2 = '#10b981',
  height = 300,
  showGrid = true,
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
          <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatValue(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        {showGrid && (
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} 
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
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey={dataKey}
          name="Receitas"
          stroke={color}
          fill={color}
          fillOpacity={0.2}
          strokeWidth={2}
        />
        {dataKey2 && (
          <Area
            type="monotone"
            dataKey={dataKey2}
            name="Despesas"
            stroke={color2}
            fill={color2}
            fillOpacity={0.2}
            strokeWidth={2}
          />
        )}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
};

export default AreaChart;
