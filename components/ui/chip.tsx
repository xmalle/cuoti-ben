import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ChipProps extends HTMLAttributes<HTMLButtonElement> {
  color?: string;
  selected?: boolean;
  size?: 'sm' | 'md';
}

export function Chip({
  color = '#6366f1',
  selected = false,
  size = 'md',
  className,
  children,
  ...props
}: ChipProps) {
  const sizeStyles = {
    sm: 'h-6 px-2.5 text-xs',
    md: 'h-8 px-3 text-sm',
  };

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium transition-all whitespace-nowrap',
        'focus:outline-none focus:ring-2 focus:ring-offset-1',
        sizeStyles[size],
        selected
          ? 'text-white shadow-sm'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      )}
      style={
        selected
          ? { backgroundColor: color }
          : undefined
      }
      {...props}
    >
      {!selected && (
        <span
          className="h-2 w-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
      )}
      {children}
    </button>
  );
}

/**
 * 只读标签（用于展示，非交互）
 */
export function Tag({
  color = '#6366f1',
  size = 'sm',
  className,
  children,
}: {
  color?: string;
  size?: 'sm' | 'md';
  className?: string;
  children: React.ReactNode;
}) {
  const sizeStyles = {
    sm: 'h-5 px-2 text-xs',
    md: 'h-7 px-2.5 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap',
        sizeStyles[size],
        className
      )}
      style={{
        backgroundColor: `${color}20`,
        color,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {children}
    </span>
  );
}
