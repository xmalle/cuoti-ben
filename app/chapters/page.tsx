'use client';

import { useChaptersData } from '@/lib/hooks/use-data';
import { ChaptersListClient } from '@/components/chapter/chapters-list-client';
import { EmptyState, LoadingSpinner } from '@/components/ui/empty';
import Link from 'next/link';

export default function ChaptersPage() {
  const { subjects, chapters, chapterQuestionCounts, loading } = useChaptersData();

  if (loading) return <LoadingSpinner className="py-20" />;

  if (subjects.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <EmptyState
          title="还没有科目"
          description="请先在科目管理中添加科目。"
          action={
            <Link href="/subjects" className="text-brand-600 text-sm hover:underline">
              前往科目管理
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <ChaptersListClient
      subjects={subjects}
      chapters={chapters}
      chapterQuestionCounts={chapterQuestionCounts}
    />
  );
}
