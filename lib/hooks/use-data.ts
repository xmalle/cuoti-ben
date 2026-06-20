'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type {
  Subject,
  Chapter,
  ChapterKnowledgePoint,
  ErrorReason,
  Question,
  Review,
  ChapterErrorStats,
} from '@/types';

/**
 * 统一的客户端数据加载 hook
 * 静态导出后，所有数据都在浏览器端通过 Supabase 直接获取
 */

const supabase = createClient();

// 加载首页仪表盘数据
export function useDashboardData() {
  const [data, setData] = useState<{
    subjects: Subject[];
    chapters: Chapter[];
    dueQuestions: any[];
    recentQuestions: any[];
    loading: boolean;
  }>({ subjects: [], chapters: [], dueQuestions: [], recentQuestions: [], loading: true });

  useEffect(() => {
    (async () => {
      try {
        const [{ data: subjects }, { data: chapters }, { data: dueQuestions }, { data: recentQuestions }] =
          await Promise.all([
            supabase.from('subjects').select('*').order('sort_order'),
            supabase.from('chapters').select('*').order('sort_order'),
            supabase
              .from('questions')
              .select('id, title, chapter_id, subject_id, next_review_at, difficulty')
              .eq('status', 'active')
              .lte('next_review_at', new Date().toISOString())
              .order('next_review_at', { ascending: true }),
            supabase
              .from('questions')
              .select('id, title, created_at, chapter_id, subject_id')
              .order('created_at', { ascending: false })
              .limit(5),
          ]);

        setData({
          subjects: subjects || [],
          chapters: chapters || [],
          dueQuestions: dueQuestions || [],
          recentQuestions: recentQuestions || [],
          loading: false,
        });
      } catch {
        setData({ subjects: [], chapters: [], dueQuestions: [], recentQuestions: [], loading: false });
      }
    })();
  }, []);

  return data;
}

// 加载错题列表数据
export function useQuestionsData() {
  const [data, setData] = useState<{
    subjects: Subject[];
    chapters: Chapter[];
    errorReasons: ErrorReason[];
    questions: any[];
    loading: boolean;
  }>({ subjects: [], chapters: [], errorReasons: [], questions: [], loading: true });

  useEffect(() => {
    (async () => {
      try {
        const [{ data: subjects }, { data: chapters }, { data: errorReasons }, { data: questions }] =
          await Promise.all([
            supabase.from('subjects').select('*').order('sort_order'),
            supabase.from('chapters').select('*').order('sort_order'),
            supabase.from('error_reasons').select('*').order('sort_order'),
            supabase
              .from('questions')
              .select('*, chapter:chapters(*), subject:subjects(*), knowledge_point:chapter_knowledge_points(*)')
              .order('created_at', { ascending: false }),
          ]);

        const questionIds = (questions || []).map((q) => q.id);
        let questionErrorMap: Record<string, string[]> = {};
        if (questionIds.length > 0) {
          const { data: qer } = await supabase
            .from('question_error_reasons')
            .select('question_id, error_reason_id')
            .in('question_id', questionIds);
          questionErrorMap = (qer || []).reduce((acc, item) => {
            if (!acc[item.question_id]) acc[item.question_id] = [];
            acc[item.question_id].push(item.error_reason_id);
            return acc;
          }, {} as Record<string, string[]>);
        }

        const errorReasonMap = new Map((errorReasons || []).map((r) => [r.id, r]));
        const questionsWithReasons = (questions || []).map((q) => ({
          ...q,
          error_reason_ids: questionErrorMap[q.id] || [],
          error_reasons: (questionErrorMap[q.id] || [])
            .map((id) => errorReasonMap.get(id))
            .filter(Boolean),
        }));

        setData({
          subjects: subjects || [],
          chapters: chapters || [],
          errorReasons: errorReasons || [],
          questions: questionsWithReasons,
          loading: false,
        });
      } catch {
        setData({ subjects: [], chapters: [], errorReasons: [], questions: [], loading: false });
      }
    })();
  }, []);

  return data;
}

