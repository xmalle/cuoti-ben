import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProviders } from '@/components/providers';
import { AppShell } from '@/components/layout/app-shell';

export const metadata: Metadata = {
  title: '考研错题本',
  description: '考研专业课与数学错题管理 · 章节错因分析 · 间隔重复复习',
  manifest: '/cuoti-ben/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '考研错题本',
  },
};

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
