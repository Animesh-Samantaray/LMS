import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-xl bg-[var(--lms-surface-elevated)] border border-[var(--lms-border)] shadow-xl text-xs space-y-1">
        <p className="font-bold text-[var(--lms-text-primary)] mb-1.5">{label}</p>
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-[var(--lms-text-secondary)]">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}:
            </span>
            <span className="font-bold text-[var(--lms-text-primary)]">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ActivityTrendChart = ({
  data = [],
  series = [
    { key: 'totalEvents', name: 'Activity', color: '#6366f1' }
  ],
  height = 250,
}) => {
  const hasData = data.some((d) => series.some((s) => (d[s.key] || 0) > 0));

  if (!hasData) {
    return (
      <div className="h-56 flex flex-col items-center justify-center text-center p-4 rounded-xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border-subtle)]">
        <p className="text-xs font-bold text-[var(--lms-text-primary)] mb-1">No Activity In Selected Period</p>
        <p className="text-[11px] text-[var(--lms-text-muted)]">Submissions and learning milestones will map here once completed.</p>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            {series.map((s, idx) => (
              <linearGradient key={idx} id={`gradient-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0.0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--lms-border-subtle)" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="var(--lms-text-muted)"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: 'var(--lms-border)' }}
          />
          <YAxis
            stroke="var(--lms-text-muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#gradient-${s.key})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityTrendChart;
