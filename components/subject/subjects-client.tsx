'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Subject } from '@/types';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty';
import { PlusIcon, EditIcon, TrashIcon } from '@/components/ui/icons';
import { createClient } from '@/lib/supabase/client';

interface Props {
  subjects: Subject[];
  chapterCounts: Record<string, number>;
  questionCounts: Record<string, number>;
}

const PRESET_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
];

export function SubjectsClient({ subjects, chapterCounts, questionCounts }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [form, setForm] = useState({ name: '', color: PRESET_COLORS[0], icon: '', sort_order: 0 });
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', color: PRESET_COLORS[subjects.length % PRESET_COLORS.length], icon: '', sort_order: subjects.length });
    setModalOpen(true);
  };

  const openEdit = (s: Subject) => {
    setEditing(s);
    setForm({ name: s.name, color: s.color, icon: s.icon || '', sort_order: s.sort_order });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await supabase
          .from('subjects')
          .update({ name: form.name.trim(), color: form.color, icon: form.icon || null, sort_order: form.sort_order })
          .eq('id', editing.id);
      } else {
        await supabase.from('subjects').insert({
          name: form.name.trim(),
          color: form.color,
          icon: form.icon || null,
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

  const handleDelete = async (s: Subject) => {
    const qCount = questionCounts[s.id] || 0;
    const cCount = chapterCounts[s.id] || 0;
    if (qCount > 0 || cCount > 0) {
      alert(`该科目下还有 ${cCount} 个章节、${qCount} 道错题，请先清空相关数据。`);
      return;
    }
    if (!confirm('确定删除该科目？')) return;
    try {
      await supabase.from('subjects').delete().eq('id', s.id);
      window.location.reload();
    } catch (err) {
      alert('删除失败');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-slate-500">共 {subjects.length} 个科目</p>
        <Button size="sm" onClick={openCreate}>
          <PlusIcon className="h-4 w-4" /> 添加科目
        </Button>
      </div>

      {subjects.length === 0 ? (
        <Card>
          <EmptyState
            title="还没有科目"
            description="添加你的考研科目（如：数学、专业课）"
            action={<Button onClick={openCreate}>添加第一个科目</Button>}
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {subjects.map((s) => (
            <Card key={s.id}>
              <CardBody className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ backgroundColor: s.color }}
                >
                  {s.name.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900">{s.name}</p>
                  <p className="text-xs text-slate-400">
                    {chapterCounts[s.id] || 0} 章节 · {questionCounts[s.id] || 0} 道错题
                  </p>
                </div>
                <button
                  onClick={() => openEdit(s)}
                  className="p-1.5 rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <EditIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(s)}
                  className="p-1.5 rounded text-slate-400 hover:bg-red-50 hover:text-red-500"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? '编辑科目' : '新增科目'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>取消</Button>
            <Button onClick={handleSave} loading={saving}>保存</Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <Label required>科目名称</Label>
            <Input
              placeholder="如：数学、专业课"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
            />
          </div>
          <div>
            <Label>颜色</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className="h-8 w-8 rounded-lg transition-transform"
                  style={{
                    backgroundColor: color,
                    transform: form.color === color ? 'scale(1.15)' : 'scale(1)',
                    boxShadow: form.color === color ? `0 0 0 2px white, 0 0 0 4px ${color}` : 'none',
                  }}
                />
              ))}
            </div>
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
