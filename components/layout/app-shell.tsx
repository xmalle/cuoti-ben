'use client';

import { ReactNode } from 'react';
import { BottomNav } from './bottom-nav';
import { Sidebar } from './sidebar';
import { MobileHeader } from './mobile-header';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="md:pl-56 flex flex-col min-h-screen">
        <MobileHeader />
        <main className="flex-1 pb-20 md:pb-8">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
