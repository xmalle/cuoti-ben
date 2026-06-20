'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';
import { useQuestionsData } from '@/lib/hooks/use-data';
import { QuestionsListClient } from '@/components/question/questions-list-client';
import { EmptyState, LoadingSpinner } from '@/components/ui/empty';
import Link from 'next/link';

function QuestionsPageContent() {
  const searchParams = useSearchParams();
  const { subjects, chapters, errorReasons, questions, loading } = useQuestionsData();

  const initialFilters = useMemo(() => {
    const filters: { subject?: string; chapter?: string; reason?: string; q?: string } = {};
    const chapter = searchParams.get('chapter');
    const subject = searchParams.get('subject');
    const reason = searchParams.get('reason');
    const q = searchParams.get('q');
    if (chapter) filters.chapter = chapter;
    if (subject) filters.subject = subject;
    if (reason) filters.reason = reason;
    if (q) filters.q = q;
    return filters;
  }, [searchParams]);

  if (loading) return <LoadingSpinner className="py-20" />;

  if (subjects.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <EmptyState
          title="还没有科目"
          description="先去科目管理添加你的考研科目。"
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
    <QuestionsListClient
      subjects={subjects}
      chapters={chapters}
      errorReasons={errorReasons}
      questions={questions}
      initialFilters={initialFilters}
    />
  );
}

export default function QuestionsPage() {
  return (
    <Suspense fallback={<LoadingSpinner className="py-20" />}>
      <QuestionsPageContent />
    </Suspense>
  );
}
