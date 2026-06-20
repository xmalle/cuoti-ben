/**
 * 合并 className（轻量实现，无外部依赖）
 */
export type ClassValue = string | number | boolean | undefined | null | ClassValue[] | { [key: string]: boolean | undefined | null };

export function cn(...inputs: ClassValue[]): string {
  return inputs
    .filter(Boolean)
    .map((item) => {
      if (typeof item === 'string') return item;
      if (Array.isArray(item)) return cn(...item);
      if (item && typeof item === 'object') {
        return Object.entries(item)
          .filter(([, v]) => Boolean(v))
          .map(([k]) => k)
          .join(' ');
      }
      return '';
    })
    .join(' ');
}

/**
 * 格式化日期为中文短日期
 */
export function formatDate(date: string | Date | null): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * 格式化日期时间
 */
export function formatDateTime(date: string | Date | null): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${formatDate(d)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * 相对时间（如"3天前"、"刚刚"）
 */
export function relativeTime(date: string | Date | null): string {
  if (!date) return '从未';
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 30) return `${days}天前`;
  return formatDate(d);
}

/**
 * 判断日期是否今天
 */
export function isToday(date: string | Date | null): boolean {
  if (!date) return false;
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

/**
 * 判断日期是否已过期（早于今天）
 */
export function isOverdue(date: string | Date | null): boolean {
  if (!date) return false;
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d.getTime() < today.getTime();
}

/**
 * 生成简单 ID（仅用于前端临时场景）
 */
export function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * 截断文本
 */
export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '...';
}

/**
 * 颜色 hex 转 rgba（带透明度）
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
