'use client';

import { useDashboardData } from '@/lib/hooks/use-data';
import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { EmptyState, LoadingSpinner } from '@/components/ui/empty';

export default function HomePage() {
  const { subjects, chapters, dueQuestions, recentQuestions, loading } = useDashboardData();

  if (loading) return <LoadingSpinner className="py-20" />;

  if (subjects.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <EmptyState
          icon={
            <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          }
          title="欢迎来到考研错题本"
          description="前往「我的 → 设置」或「科目管理」添加你的考研科目，然后开始录入错题。"
        />
      </div>
    );
  }

  return (
    <DashboardClient
      subjects={subjects}
      chapters={chapters}
      dueQuestions={dueQuestions}
      recentQuestions={recentQuestions}
    />
  );
}
