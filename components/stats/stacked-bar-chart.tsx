'use client';

import { ChapterErrorStats, ErrorReason } from '@/types';
import { hexToRgba, truncate } from '@/lib/utils';

interface Props {
  data: ChapterErrorStats[];
  reasons: ErrorReason[];
  onBarClick?: (chapterId: string) => void;
}

/**
 * 章节错因堆叠条形图（横向）
 * 纯 CSS + SVG 实现，避免 Recharts 在移动端的横向滚动问题
 */
export function StackedBarChart({ data, reasons, onBarClick }: Props) {
  const sorted = [...data].sort((a, b) => b.total_questions - a.total_questions);
  const maxTotal = Math.max(...sorted.map((d) => d.total_questions), 1);

  return (
    <div className="space-y-2.5">
      {sorted.map((chapter) => {
        const segments = chapter.by_reason.filter((r) => r.frequency > 0);
        return (
          <div
            key={chapter.chapter_id}
            className="group cursor-pointer"
            onClick={() => onBarClick?.(chapter.chapter_id)}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-600 truncate pr-2">
                {truncate(chapter.chapter_name, 16)}
              </span>
              <span className="text-xs text-slate-400 flex-shrink-0">{chapter.total_questions} 题</span>
            </div>
            <div className="h-6 w-full bg-slate-100 rounded-md overflow-hidden flex">
              {segments.length === 0 ? (
                <div className="h-full bg-slate-200" style={{ width: '100%' }} />
              ) : (
                segments.map((seg) => (
                  <div
                    key={seg.reason_id}
                    className="h-full transition-all hover:brightness-110 flex items-center justify-center text-[10px] text-white font-medium"
                    style={{
                      backgroundColor: seg.color,
                      width: `${(seg.frequency / maxTotal) * 100}%`,
                    }}
                    title={`${seg.reason_name}: ${seg.frequency} 题 (${seg.percentage}%)`}
                  >
                    {seg.frequency >= 3 && seg.frequency}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}

      {/* 图例 */}
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
        {reasons.map((r) => (
          <div key={r.id} className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: r.color }} />
            <span className="text-xs text-slate-500">{r.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
