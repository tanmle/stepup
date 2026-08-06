'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { MonthlyRevenue } from '@/lib/types';

interface RevenueChartProps {
  data: MonthlyRevenue[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-md shadow-card-hover">
        <p className="text-label-sm text-on-surface-variant mb-sm">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center gap-sm">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-body-md text-on-surface">
              {entry.name}: <span className="font-semibold">{entry.value}M đ</span>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={2} barCategoryGap="30%">
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
            tickFormatter={(v) => `${v}M`}
            width={36}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,40,142,0.04)', radius: 8 }} />
          <Legend
            wrapperStyle={{ fontSize: 11, fontFamily: 'Be Vietnam Pro', paddingTop: 8 }}
            iconType="circle"
            iconSize={8}
          />
          <Bar dataKey="revenue" name="Doanh thu" fill="#00288e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="cost" name="Chi phí" fill="#e8e7f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
