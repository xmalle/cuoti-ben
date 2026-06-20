'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Subject, Chapter, ErrorReason, QuestionWithRelations } from '@/types';
import { Card, CardBody } from '@/components/ui/card';
import { Tag } from '@/components/ui/chip';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/input';
import { EmptyState, LoadingSpinner } from '@/components/ui/empty';
import { SearchIcon, PlusIcon } from '@/components/ui/icons';
import { relativeTime } from '@/lib/utils';

interface Props {
  subjects: Subject[];
  chapters: Chapter[];
  errorReasons: ErrorReason[];
  questions: (QuestionWithRelations & { error_reason_ids: string[] })[];
  initialFilters: { subject?: string; chapter?: string; reason?: string; q?: string };
}

export function QuestionsListClient({
  subjects,
  chapters,
  errorReasons,
  questions,
  initialFilters,
}: Props) {
  const [searchText, setSearchText] = useState(initialFilters.q || '');
  const [subjectFilter, setSubjectFilter] = useState(initialFilters.subject || 'all');
  const [chapterFilter, setChapterFilter] = useState(initialFilters.chapter || 'all');
  const [reasonFilter, setReasonFilter] = useState(initialFilters.reason || 'all');

  const subjectMap = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);
  const chapterMap = useMemo(() => new Map(chapters.map((c) => [c.id, c])), [chapters]);
  const reasonMap = useMemo(() => new Map(errorReasons.map((r) => [r.id, r])), [errorReasons]);

  // 当前科目下的章节
  const availableChapters = useMemo(() => {
    if (subjectFilter === 'all') return chapters;
    return chapters.filter((c) => c.subject_id === subjectFilter);
  }, [chapters, subjectFilter]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (subjectFilter !== 'all' && q.subject_id !== subjectFilter) return false;
      if (chapterFilter !== 'all' && q.chapter_id !== chapterFilter) return false;
      if (reasonFilter !== 'all' && !q.error_reason_ids.includes(reasonFilter)) return false;
      if (searchText.trim()) {
        const text = searchText.trim().toLowerCase();
        const haystack = `${q.title} ${q.analysis} ${q.notes} ${q.page_number || ''}`.toLowerCase();
        if (!haystack.includes(text)) return false;
      }
      return true;
    });
  }, [questions, subjectFilter, chapterFilter, reasonFilter, searchText]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
      {/* 搜索框 */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="搜索题目、解析、页码..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* 筛选器 */}
      <div className="grid grid-cols-3 gap-2">
        <Select
          value={subjectFilter}
          onChange={(e) => {
            setSubjectFilter(e.target.value);
            setChapterFilter('all');
          }}
        >
          <option value="all">全部科目</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>

        <Select value={chapterFilter} onChange={(e) => setChapterFilter(e.target.value)}>
          <option value="all">全部章节</option>
          {availableChapters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <Select value={reasonFilter} onChange={(e) => setReasonFilter(e.target.value)}>
          <option value="all">全部错因</option>
          {errorReasons.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
      </div>

      {/* 结果计数 */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-slate-400">共 {filteredQuestions.length} 道错题</p>
      </div>

      {/* 错题列表 */}
      {filteredQuestions.length === 0 ? (
        <Card>
          <EmptyState
            title={questions.length === 0 ? '还没有错题' : '没有符合条件的错题'}
            description={questions.length === 0 ? '点击右上方 + 录入第一道错题' : '试试调整筛选条件'}
            action={
              questions.length === 0 ? (
                <Link
                  href="/questions/new"
                  className="inline-flex items-center gap-1 px-3 h-8 rounded-lg bg-brand-600 text-white text-sm"
                >
                  <PlusIcon className="h-4 w-4" /> 录入错题
                </Link>
              ) : null
            }
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredQuestions.map((q) => {
            const subject = subjectMap.get(q.subject_id);
            const chapter = chapterMap.get(q.chapter_id);
            const reasons = (q.error_reason_ids || [])
              .map((id) => reasonMap.get(id))
              .filter(Boolean) as ErrorReason[];
            return (
              <Link key={q.id} href={`/questions/view?id=${q.id}`}>
                <Card className="hover:border-brand-300 transition-colors cursor-pointer">
                  <CardBody className="py-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm text-slate-900 line-clamp-2 flex-1">
                        {q.title || '(未填写题目文字，点击查看图片)'}
                      </p>
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {relativeTime(q.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {subject && <Tag color={subject.color}>{subject.name}</Tag>}
                      {chapter && (
                        <span className="text-xs text-slate-500 truncate max-w-[40%]">
                          {chapter.name}
                        </span>
                      )}
                      {q.page_number && (
                        <span className="text-xs text-slate-400">P{q.page_number}</span>
                      )}
                    </div>

                    {reasons.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap mt-1.5">
                        {reasons.map((r) => (
                          <Tag key={r.id} color={r.color}>
                            {r.name}
                          </Tag>
                        ))}
                      </div>
                    )}
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
