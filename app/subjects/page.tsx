'use client';

import { useSubjectsData } from '@/lib/hooks/use-data';
import { SubjectsClient } from '@/components/subject/subjects-client';
import { LoadingSpinner } from '@/components/ui/empty';

export default function SubjectsPage() {
  const { subjects, chapterCounts, questionCounts, loading } = useSubjectsData();

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <SubjectsClient
      subjects={subjects}
      chapterCounts={chapterCounts}
      questionCounts={questionCounts}
    />
  );
}
