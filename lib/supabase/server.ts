import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * 服务端 Supabase 客户端（Server Components / Route Handlers / Server Actions）
 */
export function createClient() {
  const cookieStore = cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn('[Supabase] 服务端环境变量未配置');
  }

  return createServerClient(
    url || 'https://placeholder.supabase.co',
    anonKey || 'placeholder-anon-key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as any)
            );
          } catch {
            // 在 Server Component 中调用 set 会被忽略，无需处理
          }
        },
      },
    }
  );
}
