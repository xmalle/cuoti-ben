'use client';

import { ReactNode } from 'react';

/**
 * 应用全局 Provider 容器
 * 当前为轻量封装，后续可挂载 Zustand 全局状态、Toast、主题等
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
