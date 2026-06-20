'use client';

import Link from 'next/link';
import { Subject, Chapter, Question } from '@/types';
import { Card, CardBody } from '@/components/ui/card';
import { Tag } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty';
import { relativeTime, formatDate, isOverdue } from '@/lib/utils';
import { BookIcon, RefreshIcon, PlusIcon, AlertIcon } from '@/components/ui/icons';

interface Props {
  subjects: Subject[];
  chapters: Chapter[];
  dueQuestions: Pick<Question, 'id' | 'title' | 'chapter_id' | 'subject_id' | 'next_review_at' | 'difficulty'>[];
  recentQuestions: Pick<Question, 'id' | 'title' | 'created_at' | 'chapter_id' | 'subject_id'>[];
}

export function DashboardClient({ subjects, chapters, dueQuestions, recentQuestions }: Props) {
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const chapterMap = new Map(chapters.map((c) => [c.id, c]));

  const overdueCount = dueQuestions.filter((q) => isOverdue(q.next_review_at)).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* 今日复习卡片 */}
      <Card>
        <CardBody className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
            <RefreshIcon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-500">今日待复习</p>
            <p className="text-2xl font-bold text-slate-900">
              {dueQuestions.length}
              <span className="text-sm font-normal text-slate-400 ml-1">题</span>
            </p>
            {overdueCount > 0 && (
              <p className="text-xs text-orange-500 mt-0.5 flex items-center gap-1">
                <AlertIcon className="h-3 w-3" />
                其中 {overdueCount} 题已逾期
              </p>
            )}
          </div>
          <Link
            href="/review"
            className="px-4 h-9 rounded-lg bg-brand-600 text-white text-sm font-medium flex items-center hover:bg-brand-700"
          >
            去复习
          </Link>
        </CardBody>
      </Card>

      {/* 科目概览 */}
      <section>
        <h2 className="text-sm font-semibold text-slate-700 mb-2 px-1">科目</h2>
        <div className="grid grid-cols-2 gap-3">
          {subjects.map((subject) => (
            <Link key={subject.id} href={`/questions?subject=${subject.id}`}>
              <Card className="hover:border-brand-300 transition-colors cursor-pointer">
                <CardBody className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: subject.color }}
                  >
                    {subject.name.slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">{subject.name}</p>
                    <p className="text-xs text-slate-400">
                      {chapters.filter((c) => c.subject_id === subject.id).length} 个章节
                    </p>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 最近错题 */}
      <section>
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-sm font-semibold text-slate-700">最近录入</h2>
          <Link href="/questions" className="text-xs text-brand-600 hover:underline">
            查看全部
          </Link>
        </div>
        {recentQuestions.length === 0 ? (
          <Card>
            <EmptyState
              icon={<BookIcon className="h-10 w-10" />}
              title="还没有错题"
              description="点击右上方 + 录入第一道错题"
              action={
                <Link
                  href="/questions/new"
                  className="inline-flex items-center gap-1 px-3 h-8 rounded-lg bg-brand-600 text-white text-sm"
                >
                  <PlusIcon className="h-4 w-4" /> 录入错题
                </Link>
              }
            />
          </Card>
        ) : (
          <div className="space-y-2">
            {recentQuestions.map((q) => {
              const subject = subjectMap.get(q.subject_id);
              const chapter = chapterMap.get(q.chapter_id);
              return (
                <Link key={q.id} href={`/questions/view?id=${q.id}`}>
                  <Card className="hover:border-brand-300 transition-colors cursor-pointer">
                    <CardBody className="py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-900 line-clamp-2">
                            {q.title || '(未填写题目文字)'}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {subject && <Tag color={subject.color}>{subject.name}</Tag>}
                            {chapter && <span className="text-xs text-slate-400">{chapter.name}</span>}
                          </div>
                        </div>
                        <span className="text-xs text-slate-400 flex-shrink-0">
                          {relativeTime(q.created_at)}
                        </span>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 待复习列表预览 */}
      {dueQuestions.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-sm font-semibold text-slate-700">待复习题目</h2>
            <Link href="/review" className="text-xs text-brand-600 hover:underline">
              开始复习
            </Link>
          </div>
          <div className="space-y-2">
            {dueQuestions.slice(0, 5).map((q) => {
              const subject = subjectMap.get(q.subject_id);
              const chapter = chapterMap.get(q.chapter_id);
              return (
                <Link key={q.id} href={`/questions/view?id=${q.id}`}>
                  <Card className="hover:border-brand-300 transition-colors cursor-pointer">
                    <CardBody className="py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-900 line-clamp-1">
                            {q.title || '(未填写题目文字)'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {subject && <Tag color={subject.color}>{subject.name}</Tag>}
                            {chapter && <span className="text-xs text-slate-400 truncate">{chapter.name}</span>}
                          </div>
                        </div>
                        <span className="text-xs text-orange-500 flex-shrink-0">
                          {formatDate(q.next_review_at)}
                        </span>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
