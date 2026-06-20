'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlusIcon } from '@/components/ui/icons';

const pageTitles: Record<string, string> = {
  '/': '考研错题本',
  '/questions': '错题列表',
  '/questions/new': '新增错题',
  '/questions/view': '错题详情',
  '/review': '今日复习',
  '/stats': '章节错因报告',
  '/chapters': '章节管理',
  '/chapters/view': '章节详情',
  '/subjects': '科目管理',
  '/settings': '设置',
};

export function MobileHeader() {
  const pathname = usePathname();

  // 详情页的标题处理
  let title = pageTitles[pathname];
  if (!title) {
    title = '考研错题本';
  }

  const showAddButton =
    pathname === '/' || pathname === '/questions' || pathname === '/chapters' || pathname === '/subjects';

  return (
    <header className="md:hidden sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-100 safe-top">
      <div className="h-14 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {pathname === '/' && (
            <div className="h-7 w-7 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-xs">
              错
            </div>
          )}
          <h1 className="text-base font-semibold text-slate-900">{title}</h1>
        </div>
        {showAddButton && (
          <Link
            href={getAddHref(pathname)}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-brand-600 text-white"
          >
            <PlusIcon className="h-5 w-5" />
          </Link>
        )}
      </div>
    </header>
  );
}

function getAddHref(pathname: string): string {
  if (pathname === '/chapters') return '/chapters/new';
  if (pathname === '/subjects') return '/subjects/new';
  return '/questions/new';
}
