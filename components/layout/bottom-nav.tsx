'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { HomeIcon, BookIcon, RefreshIcon, ChartIcon, UserIcon } from '@/components/ui/icons';

const navItems = [
  { href: '/', label: '首页', icon: HomeIcon },
  { href: '/questions', label: '错题', icon: BookIcon },
  { href: '/review', label: '复习', icon: RefreshIcon },
  { href: '/stats', label: '统计', icon: ChartIcon },
  { href: '/settings', label: '我的', icon: UserIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 safe-bottom">
      <div className="flex items-stretch justify-around">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 py-2 px-2 flex-1 min-w-0',
                'transition-colors',
                isActive ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
