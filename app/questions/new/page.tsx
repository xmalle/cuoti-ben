'use client';

import { useQuestionFormData } from '@/lib/hooks/use-data';
import { QuestionFormClient } from '@/components/question/question-form-client';
import { EmptyState, LoadingSpinner } from '@/components/ui/empty';
import Link from 'next/link';

export default function NewQuestionPage() {
  const { subjects, chapters, errorReasons, loading } = useQuestionFormData();

  if (loading) return <LoadingSpinner className="py-20" />;

  if (subjects.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <EmptyState
          title="请先创建科目和章节"
          description="录入错题前需要先有科目和章节。"
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
    <QuestionFormClient
      subjects={subjects}
      chapters={chapters}
      errorReasons={errorReasons}
      mode="create"
    />
  );
}
