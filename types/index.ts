// ============ 数据库实体类型 ============

export interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface Chapter {
  id: string;
  subject_id: string;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ChapterKnowledgePoint {
  id: string;
  chapter_id: string;
  content: string;
  sort_order: number;
  created_at: string;
}

export interface Question {
  id: string;
  subject_id: string;
  chapter_id: string;
  knowledge_point_id: string | null;
  page_number: string | null;
  title: string;
  analysis: string;
  notes: string;
  image_urls: string[];
  difficulty: number; // 1-5
  status: 'active' | 'archived';
  // 间隔重复字段
  next_review_at: string;
  review_count: number;
  ease_factor: number;
  interval_days: number;
  last_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ErrorReason {
  id: string;
  name: string;
  is_preset: boolean;
  color: string;
  sort_order: number;
  created_at: string;
}

export interface QuestionErrorReason {
  question_id: string;
  error_reason_id: string;
}

export interface Review {
  id: string;
  question_id: string;
  reviewed_at: string;
  result: 'again' | 'hard' | 'good' | 'easy';
  time_spent_seconds: number | null;
}

// ============ 关联查询扩展类型 ============

export interface QuestionWithRelations extends Question {
  subject?: Subject;
  chapter?: Chapter;
  knowledge_point?: ChapterKnowledgePoint | null;
  error_reasons?: ErrorReason[];
}

export interface ChapterWithStats extends Chapter {
  subject?: Subject;
  knowledge_points?: ChapterKnowledgePoint[];
  question_count?: number;
}

// ============ 表单/业务类型 ============

export interface QuestionFormData {
  subject_id: string;
  chapter_id: string;
  knowledge_point_id: string | null;
  page_number: string;
  title: string;
  analysis: string;
  notes: string;
  image_urls: string[];
  difficulty: number;
  error_reason_ids: string[];
}

// 预设错因标签配置（与数据库预设数据对应）
export const PRESET_ERROR_REASONS = [
  { name: '计算错误', color: '#ef4444' },
  { name: '概念未理解', color: '#f97316' },
  { name: '知识点遗忘', color: '#eab308' },
  { name: '知识点记忆错误', color: '#84cc16' },
  { name: '方法不会', color: '#06b6d4' },
  { name: '审题失误', color: '#3b82f6' },
  { name: '粗心马虎', color: '#a855f7' },
] as const;

// 错因颜色映射（用于图表）
export const ERROR_REASON_COLORS: Record<string, string> = {
  计算错误: '#ef4444',
  概念未理解: '#f97316',
  知识点遗忘: '#eab308',
  知识点记忆错误: '#84cc16',
  方法不会: '#06b6d4',
  审题失误: '#3b82f6',
  粗心马虎: '#a855f7',
};

// SM-2 复习反馈
export type ReviewResult = 'again' | 'hard' | 'good' | 'easy';

// 统计报告数据结构
export interface ChapterErrorStats {
  chapter_id: string;
  chapter_name: string;
  subject_id: string;
  subject_name: string;
  subject_color: string;
  total_questions: number;
  by_reason: {
    reason_id: string;
    reason_name: string;
    color: string;
    frequency: number;
    percentage: number;
  }[];
}
