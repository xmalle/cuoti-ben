import { createBrowserClient } from '@supabase/ssr';

/**
 * 浏览器端 Supabase 客户端
 * 使用 NEXT_PUBLIC_ 前缀的环境变量
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // 未配置时返回一个会抛错的占位客户端，避免构建失败
    console.warn('[Supabase] 环境变量未配置，请在 .env.local 中设置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return createBrowserClient(
    url || 'https://placeholder.supabase.co',
    anonKey || 'placeholder-anon-key'
  );
}
