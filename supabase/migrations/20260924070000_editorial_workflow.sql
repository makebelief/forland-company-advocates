-- Editorial workflow additions for accessible images, internal linking and revisions.

alter table public.cms_insights
  add column if not exists featured_image_alt text not null default ''
    check (char_length(featured_image_alt) <= 500),
  add column if not exists related_practice_area_id uuid
    references public.cms_practice_areas(id) on delete set null;

update public.cms_insights
set featured_image_alt = title
where featured_image_url <> '' and featured_image_alt = '';

update public.cms_insights insight
set related_practice_area_id = practice.id
from public.cms_practice_areas practice
where practice.slug = case insight.slug
  when 'establishing-business' then 'corporate-commercial'
  when 'commercial-agreement' then 'corporate-commercial'
  when 'emobility-sector' then 'energy-emobility'
  when 'corporate-governance' then 'corporate-commercial'
  when 'property-due-diligence' then 'real-estate'
  when 'employment-compliance' then 'employment-labour'
end
and insight.related_practice_area_id is null;

create index if not exists cms_insights_related_practice_idx
  on public.cms_insights(related_practice_area_id);

create table if not exists public.cms_revisions (
  id bigint generated always as identity primary key,
  resource text not null check (resource in ('insights', 'team_members', 'practice_areas')),
  resource_id uuid not null,
  snapshot jsonb not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists cms_revisions_resource_idx
  on public.cms_revisions(resource, resource_id, created_at desc, id desc);

alter table public.cms_revisions enable row level security;
revoke all on table public.cms_revisions from anon, authenticated;
grant all on table public.cms_revisions to service_role;
grant usage, select on sequence public.cms_revisions_id_seq to service_role;

-- The bucket is publicly readable because published website images are public.
-- Browser writes are restricted to the sole allow-listed administrator. The app
-- adds server-side session, same-origin, file-size, MIME and signature validation.
drop policy if exists "cms_media_public_read" on storage.objects;
create policy "cms_media_public_read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'cms-media');

drop policy if exists "cms_media_admin_insert" on storage.objects;
create policy "cms_media_admin_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'cms-media' and lower(auth.jwt() ->> 'email') = 'forlandcompanyadvocates@gmail.com');

drop policy if exists "cms_media_admin_update" on storage.objects;
create policy "cms_media_admin_update"
on storage.objects for update
to authenticated
using (bucket_id = 'cms-media' and lower(auth.jwt() ->> 'email') = 'forlandcompanyadvocates@gmail.com')
with check (bucket_id = 'cms-media' and lower(auth.jwt() ->> 'email') = 'forlandcompanyadvocates@gmail.com');

drop policy if exists "cms_media_admin_delete" on storage.objects;
create policy "cms_media_admin_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'cms-media' and lower(auth.jwt() ->> 'email') = 'forlandcompanyadvocates@gmail.com');