// 加载单道错题详情
export function useQuestionDetail(id: string | null) {
  const [data, setData] = useState<{
    question: any;
    reviews: Review[];
    loading: boolean;
    notFound: boolean;
  }>({ question: null, reviews: [], loading: true, notFound: false });

  useEffect(() => {
    if (!id) {
      setData({ question: null, reviews: [], loading: false, notFound: true });
      return;
    }
    (async () => {
      try {
        const { data: question, error } = await supabase
          .from('questions')
          .select('*, subject:subjects(*), chapter:chapters(*), knowledge_point:chapter_knowledge_points(*)')
          .eq('id', id)
          .single();

        if (error || !question) {
          setData({ question: null, reviews: [], loading: false, notFound: true });
          return;
        }

        const [{ data: qer }, { data: reviews }] = await Promise.all([
          supabase.from('question_error_reasons').select('error_reason_id, error_reasons(*)').eq('question_id', id),
          supabase.from('reviews').select('*').eq('question_id', id).order('reviewed_at', { ascending: false }).limit(10),
        ]);

        const errorReasons = (qer || []).map((item: any) => item.error_reasons).filter(Boolean);
        setData({
          question: {
            ...question,
            error_reasons: errorReasons,
            error_reason_ids: (qer || []).map((q: any) => q.error_reason_id),
          },
          reviews: reviews || [],
          loading: false,
          notFound: false,
        });
      } catch {
        setData({ question: null, reviews: [], loading: false, notFound: true });
      }
    })();
  }, [id]);

  return data;
}

// 加载新增错题所需的元数据
export function useQuestionFormData() {
  const [data, setData] = useState<{
    subjects: Subject[];
    chapters: Chapter[];
    errorReasons: ErrorReason[];
    loading: boolean;
  }>({ subjects: [], chapters: [], errorReasons: [], loading: true });

  useEffect(() => {
    (async () => {
      const [{ data: subjects }, { data: chapters }, { data: errorReasons }] = await Promise.all([
        supabase.from('subjects').select('*').order('sort_order'),
        supabase.from('chapters').select('*').order('sort_order'),
        supabase.from('error_reasons').select('*').order('sort_order'),
      ]);
      setData({
        subjects: subjects || [],
        chapters: chapters || [],
        errorReasons: errorReasons || [],
        loading: false,
      });
    })();
  }, []);

  return data;
}

// 加载章节列表
export function useChaptersData() {
  const [data, setData] = useState<{
    subjects: Subject[];
    chapters: Chapter[];
    chapterQuestionCounts: Record<string, number>;
    loading: boolean;
  }>({ subjects: [], chapters: [], chapterQuestionCounts: {}, loading: true });

  useEffect(() => {
    (async () => {
      const [{ data: subjects }, { data: chapters }, { data: questions }] = await Promise.all([
        supabase.from('subjects').select('*').order('sort_order'),
        supabase.from('chapters').select('*').order('sort_order'),
        supabase.from('questions').select('chapter_id'),
      ]);
      const countMap: Record<string, number> = {};
      (questions || []).forEach((q) => {
        countMap[q.chapter_id] = (countMap[q.chapter_id] || 0) + 1;
      });
      setData({
        subjects: subjects || [],
        chapters: chapters || [],
        chapterQuestionCounts: countMap,
        loading: false,
      });
    })();
  }, []);

  return data;
}

// 加载单个章节详情
export function useChapterDetail(id: string | null) {
  const [data, setData] = useState<{
    chapter: any;
    knowledgePoints: ChapterKnowledgePoint[];
    questionCount: number;
    loading: boolean;
    notFound: boolean;
  }>({ chapter: null, knowledgePoints: [], questionCount: 0, loading: true, notFound: false });

  useEffect(() => {
    if (!id) {
      setData({ chapter: null, knowledgePoints: [], questionCount: 0, loading: false, notFound: true });
      return;
    }
    (async () => {
      try {
        const { data: chapter, error } = await supabase
          .from('chapters')
          .select('*, subject:subjects(*)')
          .eq('id', id)
          .single();

        if (error || !chapter) {
          setData({ chapter: null, knowledgePoints: [], questionCount: 0, loading: false, notFound: true });
          return;
        }

        const [{ data: knowledgePoints }, { count }] = await Promise.all([
          supabase.from('chapter_knowledge_points').select('*').eq('chapter_id', id).order('sort_order'),
          supabase.from('questions').select('*', { count: 'exact', head: true }).eq('chapter_id', id),
        ]);

        setData({
          chapter,
          knowledgePoints: knowledgePoints || [],
          questionCount: count || 0,
          loading: false,
          notFound: false,
        });
      } catch {
        setData({ chapter: null, knowledgePoints: [], questionCount: 0, loading: false, notFound: true });
      }
    })();
  }, [id]);

  return data;
}

// 加载科目管理数据
export function useSubjectsData() {
  const [data, setData] = useState<{
    subjects: Subject[];
    chapterCounts: Record<string, number>;
    questionCounts: Record<string, number>;
    loading: boolean;
  }>({ subjects: [], chapterCounts: {}, questionCounts: {}, loading: true });

  useEffect(() => {
    (async () => {
      const [{ data: subjects }, { data: chapters }, { data: questions }] = await Promise.all([
        supabase.from('subjects').select('*').order('sort_order'),
        supabase.from('chapters').select('subject_id'),
        supabase.from('questions').select('subject_id'),
      ]);
      const chapterCountMap: Record<string, number> = {};
      (chapters || []).forEach((c) => {
        chapterCountMap[c.subject_id] = (chapterCountMap[c.subject_id] || 0) + 1;
      });
      const questionCountMap: Record<string, number> = {};
      (questions || []).forEach((q) => {
        questionCountMap[q.subject_id] = (questionCountMap[q.subject_id] || 0) + 1;
      });
      setData({
        subjects: subjects || [],
        chapterCounts: chapterCountMap,
        questionCounts: questionCountMap,
        loading: false,
      });
    })();
  }, []);

  return data;
}

