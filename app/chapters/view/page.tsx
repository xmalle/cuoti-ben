'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useChapterDetail } from '@/lib/hooks/use-data';
import { ChapterDetailClient } from '@/components/chapter/chapter-detail-client';
import { EmptyState, LoadingSpinner } from '@/components/ui/empty';

function ChapterViewContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { chapter, knowledgePoints, questionCount, loading, notFound } = useChapterDetail(id);

  if (loading) return <LoadingSpinner className="py-20" />;
  if (notFound || !chapter) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <EmptyState title="章节不存在" />
      </div>
    );
  }

  return (
    <ChapterDetailClient
      chapter={chapter}
      knowledgePoints={knowledgePoints}
      questionCount={questionCount}
    />
  );
}

export default function ChapterViewPage() {
  return (
    <Suspense fallback={<LoadingSpinner className="py-20" />}>
      <ChapterViewContent />
    </Suspense>
  );
}
