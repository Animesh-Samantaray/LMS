import React from 'react';
import {
  BarChart,
  Bar,
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
            <span className="font-bold text-[var(--lms-text-primary)]">
              {entry.value}
              {entry.dataKey.toLowerCase().includes('rate') || entry.dataKey.toLowerCase().includes('percentage') || entry.dataKey.toLowerCase().includes('progress')
                ? '%'
                : ''}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CourseComparisonBarChart = ({
  data = [],
  dataKey = 'averageProgress',
  name = 'Avg Progress',
  color = '#6366f1',
  height = 260,
  layout = 'horizontal',
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-56 flex flex-col items-center justify-center text-center p-4 rounded-xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border-subtle)]">
        <p className="text-xs font-bold text-[var(--lms-text-primary)] mb-1">No Courses Available</p>
        <p className="text-[11px] text-[var(--lms-text-muted)]">Course performance metrics will populate here.</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    shortTitle: d.title?.length > 18 ? `${d.title.substring(0, 16)}...` : d.title,
  }));

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout={layout}
          margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--lms-border-subtle)" vertical={false} />
          {layout === 'horizontal' ? (
            <>
              <XAxis
                dataKey="shortTitle"
                stroke="var(--lms-text-muted)"
                fontSize={10}
                interval={0}
                angle={-15}
                textAnchor="end"
                tickLine={false}
                axisLine={{ stroke: 'var(--lms-border)' }}
              />
              <YAxis
                stroke="var(--lms-text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
            </>
          ) : (
            <>
              <XAxis
                type="number"
                stroke="var(--lms-text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="shortTitle"
                stroke="var(--lms-text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'var(--lms-border)' }}
                width={100}
              />
            </>
          )}
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={dataKey} name={name} fill={color} radius={[6, 6, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CourseComparisonBarChart;
