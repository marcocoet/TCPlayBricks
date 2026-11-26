-- Admin portal foundation: roles, product image gallery, upload rights.
-- Security is enforced here in the database (RLS), not just in the UI.

------------------------------------------------------------------------
-- 1. Roles
------------------------------------------------------------------------
-- Every profile gets a role. New sign-ups are 'customer'. Only an admin
-- can change someone's role (there is deliberately no policy letting a
-- user update their own profile row).
alter table public.profiles
  add column if not exists role text not null default 'customer'
  check (role in ('customer', 'staff', 'admin'));

-- Helpers used by the policies below. SECURITY DEFINER so they can read
-- profiles regardless of the caller's own RLS; empty search_path so they
-- can't be hijacked by objects in other schemas.
create or replace function public.is_staff()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('staff', 'admin')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_staff() from public, anon;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.is_admin() to authenticated;

-- Admins can see every profile (to manage staff) and change roles.
create policy "Admins can view all profiles" on public.profiles
  for select to authenticated using (public.is_admin());
create policy "Admins can update profiles" on public.profiles
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

------------------------------------------------------------------------
-- 2. Staff/admin can manage sets and themes; only admin manages PUDO boxes
------------------------------------------------------------------------
create policy "Staff can insert sets" on public.lego_sets
  for insert to authenticated with check (public.is_staff());
create policy "Staff can update sets" on public.lego_sets
  for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "Staff can delete sets" on public.lego_sets
  for delete to authenticated using (public.is_staff());

create policy "Staff can insert themes" on public.themes
  for insert to authenticated with check (public.is_staff());
create policy "Staff can update themes" on public.themes
  for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "Staff can delete themes" on public.themes
  for delete to authenticated using (public.is_staff());

create policy "Admins can insert pudo boxes" on public.pudo_boxes
  for insert to authenticated with check (public.is_admin());
create policy "Admins can update pudo boxes" on public.pudo_boxes
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete pudo boxes" on public.pudo_boxes
  for delete to authenticated using (public.is_admin());

------------------------------------------------------------------------
-- 3. Multiple images per set
------------------------------------------------------------------------
create table public.set_images (
  image_id     bigint generated always as identity primary key,
  set_id       bigint not null references public.lego_sets(set_id) on delete cascade,
  url          text not null,
  storage_path text,              -- path inside the lego-images bucket (null for external URLs)
  sort_order   integer not null default 0,
  is_primary   boolean not null default false,
  created_at   timestamptz not null default now()
);
create index set_images_set_id_idx on public.set_images (set_id, sort_order);
-- At most one main image per set.
create unique index set_images_one_primary on public.set_images (set_id) where is_primary;

alter table public.set_images enable row level security;
create policy "Anyone can view set images" on public.set_images
  for select to anon, authenticated using (true);
create policy "Staff can insert set images" on public.set_images
  for insert to authenticated with check (public.is_staff());
create policy "Staff can update set images" on public.set_images
  for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "Staff can delete set images" on public.set_images
  for delete to authenticated using (public.is_staff());

-- Keep lego_sets.image_url pointing at the main image, so every existing
-- shop page (listings, cart, checkout) keeps working unchanged.
create or replace function public.sync_set_main_image()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_set_id bigint := coalesce(new.set_id, old.set_id);
begin
  update public.lego_sets s
  set image_url = (
    select i.url from public.set_images i
    where i.set_id = v_set_id
    order by i.is_primary desc, i.sort_order, i.image_id
    limit 1
  )
  where s.set_id = v_set_id;
  -- If an image moved to another set, refresh the old set too.
  if tg_op = 'UPDATE' and old.set_id <> new.set_id then
    update public.lego_sets s
    set image_url = (
      select i.url from public.set_images i
      where i.set_id = old.set_id
      order by i.is_primary desc, i.sort_order, i.image_id
      limit 1
    )
    where s.set_id = old.set_id;
  end if;
  return null;
end;
$$;
revoke all on function public.sync_set_main_image() from public, anon, authenticated;

create trigger set_images_sync_main
  after insert or update or delete on public.set_images
  for each row execute function public.sync_set_main_image();

-- Carry over each set's current image as its main gallery image.
insert into public.set_images (set_id, url, storage_path, sort_order, is_primary)
select
  set_id,
  image_url,
  case when image_url like '%/storage/v1/object/public/lego-images/%'
       then split_part(image_url, '/storage/v1/object/public/lego-images/', 2)
  end,
  0,
  true
from public.lego_sets
where image_url is not null;

------------------------------------------------------------------------
-- 4. Image uploads to the existing lego-images bucket
------------------------------------------------------------------------
-- Images only, max 5 MB each. Existing files are unaffected.
update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'],
    file_size_limit = 5242880
where id = 'lego-images';

-- The bucket is public, so anyone can view files by URL; only staff and
-- admins can upload, replace or delete them. (Storage needs a SELECT
-- policy for staff too, or replace/delete from the app fails.)
create policy "Staff can read lego images" on storage.objects
  for select to authenticated
  using (bucket_id = 'lego-images' and public.is_staff());
create policy "Staff can upload lego images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'lego-images' and public.is_staff());
create policy "Staff can update lego images" on storage.objects
  for update to authenticated
  using (bucket_id = 'lego-images' and public.is_staff())
  with check (bucket_id = 'lego-images' and public.is_staff());
create policy "Staff can delete lego images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'lego-images' and public.is_staff());
