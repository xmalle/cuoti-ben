import type { ReviewResult } from '@/types';

/**
 * SM-2 间隔重复算法实现
 * 参考：https://en.wikipedia.org/wiki/SuperMemo#Description_of_SM-2_algorithm
 */

export interface SrsState {
  ease_factor: number; // 难度系数，初始 2.5
  interval_days: number; // 当前间隔天数
  review_count: number; // 已复习次数
  last_reviewed_at: string | null;
  next_review_at: string; // 下次复习时间
}

export interface SrsUpdateResult extends Pick<SrsState, 'ease_factor' | 'interval_days' | 'review_count' | 'last_reviewed_at' | 'next_review_at'> {}

/**
 * 根据复习反馈计算新的 SRS 状态
 * @param current 当前 SRS 状态
 * @param quality 复习反馈：again(0) / hard(3) / good(4) / easy(5)
 * @returns 更新后的 SRS 状态
 */
export function calculateNextReview(
  current: Pick<SrsState, 'ease_factor' | 'interval_days' | 'review_count'>,
  quality: ReviewResult
): SrsUpdateResult {
  const qualityMap: Record<ReviewResult, number> = {
    again: 0,
    hard: 3,
    good: 4,
    easy: 5,
  };
  const q = qualityMap[quality];

  let { ease_factor, interval_days, review_count } = current;
  const now = new Date();

  review_count += 1;

  if (q < 3) {
    // 答错/忘记：重置间隔为 1 天
    interval_days = 1;
  } else {
    // 答对：根据次数和难度系数计算新间隔
    if (review_count === 1) {
      interval_days = 1;
    } else if (review_count === 2) {
      interval_days = quality === 'hard' ? 3 : 6;
    } else {
      interval_days = Math.round(interval_days * ease_factor);
    }
  }

  // 更新难度系数（不低于 1.3）
  ease_factor = Math.max(
    1.3,
    ease_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  );

  // 计算下次复习时间
  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + interval_days);
  nextReview.setHours(9, 0, 0, 0); // 固定到早上 9 点

  return {
    ease_factor: Math.round(ease_factor * 100) / 100,
    interval_days,
    review_count,
    last_reviewed_at: now.toISOString(),
    next_review_at: nextReview.toISOString(),
  };
}

/**
 * 创建初始 SRS 状态（新建错题时）
 * 默认次日复习
 */
export function createInitialSrsState(): SrsUpdateResult {
  const now = new Date();
  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + 1);
  nextReview.setHours(9, 0, 0, 0);

  return {
    ease_factor: 2.5,
    interval_days: 0,
    review_count: 0,
    last_reviewed_at: null,
    next_review_at: nextReview.toISOString(),
  };
}
