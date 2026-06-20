'use client';

import { useStatsData } from '@/lib/hooks/use-data';
import { StatsClient } from '@/components/stats/stats-client';
import { EmptyState, LoadingSpinner } from '@/components/ui/empty';
import Link from 'next/link';

export default function StatsPage() {
  const { subjects, errorReasons, chapterStats, loading } = useStatsData();

  if (loading) return <LoadingSpinner className="py-20" />;

  const hasQuestions = chapterStats.some((c) => c.total_questions > 0);

  if (!hasQuestions) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <EmptyState
          title="还没有错题数据"
          description="录入错题后，这里会展示按章节维度的错因分布报告。"
          action={
            <Link href="/questions/new" className="text-brand-600 text-sm hover:underline">
              录入第一道错题
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <StatsClient
      subjects={subjects}
      errorReasons={errorReasons}
      chapterStats={chapterStats}
    />
  );
}
