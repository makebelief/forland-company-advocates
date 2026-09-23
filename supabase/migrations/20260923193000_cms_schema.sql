-- Forland & Company Advocates CMS schema.
-- Browser roles receive no table privileges or RLS policies. All CMS access is mediated
-- by authenticated Vercel Functions using the server-only service role.

create extension if not exists pgcrypto;
create schema if not exists private;

create or replace function private.set_cms_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.admin_security (
  user_id uuid primary key references auth.users(id) on delete cascade,
  must_change_password boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_pages (
  slug text primary key check (slug ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  name text not null check (char_length(name) between 1 and 120),
  content jsonb not null default '{}'::jsonb,
  seo_title text not null default '' check (char_length(seo_title) <= 180),
  meta_description text not null default '' check (char_length(meta_description) <= 320),
  og_image_url text not null default '' check (char_length(og_image_url) <= 1000),
  is_published boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table if not exists public.cms_practice_areas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  title text not null check (char_length(title) between 1 and 180),
  summary text not null default '' check (char_length(summary) <= 1200),
  body text not null default '' check (char_length(body) <= 30000),
  services jsonb not null default '[]'::jsonb,
  image_url text not null default '' check (char_length(image_url) <= 1000),
  cta text not null default '' check (char_length(cta) <= 160),
  sort_order integer not null default 0 check (sort_order between 0 and 10000),
  is_published boolean not null default true,
  seo_title text not null default '' check (char_length(seo_title) <= 180),
  meta_description text not null default '' check (char_length(meta_description) <= 320),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table if not exists public.cms_team_members (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  name text not null check (char_length(name) between 1 and 160),
  role_title text not null default '' check (char_length(role_title) <= 220),
  qualifications text not null default '' check (char_length(qualifications) <= 1200),
  bio text not null default '' check (char_length(bio) <= 30000),
  email text not null default '' check (char_length(email) <= 320),
  phone text not null default '' check (char_length(phone) <= 80),
  image_url text not null default '' check (char_length(image_url) <= 1000),
  sort_order integer not null default 0 check (sort_order between 0 and 10000),
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table if not exists public.cms_insights (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{0,99}$'),
  title text not null check (char_length(title) between 1 and 220),
  category text not null default 'Insights' check (char_length(category) <= 100),
  excerpt text not null default '' check (char_length(excerpt) <= 1600),
  body text not null default '' check (char_length(body) <= 60000),
  featured_image_url text not null default '' check (char_length(featured_image_url) <= 1000),
  author text not null default 'Forland & Company Advocates' check (char_length(author) <= 180),
  published_at timestamptz,
  is_published boolean not null default false,
  seo_title text not null default '' check (char_length(seo_title) <= 180),
  meta_description text not null default '' check (char_length(meta_description) <= 320),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  sort_order integer not null default 100 check (sort_order between 0 and 10000)
);

create table if not exists public.cms_media (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique check (char_length(storage_path) between 1 and 500),
  public_url text not null check (char_length(public_url) between 1 and 1200),
  file_name text not null check (char_length(file_name) between 1 and 255),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  size_bytes bigint not null check (size_bytes between 1 and 3145728),
  alt_text text not null default '' check (char_length(alt_text) <= 500),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create table if not exists public.cms_settings (
  key text primary key check (key ~ '^[a-z0-9_-]{1,64}$'),
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table if not exists public.cms_audit_log (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  user_email text not null default '',
  action text not null check (char_length(action) between 1 and 80),
  resource text not null check (char_length(resource) between 1 and 80),
  resource_id text not null default '' check (char_length(resource_id) <= 200),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.cms_inquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 160),
  company text not null default '' check (char_length(company) <= 180),
  email text not null check (char_length(email) between 5 and 320),
  phone text not null default '' check (char_length(phone) <= 80),
  practice_area text not null default '' check (char_length(practice_area) <= 180),
  message text not null check (char_length(message) between 10 and 500),
  privacy_ack boolean not null default true,
  status text not null default 'new' check (status in ('new', 'in_progress', 'closed', 'spam')),
  admin_notes text not null default '' check (char_length(admin_notes) <= 5000),
  source_hash text not null default '' check (char_length(source_hash) <= 128),
  user_agent text not null default '' check (char_length(user_agent) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cms_pages_updated_by_idx on public.cms_pages(updated_by);
create index if not exists cms_practice_order_idx on public.cms_practice_areas(is_published, sort_order, title);
create index if not exists cms_practice_updated_by_idx on public.cms_practice_areas(updated_by);
create index if not exists cms_team_order_idx on public.cms_team_members(is_published, sort_order, name);
create index if not exists cms_team_updated_by_idx on public.cms_team_members(updated_by);
create index if not exists cms_insights_order_idx on public.cms_insights(is_published, sort_order, published_at desc, created_at desc);
create index if not exists cms_insights_published_idx on public.cms_insights(is_published, published_at desc, created_at desc);
create index if not exists cms_insights_updated_by_idx on public.cms_insights(updated_by);
create index if not exists cms_media_created_by_idx on public.cms_media(created_by);
create index if not exists cms_settings_updated_by_idx on public.cms_settings(updated_by);
create index if not exists cms_audit_created_idx on public.cms_audit_log(created_at desc);
create index if not exists cms_audit_user_id_idx on public.cms_audit_log(user_id);
create index if not exists cms_inquiries_source_created_idx on public.cms_inquiries(source_hash, created_at desc);
create index if not exists cms_inquiries_status_created_idx on public.cms_inquiries(status, created_at desc);

do $$
declare
  pair text[];
begin
  foreach pair slice 1 in array array[
    array['cms_pages', 'cms_pages_updated'],
    array['cms_practice_areas', 'cms_practice_updated'],
    array['cms_team_members', 'cms_team_updated'],
    array['cms_insights', 'cms_insights_updated'],
    array['cms_settings', 'cms_settings_updated'],
    array['cms_inquiries', 'cms_inquiries_updated']
  ]
  loop
    if not exists (
      select 1 from pg_trigger
      where tgname = pair[2]
        and tgrelid = format('public.%I', pair[1])::regclass
        and not tgisinternal
    ) then
      execute format(
        'create trigger %I before update on public.%I for each row execute function private.set_cms_updated_at()',
        pair[2],
        pair[1]
      );
    end if;
  end loop;
end
$$;

alter table public.admin_security enable row level security;
alter table public.cms_pages enable row level security;
alter table public.cms_practice_areas enable row level security;
alter table public.cms_team_members enable row level security;
alter table public.cms_insights enable row level security;
alter table public.cms_media enable row level security;
alter table public.cms_settings enable row level security;
alter table public.cms_audit_log enable row level security;
alter table public.cms_inquiries enable row level security;

revoke all on table public.admin_security, public.cms_pages, public.cms_practice_areas,
  public.cms_team_members, public.cms_insights, public.cms_media, public.cms_settings,
  public.cms_audit_log, public.cms_inquiries from anon, authenticated;

grant all on table public.admin_security, public.cms_pages, public.cms_practice_areas,
  public.cms_team_members, public.cms_insights, public.cms_media, public.cms_settings,
  public.cms_audit_log, public.cms_inquiries to service_role;

grant usage, select on sequence public.cms_audit_log_id_seq to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cms-media', 'cms-media', true, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
