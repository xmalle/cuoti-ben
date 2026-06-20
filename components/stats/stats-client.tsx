'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Subject, ErrorReason, ChapterErrorStats } from '@/types';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/input';
import { Tag } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty';
import { AlertIcon, ChartIcon } from '@/components/ui/icons';
import { StackedBarChart } from './stacked-bar-chart';
import { HeatmapTable } from './heatmap-table';
import { ChapterPieChart } from './chapter-pie-chart';

interface Props {
  subjects: Subject[];
  errorReasons: ErrorReason[];
  chapterStats: ChapterErrorStats[];
}

export function StatsClient({ subjects, errorReasons, chapterStats }: Props) {
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  const filteredStats = useMemo(() => {
    if (subjectFilter === 'all') return chapterStats;
    return chapterStats.filter((c) => c.subject_id === subjectFilter);
  }, [chapterStats, subjectFilter]);

  const chaptersWithQuestions = filteredStats.filter((c) => c.total_questions > 0);
  const totalQuestions = filteredStats.reduce((sum, c) => sum + c.total_questions, 0);

  // 薄弱章节：错题数 TOP3 或某错因占比 > 50%
  const weakChapters = useMemo(() => {
    return chaptersWithQuestions
      .map((c) => {
        const maxReason = c.by_reason.reduce(
          (max, r) => (r.frequency > max.frequency ? r : max),
          { frequency: 0, percentage: 0, reason_name: '', color: '', reason_id: '' }
        );
        return { ...c, dominantReason: maxReason };
      })
      .sort((a, b) => b.total_questions - a.total_questions)
      .slice(0, 3);
  }, [chaptersWithQuestions]);

  const selectedChapterData = selectedChapter
    ? chapterStats.find((c) => c.chapter_id === selectedChapter)
    : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      {/* 科目筛选 */}
      <Select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
        <option value="all">全部科目</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </Select>

      {/* 总览 */}
      <Card>
        <CardBody className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
            <ChartIcon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-500">错题总数</p>
            <p className="text-2xl font-bold text-slate-900">
              {totalQuestions}
              <span className="text-sm font-normal text-slate-400 ml-1">题</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">涉及章节</p>
            <p className="text-2xl font-bold text-slate-900">{chaptersWithQuestions.length}</p>
          </div>
        </CardBody>
      </Card>

      {/* 薄弱章节预警 */}
      {weakChapters.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="border-orange-100">
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertIcon className="h-4 w-4" />
              重点关注章节（错题 TOP3）
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-2">
            {weakChapters.map((c, index) => (
              <div
                key={c.chapter_id}
                className="flex items-center gap-2 p-2 rounded-lg bg-white cursor-pointer hover:bg-orange-50"
                onClick={() => setSelectedChapter(c.chapter_id)}
              >
                <span className="h-6 w-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{c.chapter_name}</p>
                  <p className="text-xs text-slate-500">
                    {c.total_questions} 道错题 · 主要：{c.dominantReason.reason_name || '—'}
                  </p>
                </div>
                {c.dominantReason.percentage > 50 && (
                  <Tag color="#ef4444">{c.dominantReason.percentage}%</Tag>
                )}
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {/* 章节错因堆叠条形图 */}
      <Card>
        <CardHeader>
          <CardTitle>各章节错因分布</CardTitle>
        </CardHeader>
        <CardBody>
          {chaptersWithQuestions.length === 0 ? (
            <EmptyState title="暂无数据" description="当前筛选条件下没有错题" />
          ) : (
            <StackedBarChart
              data={chaptersWithQuestions}
              reasons={errorReasons}
              onBarClick={(chapterId) => setSelectedChapter(chapterId)}
            />
          )}
        </CardBody>
      </Card>

      {/* 章节错因热力表 */}
      <Card>
        <CardHeader>
          <CardTitle>章节 × 错因 热力表</CardTitle>
        </CardHeader>
        <CardBody>
          {chaptersWithQuestions.length === 0 ? (
            <EmptyState title="暂无数据" />
          ) : (
            <HeatmapTable
              data={chaptersWithQuestions}
              reasons={errorReasons}
              onCellClick={(chapterId) => setSelectedChapter(chapterId)}
            />
          )}
        </CardBody>
      </Card>

      {/* 单章节错因饼图 */}
      {selectedChapterData && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>{selectedChapterData.chapter_name} · 错因占比</CardTitle>
            <button
              onClick={() => setSelectedChapter(null)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              关闭
            </button>
          </CardHeader>
          <CardBody>
            <ChapterPieChart data={selectedChapterData} />
            <div className="mt-3 flex justify-center">
              <Link
                href={`/questions?chapter=${selectedChapterData.chapter_id}`}
                className="text-xs text-brand-600 hover:underline"
              >
                查看该章节所有错题 →
              </Link>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
