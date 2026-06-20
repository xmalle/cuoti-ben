'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Chapter, ChapterKnowledgePoint, Subject } from '@/types';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty';
import { ChevronLeftIcon, PlusIcon, EditIcon, TrashIcon } from '@/components/ui/icons';
import { createClient } from '@/lib/supabase/client';

interface Props {
  chapter: Chapter & { subject?: Subject };
  knowledgePoints: ChapterKnowledgePoint[];
  questionCount: number;
}

export function ChapterDetailClient({ chapter, knowledgePoints: initialKps, questionCount }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [knowledgePoints, setKnowledgePoints] = useState(initialKps);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingKp, setEditingKp] = useState<ChapterKnowledgePoint | null>(null);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditingKp(null);
    setContent('');
    setModalOpen(true);
  };

  const openEdit = (kp: ChapterKnowledgePoint) => {
    setEditingKp(kp);
    setContent(kp.content);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      if (editingKp) {
        const { data } = await supabase
          .from('chapter_knowledge_points')
          .update({ content: content.trim() })
          .eq('id', editingKp.id)
          .select()
          .single();
        if (data) {
          setKnowledgePoints((prev) => prev.map((k) => (k.id === data.id ? data : k)));
        }
      } else {
        const { data } = await supabase
          .from('chapter_knowledge_points')
          .insert({
            chapter_id: chapter.id,
            content: content.trim(),
            sort_order: knowledgePoints.length,
          })
          .select()
          .single();
        if (data) {
          setKnowledgePoints((prev) => [...prev, data]);
        }
      }
      setModalOpen(false);
    } catch (err) {
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该知识点？')) return;
    try {
      await supabase.from('chapter_knowledge_points').delete().eq('id', id);
      setKnowledgePoints((prev) => prev.filter((k) => k.id !== id));
    } catch (err) {
      alert('删除失败');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      {/* 返回 + 标题 */}
      <div>
        <Link href="/chapters" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ChevronLeftIcon className="h-4 w-4" />
          章节管理
        </Link>
      </div>

      <Card>
        <CardBody>
          <div className="flex items-center gap-2 mb-1">
            {chapter.subject && (
              <span
                className="px-2 py-0.5 rounded text-xs text-white"
                style={{ backgroundColor: chapter.subject.color }}
              >
                {chapter.subject.name}
              </span>
            )}
          </div>
          <h1 className="text-lg font-semibold text-slate-900">{chapter.name}</h1>
          <p className="text-xs text-slate-400 mt-1">{questionCount} 道错题</p>
        </CardBody>
      </Card>

      {/* 知识点列表 */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>章节知识点</CardTitle>
          <Button size="sm" variant="outline" onClick={openCreate}>
            <PlusIcon className="h-4 w-4" /> 添加
          </Button>
        </CardHeader>
        <CardBody>
          {knowledgePoints.length === 0 ? (
            <EmptyState
              className="py-6"
              title="还没有知识点"
              description="自定义填写本章节涉及的知识点，便于错题关联与归类"
            />
          ) : (
            <div className="space-y-2">
              {knowledgePoints.map((kp, index) => (
                <div
                  key={kp.id}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 hover:border-slate-200"
                >
                  <span className="h-5 w-5 rounded-full bg-slate-100 text-slate-500 text-xs flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>
                  <p className="flex-1 text-sm text-slate-700">{kp.content}</p>
                  <button
                    onClick={() => openEdit(kp)}
                    className="p-1 rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <EditIcon className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(kp.id)}
                    className="p-1 rounded text-slate-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-xs text-slate-400">
            知识点由你自定义填写，用于错题关联。例如：「罗尔定理」「拉格朗日中值定理」「柯西中值定理」
          </p>
        </CardBody>
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingKp ? '编辑知识点' : '添加知识点'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>取消</Button>
            <Button onClick={handleSave} loading={saving}>保存</Button>
          </>
        }
      >
        <div>
          <Label required>知识点内容</Label>
          <Input
            placeholder="如：罗尔定理"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
          />
        </div>
      </Modal>
    </div>
  );
}
