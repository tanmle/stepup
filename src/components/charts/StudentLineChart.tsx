'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DataPoint {
  month: string;
  count: number;
}

interface StudentLineChartProps {
  data: DataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-md shadow-card-hover">
        <p className="text-label-sm text-on-surface-variant mb-xs">{label}</p>
        <p className="text-body-md font-semibold text-primary">{payload[0].value} học viên mới</p>
      </div>
    );
  }
  return null;
};

export default function StudentLineChart({ data }: StudentLineChartProps) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="studentGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3755c3" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#3755c3" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#c4c5d5" strokeOpacity={0.3} vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#757684', fontFamily: 'Be Vietnam Pro' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#757684', fontFamily: 'Be Vietnam Pro' }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#00288e', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area
            type="monotone"
            dataKey="count"
            name="Học viên mới"
            stroke="#3755c3"
            strokeWidth={2.5}
            fill="url(#studentGrad)"
            dot={{ r: 3, fill: '#3755c3', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#00288e', strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
