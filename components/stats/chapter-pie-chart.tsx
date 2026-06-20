'use client';

import { ChapterErrorStats } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Props {
  data: ChapterErrorStats;
}

/**
 * 单章节错因占比饼图
 */
export function ChapterPieChart({ data }: Props) {
  const chartData = data.by_reason
    .filter((r) => r.frequency > 0)
    .map((r) => ({
      name: r.reason_name,
      value: r.frequency,
      color: r.color,
    }));

  if (chartData.length === 0) {
    return <p className="text-center text-sm text-slate-400 py-8">该章节暂无错因数据</p>;
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={40}
            label={({ name, value, percent }) =>
              `${name} ${value}题(${((percent || 0) * 100).toFixed(0)}%)`
            }
            labelLine={false}
            fontSize={11}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [`${value} 题`, name]}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center flex-wrap gap-3 mt-2">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-slate-600">
              {item.name} · {item.value}题
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
