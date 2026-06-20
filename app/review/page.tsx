'use client';

import { useReviewData } from '@/lib/hooks/use-data';
import { ReviewClient } from '@/components/review/review-client';
import { EmptyState, LoadingSpinner } from '@/components/ui/empty';
import Link from 'next/link';

export default function ReviewPage() {
  const { questions, loading } = useReviewData();

  if (loading) return <LoadingSpinner className="py-20" />;

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <EmptyState
          icon={
            <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          }
          title="今日复习已完成 🎉"
          description="没有待复习的错题了，去录入新错题或查看错题列表吧。"
          action={
            <Link href="/questions/new" className="text-brand-600 text-sm hover:underline">
              录入新错题
            </Link>
          }
        />
      </div>
    );
  }

  return <ReviewClient questions={questions} />;
}
