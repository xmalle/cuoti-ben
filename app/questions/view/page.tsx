'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useQuestionDetail } from '@/lib/hooks/use-data';
import { QuestionDetailClient } from '@/components/question/question-detail-client';
import { EmptyState, LoadingSpinner } from '@/components/ui/empty';

function QuestionViewContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { question, reviews, loading, notFound } = useQuestionDetail(id);

  if (loading) return <LoadingSpinner className="py-20" />;
  if (notFound || !question) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <EmptyState title="错题不存在" description="它可能已被删除。" />
      </div>
    );
  }

  return <QuestionDetailClient question={question} reviews={reviews} />;
}

export default function QuestionViewPage() {
  return (
    <Suspense fallback={<LoadingSpinner className="py-20" />}>
      <QuestionViewContent />
    </Suspense>
  );
}
