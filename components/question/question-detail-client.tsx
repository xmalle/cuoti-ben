'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Subject, Chapter, ChapterKnowledgePoint, ErrorReason, Question, Review } from '@/types';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag } from '@/components/ui/chip';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { EditIcon, TrashIcon, ChevronLeftIcon, CameraIcon } from '@/components/ui/icons';
import { formatDate, formatDateTime, relativeTime, isOverdue } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { calculateNextReview } from '@/lib/srs/sm2';
import { QuestionFormClient } from './question-form-client';

interface Props {
  question: Question & {
    subject?: Subject;
    chapter?: Chapter;
    knowledge_point?: ChapterKnowledgePoint | null;
    error_reasons?: ErrorReason[];
    error_reason_ids: string[];
  };
  reviews: Review[];
}

export function QuestionDetailClient({ question, reviews }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  // 编辑模式时加载完整元数据
  const [editMeta, setEditMeta] = useState<{
    subjects: Subject[];
    chapters: Chapter[];
    errorReasons: ErrorReason[];
  } | null>(null);

  useEffect(() => {
    if (!editing) return;
    (async () => {
      const [{ data: subjects }, { data: chapters }, { data: errorReasons }] = await Promise.all([
        supabase.from('subjects').select('*').order('sort_order'),
        supabase.from('chapters').select('*').order('sort_order'),
        supabase.from('error_reasons').select('*').order('sort_order'),
      ]);
      setEditMeta({
        subjects: subjects || [],
        chapters: chapters || [],
        errorReasons: errorReasons || [],
      });
    })();
  }, [editing, supabase]);

  // 快速复习（四档反馈）
  const quickReview = async (result: 'again' | 'hard' | 'good' | 'easy') => {
    setReviewing(true);
    try {
      const srs = calculateNextReview(
        {
          ease_factor: Number(question.ease_factor),
          interval_days: question.interval_days,
          review_count: question.review_count,
        },
        result
      );

      await Promise.all([
        supabase.from('questions').update(srs).eq('id', question.id),
        supabase.from('reviews').insert({
          question_id: question.id,
          result,
        }),
      ]);

      // 静态导出下用完整刷新更新数据
      window.location.reload();
    } catch (err) {
      alert('复习记录失败');
    } finally {
      setReviewing(false);
    }
  };

  // 删除错题
  const handleDelete = async () => {
    try {
      const { error } = await supabase.from('questions').delete().eq('id', question.id);
      if (error) throw error;
      router.push('/questions');
    } catch (err) {
      alert('删除失败');
    }
  };

  if (editing) {
    if (!editMeta) {
      return (
        <div className="max-w-2xl mx-auto px-4 py-6 text-center text-sm text-slate-400">加载中...</div>
      );
    }
    return (
      <QuestionFormClient
        subjects={editMeta.subjects}
        chapters={editMeta.chapters}
        errorReasons={editMeta.errorReasons}
        mode="edit"
        question={question}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between">
        <Link
          href="/questions"
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          返回列表
        </Link>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
            <EditIcon className="h-4 w-4" />
            编辑
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleting(true)}>
            <TrashIcon className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>

      {/* 归属信息 */}
      <Card>
        <CardBody className="flex items-center gap-2 flex-wrap">
          {question.subject && (
            <Tag color={question.subject.color}>{question.subject.name}</Tag>
          )}
          {question.chapter && (
            <span className="text-sm text-slate-600">{question.chapter.name}</span>
          )}
          {question.knowledge_point && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-sm text-slate-500">{question.knowledge_point.content}</span>
            </>
          )}
          {question.page_number && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-sm text-slate-400">第 {question.page_number} 页</span>
            </>
          )}
        </CardBody>
      </Card>

      {/* 错因标签 */}
      {question.error_reasons && question.error_reasons.length > 0 && (
        <Card>
          <CardBody>
            <p className="text-xs text-slate-400 mb-2">错因标签</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {question.error_reasons.map((r) => (
                <Tag key={r.id} color={r.color}>
                  {r.name}
                </Tag>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* 题目图片 */}
      {question.image_urls && question.image_urls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>题目图片</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-2">
              {question.image_urls.map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block aspect-square rounded-lg overflow-hidden border border-slate-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`图片 ${index + 1}`} className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* 题目文字 */}
      {question.title && (
        <Card>
          <CardHeader>
            <CardTitle>题目</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{question.title}</p>
          </CardBody>
        </Card>
      )}

      {/* 解析 */}
      {question.analysis && (
        <Card>
          <CardHeader>
            <CardTitle>解析</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{question.analysis}</p>
          </CardBody>
        </Card>
      )}

      {/* 个人笔记 */}
      {question.notes && (
        <Card>
          <CardHeader>
            <CardTitle>笔记</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{question.notes}</p>
          </CardBody>
        </Card>
      )}

      {/* 间隔重复信息 */}
      <Card>
        <CardHeader>
          <CardTitle>复习信息</CardTitle>
        </CardHeader>
        <CardBody className="space-y-2">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-400 text-xs">难度</p>
              <p className="text-yellow-500">{'★'.repeat(question.difficulty)}{'☆'.repeat(5 - question.difficulty)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">已复习</p>
              <p className="text-slate-700">{question.review_count} 次</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">难度系数</p>
              <p className="text-slate-700">{Number(question.ease_factor).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">当前间隔</p>
              <p className="text-slate-700">{question.interval_days} 天</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">上次复习</p>
              <p className="text-slate-700">{relativeTime(question.last_reviewed_at)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">下次复习</p>
              <p className={isOverdue(question.next_review_at) ? 'text-red-500' : 'text-slate-700'}>
                {formatDate(question.next_review_at)}
                {isOverdue(question.next_review_at) && ' (已逾期)'}
              </p>
            </div>
          </div>

          {/* 快速复习按钮 */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            <Button
              variant="danger"
              size="sm"
              onClick={() => quickReview('again')}
              disabled={reviewing}
            >
              忘记
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => quickReview('hard')}
              disabled={reviewing}
            >
              困难
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => quickReview('good')}
              disabled={reviewing}
            >
              记得
            </Button>
            <Button
              size="sm"
              onClick={() => quickReview('easy')}
              disabled={reviewing}
            >
              熟练
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* 复习历史 */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>复习记录</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {reviews.map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{formatDateTime(r.reviewed_at)}</span>
                  <Tag
                    color={
                      r.result === 'again' ? '#ef4444'
                      : r.result === 'hard' ? '#f97316'
                      : r.result === 'good' ? '#22c55e'
                      : '#3b82f6'
                    }
                  >
                    {r.result === 'again' ? '忘记'
                      : r.result === 'hard' ? '困难'
                      : r.result === 'good' ? '记得'
                      : '熟练'}
                  </Tag>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* 删除确认弹窗 */}
      <Modal
        open={deleting}
        onClose={() => setDeleting(false)}
        title="确认删除"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleting(false)}>
              取消
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              确认删除
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          删除后无法恢复，确定要删除这道错题吗？相关图片和复习记录也会一并删除。
        </p>
      </Modal>
    </div>
  );
}
