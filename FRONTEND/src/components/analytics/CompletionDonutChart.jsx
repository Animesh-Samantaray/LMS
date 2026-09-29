import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="p-2.5 rounded-xl bg-[var(--lms-surface-elevated)] border border-[var(--lms-border)] shadow-xl text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: data.payload.color || data.color }}
          />
          <span className="text-[var(--lms-text-primary)]">{data.name}:</span>
          <span className="text-[var(--lms-accent)] font-bold">{data.value}</span>
        </div>
      </div>
    );
  }
  return null;
};

const CompletionDonutChart = ({ data = [], height = 240, innerRadius = 55, outerRadius = 80 }) => {
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);

  if (total === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center text-center p-4">
        <div className="w-16 h-16 rounded-full border-4 border-dashed border-[var(--lms-border)] flex items-center justify-center mb-2 text-xs font-bold text-[var(--lms-text-muted)]">
          0%
        </div>
        <p className="text-xs text-[var(--lms-text-secondary)] font-medium">No progress records yet</p>
      </div>
    );
  }

  return (
    <div className="w-full relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<CustomTooltip />} />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
            ))}
          </Pie>
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry) => (
              <span className="text-xs font-semibold text-[var(--lms-text-secondary)]">
                {value} ({entry.payload.value})
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CompletionDonutChart;