// 加载复习数据
export function useReviewData() {
  const [data, setData] = useState<{
    questions: any[];
    loading: boolean;
  }>({ questions: [], loading: true });

  useEffect(() => {
    (async () => {
      try {
        const { data: dueQuestions } = await supabase
          .from('questions')
          .select('*, subject:subjects(*), chapter:chapters(*), knowledge_point:chapter_knowledge_points(*)')
          .eq('status', 'active')
          .lte('next_review_at', new Date().toISOString())
          .order('next_review_at', { ascending: true });

        const questionIds = (dueQuestions || []).map((q) => q.id);
        let questionReasonsMap: Record<string, any[]> = {};
        if (questionIds.length > 0) {
          const { data: qer } = await supabase
            .from('question_error_reasons')
            .select('question_id, error_reasons(*)')
            .in('question_id', questionIds);
          questionReasonsMap = (qer || []).reduce((acc, item: any) => {
            if (!acc[item.question_id]) acc[item.question_id] = [];
            if (item.error_reasons) acc[item.question_id].push(item.error_reasons);
            return acc;
          }, {} as Record<string, any[]>);
        }

        const questions = (dueQuestions || []).map((q) => ({
          ...q,
          error_reasons: questionReasonsMap[q.id] || [],
        }));

        setData({ questions, loading: false });
      } catch {
        setData({ questions: [], loading: false });
      }
    })();
  }, []);

  return data;
}

// 加载统计数据
export function useStatsData() {
  const [data, setData] = useState<{
    subjects: Subject[];
    errorReasons: ErrorReason[];
    chapterStats: ChapterErrorStats[];
    loading: boolean;
  }>({ subjects: [], errorReasons: [], chapterStats: [], loading: true });

  useEffect(() => {
    (async () => {
      try {
        const [{ data: subjects }, { data: chapters }, { data: errorReasons }, { data: questions }, { data: qer }] =
          await Promise.all([
            supabase.from('subjects').select('*').order('sort_order'),
            supabase.from('chapters').select('*').order('sort_order'),
            supabase.from('error_reasons').select('*').order('sort_order'),
            supabase.from('questions').select('id, chapter_id, subject_id, status').eq('status', 'active'),
            supabase.from('question_error_reasons').select('question_id, error_reason_id'),
          ]);

        const questionReasonMap: Record<string, string[]> = {};
        (qer || []).forEach((item: any) => {
          if (!questionReasonMap[item.question_id]) questionReasonMap[item.question_id] = [];
          questionReasonMap[item.question_id].push(item.error_reason_id);
        });

        const subjectMap = new Map((subjects || []).map((s) => [s.id, s]));
        const statsByChapter: Record<string, { total: number; byReason: Record<string, number> }> = {};

        (questions || []).forEach((q) => {
          if (!statsByChapter[q.chapter_id]) statsByChapter[q.chapter_id] = { total: 0, byReason: {} };
          statsByChapter[q.chapter_id].total += 1;
          (questionReasonMap[q.id] || []).forEach((rid) => {
            statsByChapter[q.chapter_id].byReason[rid] = (statsByChapter[q.chapter_id].byReason[rid] || 0) + 1;
          });
        });

        const chapterStats = (chapters || []).map((chapter) => {
          const stat = statsByChapter[chapter.id] || { total: 0, byReason: {} };
          const subject = subjectMap.get(chapter.subject_id);
          return {
            chapter_id: chapter.id,
            chapter_name: chapter.name,
            subject_id: chapter.subject_id,
            subject_name: subject?.name || '',
            subject_color: subject?.color || '#6366f1',
            total_questions: stat.total,
            by_reason: (errorReasons || []).map((r) => ({
              reason_id: r.id,
              reason_name: r.name,
              color: r.color,
              frequency: stat.byReason[r.id] || 0,
              percentage: stat.total > 0 ? Math.round(((stat.byReason[r.id] || 0) / stat.total) * 100) : 0,
            })),
          };
        });

        setData({
          subjects: subjects || [],
          errorReasons: errorReasons || [],
          chapterStats,
          loading: false,
        });
      } catch {
        setData({ subjects: [], errorReasons: [], chapterStats: [], loading: false });
      }
    })();
  }, []);

  return data;
}
