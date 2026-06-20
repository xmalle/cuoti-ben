-- ============================================================
-- 考研错题本数据库 Schema
-- 适用于 Supabase PostgreSQL
-- 执行方式：在 Supabase 控制台 > SQL Editor 中执行本文件
-- ============================================================

-- 启用 UUID 扩展
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. 科目表
-- ============================================================
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default '#6366f1',
  icon text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 2. 章节表
-- ============================================================
create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_chapters_subject_id on public.chapters(subject_id);
create index if not exists idx_chapters_sort_order on public.chapters(sort_order);

-- ============================================================
-- 3. 章节知识点内容表（用户自定义填写）
-- ============================================================
create table if not exists public.chapter_knowledge_points (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  content text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_ckp_chapter_id on public.chapter_knowledge_points(chapter_id);

-- ============================================================
-- 4. 错题表
-- ============================================================
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete restrict,
  chapter_id uuid not null references public.chapters(id) on delete restrict,
  knowledge_point_id uuid references public.chapter_knowledge_points(id) on delete set null,
  page_number text,
  title text not null default '',
  analysis text not null default '',
  notes text not null default '',
  image_urls text[] not null default '{}',
  difficulty integer not null default 3 check (difficulty between 1 and 5),
  status text not null default 'active' check (status in ('active', 'archived')),
  -- 间隔重复字段
  next_review_at timestamptz not null default (now() + interval '1 day'),
  review_count integer not null default 0,
  ease_factor numeric(3,2) not null default 2.50,
  interval_days integer not null default 0,
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_questions_subject_id on public.questions(subject_id);
create index if not exists idx_questions_chapter_id on public.questions(chapter_id);
create index if not exists idx_questions_next_review on public.questions(next_review_at) where status = 'active';
create index if not exists idx_questions_created_at on public.questions(created_at desc);

-- ============================================================
-- 5. 错因标签表（预设 + 自定义）
-- ============================================================
create table if not exists public.error_reasons (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_preset boolean not null default false,
  color text not null default '#6b7280',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 6. 错题-错因 多对多关联
-- ============================================================
create table if not exists public.question_error_reasons (
  question_id uuid not null references public.questions(id) on delete cascade,
  error_reason_id uuid not null references public.error_reasons(id) on delete cascade,
  primary key (question_id, error_reason_id)
);

create index if not exists idx_qer_error_reason_id on public.question_error_reasons(error_reason_id);

-- ============================================================
-- 7. 复习记录表
-- ============================================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  reviewed_at timestamptz not null default now(),
  result text not null check (result in ('again', 'hard', 'good', 'easy')),
  time_spent_seconds integer
);

create index if not exists idx_reviews_question_id on public.reviews(question_id);
create index if not exists idx_reviews_reviewed_at on public.reviews(reviewed_at desc);

-- ============================================================
-- 更新时间触发器
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_chapters_updated_at on public.chapters;
create trigger trg_chapters_updated_at before update on public.chapters
  for each row execute function public.handle_updated_at();

drop trigger if exists trg_questions_updated_at on public.questions;
create trigger trg_questions_updated_at before update on public.questions
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 预设错因标签初始化数据
-- ============================================================
insert into public.error_reasons (name, is_preset, color, sort_order) values
  ('计算错误', true, '#ef4444', 1),
  ('概念未理解', true, '#f97316', 2),
  ('知识点遗忘', true, '#eab308', 3),
  ('知识点记忆错误', true, '#84cc16', 4),
  ('方法不会', true, '#06b6d4', 5),
  ('审题失误', true, '#3b82f6', 6),
  ('粗心马虎', true, '#a855f7', 7)
on conflict (name) do nothing;

-- ============================================================
-- 预设科目示例数据（用户可后续修改）
-- ============================================================
insert into public.subjects (name, color, icon, sort_order) values
  ('数学', '#3b82f6', 'math', 1),
  ('专业课', '#10b981', 'book', 2)
on conflict do nothing;

-- ============================================================
-- RLS（行级安全）策略
-- 由于本项目为单用户个人使用，采用宽松策略（allow all）
-- 若需多用户，请改为按 auth.uid() 过滤
-- ============================================================
alter table public.subjects enable row level security;
alter table public.chapters enable row level security;
alter table public.chapter_knowledge_points enable row level security;
alter table public.questions enable row level security;
alter table public.error_reasons enable row level security;
alter table public.question_error_reasons enable row level security;
alter table public.reviews enable row level security;

-- 单用户模式：允许所有访问（通过 service_role / anon key）
-- 生产环境如需鉴权，可改用 Supabase Auth + 以下策略：
-- create policy "用户只能访问自己的数据" on public.questions
--   for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "allow_all_subjects" on public.subjects;
create policy "allow_all_subjects" on public.subjects for all using (true) with check (true);

drop policy if exists "allow_all_chapters" on public.chapters;
create policy "allow_all_chapters" on public.chapters for all using (true) with check (true);

drop policy if exists "allow_all_ckp" on public.chapter_knowledge_points;
create policy "allow_all_ckp" on public.chapter_knowledge_points for all using (true) with check (true);

drop policy if exists "allow_all_questions" on public.questions;
create policy "allow_all_questions" on public.questions for all using (true) with check (true);

drop policy if exists "allow_all_error_reasons" on public.error_reasons;
create policy "allow_all_error_reasons" on public.error_reasons for all using (true) with check (true);

drop policy if exists "allow_all_qer" on public.question_error_reasons;
create policy "allow_all_qer" on public.question_error_reasons for all using (true) with check (true);

drop policy if exists "allow_all_reviews" on public.reviews;
create policy "allow_all_reviews" on public.reviews for all using (true) with check (true);

-- ============================================================
-- Storage Bucket（用于存储错题图片）
-- 需在 Supabase 控制台 > Storage 中手动创建名为 question-images 的 public bucket
-- 或执行以下 SQL（需要服务端权限）：
-- ============================================================
insert into storage.buckets (id, name, public) 
  values ('question-images', 'question-images', true)
  on conflict (id) do nothing;

drop policy if exists "allow_public_read_images" on storage.objects;
create policy "allow_public_read_images" on storage.objects 
  for select using (bucket_id = 'question-images');

drop policy if exists "allow_insert_images" on storage.objects;
create policy "allow_insert_images" on storage.objects 
  for insert with check (bucket_id = 'question-images');

drop policy if exists "allow_update_images" on storage.objects;
create policy "allow_update_images" on storage.objects 
  for update using (bucket_id = 'question-images');

drop policy if exists "allow_delete_images" on storage.objects;
create policy "allow_delete_images" on storage.objects 
  for delete using (bucket_id = 'question-images');

-- ============================================================
-- 完成提示
-- 执行完毕后：
-- 1. 数据库已创建 7 张表 + 预设数据
-- 2. Storage 已创建 question-images 公开桶
-- 3. 可在前端代码中填入 Supabase URL 和 Anon Key 开始使用
-- ============================================================
