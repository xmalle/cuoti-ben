'use client';

import { ChapterErrorStats, ErrorReason } from '@/types';
import { hexToRgba, truncate } from '@/lib/utils';

interface Props {
  data: ChapterErrorStats[];
  reasons: ErrorReason[];
  onCellClick?: (chapterId: string) => void;
}

/**
 * 章节错因热力表
 * 行=章节，列=错因标签，单元格颜色深浅=频次
 */
export function HeatmapTable({ data, reasons, onCellClick }: Props) {
  const sorted = [...data].sort((a, b) => b.total_questions - a.total_questions);
  const maxFreq = Math.max(
    ...sorted.flatMap((c) => c.by_reason.map((r) => r.frequency)),
    1
  );

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="w-full text-xs border-collapse min-w-[480px]">
        <thead>
          <tr>
            <th className="text-left text-slate-400 font-medium py-2 px-1.5 sticky left-0 bg-white">
              章节
            </th>
            {reasons.map((r) => (
              <th
                key={r.id}
                className="text-center text-slate-500 font-medium py-2 px-1 whitespace-nowrap"
                style={{ minWidth: 44 }}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: r.color }}
                  />
                  {r.name}
                </div>
              </th>
            ))}
            <th className="text-center text-slate-400 font-medium py-2 px-1.5">合计</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((chapter) => (
            <tr key={chapter.chapter_id} className="border-t border-slate-100">
              <td
                className="py-1.5 px-1.5 text-slate-700 sticky left-0 bg-white cursor-pointer max-w-[120px]"
                onClick={() => onCellClick?.(chapter.chapter_id)}
              >
                <span className="block truncate" title={chapter.chapter_name}>
                  {truncate(chapter.chapter_name, 12)}
                </span>
              </td>
              {chapter.by_reason.map((r) => {
                const intensity = r.frequency / maxFreq;
                return (
                  <td
                    key={r.reason_id}
                    className="text-center py-1.5 px-1 cursor-pointer"
                    onClick={() => onCellClick?.(chapter.chapter_id)}
                    title={`${chapter.chapter_name} - ${r.reason_name}: ${r.frequency} 题`}
                  >
                    <div
                      className="h-8 rounded flex items-center justify-center font-medium transition-transform hover:scale-105"
                      style={{
                        backgroundColor:
                          r.frequency === 0
                            ? '#f8fafc'
                            : hexToRgba(r.color, 0.2 + intensity * 0.8),
                        color: r.frequency === 0 ? '#cbd5e1' : intensity > 0.5 ? '#fff' : r.color,
                      }}
                    >
                      {r.frequency > 0 ? r.frequency : '·'}
                    </div>
                  </td>
                );
              })}
              <td className="text-center py-1.5 px-1.5 font-semibold text-slate-700">
                {chapter.total_questions}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
