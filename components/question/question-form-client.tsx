'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Subject, Chapter, ErrorReason, Question } from '@/types';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Textarea, Select, Label, FieldError } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { CameraIcon, TrashIcon, AlertIcon } from '@/components/ui/icons';
import { uploadImage } from '@/lib/storage/upload';
import { recognizeImage, OcrProgress } from '@/lib/ocr/tesseract';
import { createInitialSrsState } from '@/lib/srs/sm2';
import { createClient } from '@/lib/supabase/client';

interface Props {
  subjects: Subject[];
  chapters: Chapter[];
  errorReasons: ErrorReason[];
  mode: 'create' | 'edit';
  question?: Question & { error_reason_ids?: string[] };
}

export function QuestionFormClient({
  subjects,
  chapters,
  errorReasons,
  mode,
  question,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 表单状态
  const [subjectId, setSubjectId] = useState(question?.subject_id || subjects[0]?.id || '');
  const [chapterId, setChapterId] = useState(question?.chapter_id || '');
  const [knowledgePointId, setKnowledgePointId] = useState(question?.knowledge_point_id || '');
  const [pageNumber, setPageNumber] = useState(question?.page_number || '');
  const [title, setTitle] = useState(question?.title || '');
  const [analysis, setAnalysis] = useState(question?.analysis || '');
  const [notes, setNotes] = useState(question?.notes || '');
  const [imageUrls, setImageUrls] = useState<string[]>(question?.image_urls || []);
  const [difficulty, setDifficulty] = useState(question?.difficulty || 3);
  const [selectedReasonIds, setSelectedReasonIds] = useState<string[]>(
    question?.error_reason_ids || []
  );

  // OCR 状态
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<OcrProgress | null>(null);
  const [ocrTarget, setOcrTarget] = useState<'title' | 'analysis'>('title');

  // 图片上传状态
  const [uploadingImage, setUploadingImage] = useState(false);

  // 章节知识点列表
  const [knowledgePoints, setKnowledgePoints] = useState<
    { id: string; content: string }[]
  >([]);

  // 当前科目下的章节
  const availableChapters = useMemo(() => {
    return chapters.filter((c) => c.subject_id === subjectId);
  }, [chapters, subjectId]);

  // 加载章节知识点
  useEffect(() => {
    if (!chapterId) {
      setKnowledgePoints([]);
      setKnowledgePointId('');
      return;
    }
    let mounted = true;
    supabase
      .from('chapter_knowledge_points')
      .select('id, content')
      .eq('chapter_id', chapterId)
      .order('sort_order')
      .then(({ data }) => {
        if (!mounted) return;
        setKnowledgePoints(data || []);
        // 如果当前知识点不在列表中，清空
        if (data && !data.find((k) => k.id === knowledgePointId)) {
          setKnowledgePointId('');
        }
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId, supabase]);

  // 切换科目时清空章节
  useEffect(() => {
    if (mode === 'create' && !availableChapters.find((c) => c.id === chapterId)) {
      setChapterId('');
    }
  }, [subjectId, availableChapters, chapterId, mode]);

  // 错因多选切换
  const toggleReason = (id: string) => {
    setSelectedReasonIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  // 图片选择处理
  const handleImageSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    forOcrTarget?: 'title' | 'analysis'
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImage(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const url = await uploadImage(file);
        urls.push(url);
      }
      setImageUrls((prev) => [...prev, ...urls]);

      // 如果指定了 OCR 目标，对第一张图执行 OCR
      if (forOcrTarget && urls.length > 0) {
        runOcr(urls[0], forOcrTarget);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '图片上传失败');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  // 执行 OCR
  const runOcr = async (imageUrl: string, target: 'title' | 'analysis') => {
    setOcrLoading(true);
    setOcrTarget(target);
    setOcrProgress({ status: '加载识别引擎', progress: 0 });
    try {
      const text = await recognizeImage(imageUrl, (p) => setOcrProgress(p));
      if (target === 'title') {
        setTitle((prev) => (prev ? prev + '\n' + text : text));
      } else {
        setAnalysis((prev) => (prev ? prev + '\n' + text : text));
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'OCR 失败');
    } finally {
      setOcrLoading(false);
      setOcrProgress(null);
    }
  };

  // 删除图片
  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // 表单校验
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!subjectId) newErrors.subjectId = '请选择科目';
    if (!chapterId) newErrors.chapterId = '请选择章节';
    if (selectedReasonIds.length === 0)
      newErrors.error_reasons = '请至少选择一个错因标签';
    if (!title.trim() && imageUrls.length === 0)
      newErrors.title = '请填写题目文字或上传题目图片';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交保存
  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const payload = {
        subject_id: subjectId,
        chapter_id: chapterId,
        knowledge_point_id: knowledgePointId || null,
        page_number: pageNumber.trim() || null,
        title: title.trim(),
        analysis: analysis.trim(),
        notes: notes.trim(),
        image_urls: imageUrls,
        difficulty,
        status: 'active',
      };

      let questionId: string;

      if (mode === 'create') {
        const srs = createInitialSrsState();
        const { data, error } = await supabase
          .from('questions')
          .insert({ ...payload, ...srs })
          .select('id')
          .single();

        if (error) throw error;
        questionId = data.id;
      } else {
        const { data, error } = await supabase
          .from('questions')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', question!.id)
          .select('id')
          .single();

        if (error) throw error;
        questionId = data.id;

        // 删除旧错因关联
        await supabase
          .from('question_error_reasons')
          .delete()
          .eq('question_id', questionId);
      }

      // 插入错因关联
      if (selectedReasonIds.length > 0) {
        const { error: qerError } = await supabase
          .from('question_error_reasons')
          .insert(
            selectedReasonIds.map((reason_id) => ({
              question_id: questionId,
              error_reason_id: reason_id,
            }))
          );
        if (qerError) throw qerError;
      }

      router.push(`/questions/view?id=${questionId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : '保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-32">
      {/* 基础信息 */}
      <Card>
        <CardHeader>
          <CardTitle>题目归属</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          <div>
            <Label required>科目</Label>
            <Select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              error={!!errors.subjectId}
              disabled={mode === 'edit'}
            >
              <option value="">请选择科目</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
            <FieldError>{errors.subjectId}</FieldError>
          </div>

          <div>
            <Label required>章节</Label>
            <Select
              value={chapterId}
              onChange={(e) => setChapterId(e.target.value)}
              error={!!errors.chapterId}
              disabled={!subjectId}
            >
              <option value="">请选择章节</option>
              {availableChapters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            {availableChapters.length === 0 && subjectId && (
              <p className="mt-1 text-xs text-slate-400">
                该科目还没有章节，请先到章节管理添加
              </p>
            )}
            <FieldError>{errors.chapterId}</FieldError>
          </div>

          {knowledgePoints.length > 0 && (
            <div>
              <Label>知识点（可选）</Label>
              <Select
                value={knowledgePointId}
                onChange={(e) => setKnowledgePointId(e.target.value)}
              >
                <option value="">不指定具体知识点</option>
                {knowledgePoints.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.content}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div>
            <Label>页码</Label>
            <Input
              placeholder="如 128 或 P128"
              value={pageNumber}
              onChange={(e) => setPageNumber(e.target.value)}
              inputMode="numeric"
            />
            <p className="mt-1 text-xs text-slate-400">题目来源页码，便于回溯</p>
          </div>
        </CardBody>
      </Card>

      {/* 题目与图片 */}
      <Card>
        <CardHeader>
          <CardTitle>题目内容</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          {/* 图片上传 */}
          <div>
            <Label>题目/解析图片</Label>
            <div className="grid grid-cols-3 gap-2">
              {imageUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`图片 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {/* 上传按钮 */}
              <label className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-brand-400 hover:text-brand-500 cursor-pointer transition-colors">
                <CameraIcon className="h-6 w-6 mb-1" />
                <span className="text-xs">
                  {uploadingImage ? '上传中...' : '拍照/上传'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  className="hidden"
                  onChange={(e) => handleImageSelect(e, 'title')}
                  disabled={uploadingImage}
                />
              </label>
            </div>
          </div>

          {/* OCR 进度提示 */}
          {ocrLoading && ocrProgress && (
            <div className="rounded-lg bg-brand-50 p-3 flex items-center gap-3">
              <div className="h-5 w-5 flex-shrink-0">
                <svg className="h-5 w-5 animate-spin text-brand-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-brand-700">
                  OCR 识别中 · {ocrTarget === 'title' ? '题目' : '解析'} · {ocrProgress.status}
                </p>
                <div className="mt-1 h-1.5 bg-brand-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 transition-all"
                    style={{ width: `${Math.round(ocrProgress.progress * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 题目文字 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label className="mb-0">题目文字</Label>
              {imageUrls.length > 0 && !ocrLoading && (
                <button
                  type="button"
                  onClick={() => runOcr(imageUrls[0], 'title')}
                  className="text-xs text-brand-600 hover:underline"
                >
                  从图片识别
                </button>
              )}
            </div>
            <Textarea
              placeholder="输入或通过 OCR 识别题目文字..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              rows={3}
              error={!!errors.title}
            />
            <FieldError>{errors.title}</FieldError>
          </div>

          {/* 解析文字 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label className="mb-0">解析</Label>
              {imageUrls.length > 0 && !ocrLoading && (
                <button
                  type="button"
                  onClick={() => runOcr(imageUrls[0], 'analysis')}
                  className="text-xs text-brand-600 hover:underline"
                >
                  从图片识别
                </button>
              )}
            </div>
            <Textarea
              placeholder="输入或通过 OCR 识别解析..."
              value={analysis}
              onChange={(e) => setAnalysis(e.target.value)}
              rows={4}
            />
          </div>

          {/* 个人笔记 */}
          <div>
            <Label>个人笔记</Label>
            <Textarea
              placeholder="记录心得、易错点提醒..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </CardBody>
      </Card>

      {/* 错因标签 */}
      <Card>
        <CardHeader>
          <CardTitle>错因标签</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="flex items-center gap-1.5 flex-wrap">
            {errorReasons.map((reason) => (
              <Chip
                key={reason.id}
                color={reason.color}
                selected={selectedReasonIds.includes(reason.id)}
                onClick={() => toggleReason(reason.id)}
              >
                {reason.name}
              </Chip>
            ))}
          </div>
          {errors.error_reasons && (
            <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
              <AlertIcon className="h-3 w-3" />
              {errors.error_reasons}
            </p>
          )}
          <p className="mt-2 text-xs text-slate-400">
            可多选，至少选择 1 个错因标签（用于章节错因统计分析）
          </p>
        </CardBody>
      </Card>

      {/* 难度 */}
      <Card>
        <CardHeader>
          <CardTitle>难度</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setDifficulty(star)}
                className={`text-2xl transition-colors ${
                  star <= difficulty ? 'text-yellow-400' : 'text-slate-300'
                }`}
              >
                ★
              </button>
            ))}
            <span className="ml-2 text-sm text-slate-500">{difficulty} 星</span>
          </div>
        </CardBody>
      </Card>

      {/* 底部操作栏（移动端固定） */}
      <div className="fixed bottom-16 md:bottom-4 left-0 right-0 md:left-56 px-4 py-3 bg-white/90 backdrop-blur border-t border-slate-100 z-20">
        <div className="max-w-2xl mx-auto flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
            disabled={loading}
          >
            取消
          </Button>
          <Button
            className="flex-[2]"
            onClick={handleSubmit}
            loading={loading}
          >
            {mode === 'create' ? '保存错题' : '保存修改'}
          </Button>
        </div>
      </div>
    </div>
  );
}
