'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Subject, Chapter } from '@/types';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty';
import { PlusIcon, EditIcon, TrashIcon, ChevronRightIcon } from '@/components/ui/icons';
import { createClient } from '@/lib/supabase/client';

interface Props {
  subjects: Subject[];
  chapters: Chapter[];
  chapterQuestionCounts: Record<string, number>;
}

export function ChaptersListClient({ subjects, chapters, chapterQuestionCounts }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [form, setForm] = useState({ name: '', subject_id: '', sort_order: 0 });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const openCreate = (subjectId?: string) => {
    setEditingChapter(null);
    setForm({
      name: '',
      subject_id: subjectId || subjects[0]?.id || '',
      sort_order: chapters.length,
    });
    setModalOpen(true);
  };

  const openEdit = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setForm({
      name: chapter.name,
      subject_id: chapter.subject_id,
      sort_order: chapter.sort_order,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.subject_id) return;
    setSaving(true);
    try {
      if (editingChapter) {
        await supabase
          .from('chapters')
          .update({ name: form.name.trim(), subject_id: form.subject_id, sort_order: form.sort_order })
          .eq('id', editingChapter.id);
      } else {
        await supabase.from('chapters').insert({
          name: form.name.trim(),
          subject_id: form.subject_id,
          sort_order: form.sort_order,
        });
      }
      setModalOpen(false);
      window.location.reload();
    } catch (err) {
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const count = chapterQuestionCounts[id] || 0;
    if (count > 0) {
      alert(`该章节下还有 ${count} 道错题，请先迁移或删除错题后再删除章节。`);
      return;
    }
    if (!confirm('确定删除该章节？相关知识点也会一并删除。')) return;
    setDeleting(id);
    try {
      await supabase.from('chapters').delete().eq('id', id);
      window.location.reload();
    } catch (err) {
      alert('删除失败');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      {subjects.map((subject) => {
        const subjectChapters = chapters.filter((c) => c.subject_id === subject.id);
        return (
          <section key={subject.id}>
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: subject.color }}
                />
                <h2 className="text-sm font-semibold text-slate-700">{subject.name}</h2>
                <span className="text-xs text-slate-400">({subjectChapters.length} 章)</span>
              </div>
              <button
                onClick={() => openCreate(subject.id)}
                className="text-xs text-brand-600 hover:underline flex items-center gap-0.5"
              >
                <PlusIcon className="h-3.5 w-3.5" /> 添加章节
              </button>
            </div>

            {subjectChapters.length === 0 ? (
              <Card>
                <EmptyState
                  className="py-6"
                  title="还没有章节"
                  description="点击上方添加章节"
                />
              </Card>
            ) : (
              <div className="space-y-1.5">
                {subjectChapters.map((chapter) => (
                  <Card key={chapter.id} className="hover:border-brand-300 transition-colors">
                    <CardBody className="py-2.5 flex items-center gap-2">
                      <Link
                        href={`/chapters/view?id=${chapter.id}`}
                        className="flex-1 flex items-center justify-between min-w-0"
                      >
                        <div className="min-w-0">
                          <p className="text-sm text-slate-900 truncate">{chapter.name}</p>
                          <p className="text-xs text-slate-400">
                            {chapterQuestionCounts[chapter.id] || 0} 道错题
                          </p>
                        </div>
                        <ChevronRightIcon className="h-4 w-4 text-slate-300 flex-shrink-0" />
                      </Link>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => openEdit(chapter)}
                          className="p-1.5 rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        >
                          <EditIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(chapter.id)}
                          disabled={deleting === chapter.id}
                          className="p-1.5 rounded text-slate-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </section>
        );
      })}

      {/* 新增/编辑弹窗 */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingChapter ? '编辑章节' : '新增章节'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>取消</Button>
            <Button onClick={handleSave} loading={saving}>保存</Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <Label required>所属科目</Label>
            <select
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
              value={form.subject_id}
              onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label required>章节名称</Label>
            <Input
              placeholder="如：第3章 中值定理与导数应用"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <Label>排序</Label>
            <Input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
