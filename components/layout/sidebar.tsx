'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { HomeIcon, BookIcon, RefreshIcon, ChartIcon, UserIcon, LayersIcon, FolderIcon } from '@/components/ui/icons';

const navItems = [
  { href: '/', label: '首页', icon: HomeIcon },
  { href: '/questions', label: '错题列表', icon: BookIcon },
  { href: '/review', label: '今日复习', icon: RefreshIcon },
  { href: '/stats', label: '章节错因报告', icon: ChartIcon },
  { href: '/chapters', label: '章节管理', icon: LayersIcon },
  { href: '/subjects', label: '科目管理', icon: FolderIcon },
  { href: '/settings', label: '设置', icon: UserIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col md:w-56 md:fixed md:inset-y-0 md:left-0 border-r border-slate-200 bg-white">
      <div className="h-16 flex items-center px-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
            错
          </div>
          <span className="font-semibold text-slate-900">考研错题本</span>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-100">
        <Link
          href="/questions/new"
          className="flex items-center justify-center gap-2 h-10 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          + 新增错题
        </Link>
      </div>
    </aside>
  );
}
