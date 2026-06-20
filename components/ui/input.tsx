import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full h-10 px-3 rounded-lg border bg-white text-slate-900 text-sm',
          'placeholder:text-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
          'disabled:bg-slate-50 disabled:text-slate-500',
          error ? 'border-red-400 focus:ring-red-500' : 'border-slate-300',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full px-3 py-2 rounded-lg border bg-white text-slate-900 text-sm',
          'placeholder:text-slate-400 resize-y min-h-[80px]',
          'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
          error ? 'border-red-400 focus:ring-red-500' : 'border-slate-300',
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'w-full h-10 px-3 rounded-lg border bg-white text-slate-900 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
          'disabled:bg-slate-50 disabled:text-slate-500',
          error ? 'border-red-400 focus:ring-red-500' : 'border-slate-300',
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';

export function Label({ children, className, required }: { children: React.ReactNode; className?: string; required?: boolean }) {
  return (
    <label className={cn('block text-sm font-medium text-slate-700 mb-1.5', className)}>
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-red-500">{children}</p>;
}
