'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Subject, Chapter, ChapterKnowledgePoint, ErrorReason, Question } from '@/types';
import { Card, CardBody } from '@/components/ui/card';
import { Tag } from '@/components/ui/chip';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty';
import { ChevronLeftIcon, ChevronRightIcon, CameraIcon } from '@/components/ui/icons';
import { createClient } from '@/lib/supabase/client';
import { calculateNextReview } from '@/lib/srs/sm2';

interface Props {
  questions: (Question & {
    subject?: Subject;
    chapter?: Chapter;
    knowledge_point?: ChapterKnowledgePoint | null;
    error_reasons?: ErrorReason[];
  })[];
}

export function ReviewClient({ questions: initialQuestions }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [questions, setQuestions] = useState(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const current = questions[currentIndex];
  const total = questions.length;

  if (currentIndex >= total) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <EmptyState
          title="复习完成 🎉"
          description={`本次共复习 ${total} 道错题，继续保持！`}
          action={
            <Button onClick={() => router.push('/')}>返回首页</Button>
          }
        />
      </div>
    );
  }

  const handleReview = async (result: 'again' | 'hard' | 'good' | 'easy') => {
    setSubmitting(true);
    try {
      const srs = calculateNextReview(
        {
          ease_factor: Number(current.ease_factor),
          interval_days: current.interval_days,
          review_count: current.review_count,
        },
        result
      );

      await Promise.all([
        supabase.from('questions').update(srs).eq('id', current.id),
        supabase.from('reviews').insert({
          question_id: current.id,
          result,
        }),
      ]);

      // 移除当前题，进入下一题
      setQuestions((prev) => prev.filter((_, i) => i !== currentIndex));
      setFlipped(false);
    } catch (err) {
      alert('复习记录失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      {/* 进度 */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">
          第 {currentIndex + 1} / {total} 题
        </span>
        <div className="flex-1 mx-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 transition-all"
            style={{ width: `${((currentIndex) / total) * 100}%` }}
          />
        </div>
        <span className="text-xs text-slate-400">{Math.round((currentIndex / total) * 100)}%</span>
      </div>

      {/* 翻转卡片 */}
      <div className="flip-card" onClick={() => setFlipped(!flipped)}>
        <div className={`flip-card-inner ${flipped ? 'flipped' : ''}`}>
          {/* 正面：题目 */}
          <Card className="flip-card-front min-h-[300px]">
            <CardBody className="flex flex-col h-full">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                {current.subject && <Tag color={current.subject.color}>{current.subject.name}</Tag>}
                {current.chapter && <span className="text-xs text-slate-500">{current.chapter.name}</span>}
                {current.page_number && <span className="text-xs text-slate-400">P{current.page_number}</span>}
                <div className="text-yellow-400 text-xs ml-auto">
                  {'★'.repeat(current.difficulty)}
                </div>
              </div>

              {current.image_urls && current.image_urls.length > 0 ? (
                <div className="flex-1 grid grid-cols-2 gap-2 mb-3">
                  {current.image_urls.map((url, i) => (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      key={i}
                      src={url}
                      alt={`图片 ${i + 1}`}
                      className="w-full rounded-lg border border-slate-200 object-contain max-h-48"
                    />
                  ))}
                </div>
              ) : null}

              <p className="text-sm text-slate-800 whitespace-pre-wrap flex-1">
                {current.title || '(无题目文字，请看图片)'}
              </p>

              <p className="mt-3 text-center text-xs text-slate-400">点击卡片查看解析 →</p>
            </CardBody>
          </Card>

          {/* 背面：解析 */}
          <Card className="flip-card-back min-h-[300px]">
            <CardBody className="flex flex-col h-full">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                {current.error_reasons && current.error_reasons.map((r) => (
                  <Tag key={r.id} color={r.color}>{r.name}</Tag>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto">
                <p className="text-xs font-semibold text-slate-400 mb-1">解析</p>
                <p className="text-sm text-slate-800 whitespace-pre-wrap mb-3">
                  {current.analysis || '(无解析)'}
                </p>

                {current.notes && (
                  <>
                    <p className="text-xs font-semibold text-slate-400 mb-1">笔记</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{current.notes}</p>
                  </>
                )}
              </div>

              <p className="mt-3 text-center text-xs text-slate-400">← 点击返回题目</p>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* 四档反馈 */}
      <div className="grid grid-cols-4 gap-2">
        <Button
          variant="danger"
          onClick={() => handleReview('again')}
          disabled={submitting}
        >
          忘记<br /><span className="text-xs opacity-75">1天</span>
        </Button>
        <Button
          variant="secondary"
          onClick={() => handleReview('hard')}
          disabled={submitting}
        >
          困难<br /><span className="text-xs opacity-75">3天</span>
        </Button>
        <Button
          variant="secondary"
          onClick={() => handleReview('good')}
          disabled={submitting}
        >
          记得<br /><span className="text-xs opacity-75">6天+</span>
        </Button>
        <Button
          onClick={() => handleReview('easy')}
          disabled={submitting}
        >
          熟练<br /><span className="text-xs opacity-75">更长</span>
        </Button>
      </div>
    </div>
  );
}
