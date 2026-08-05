-- Allow multiple HRBMP request admins to review, approve, decline, and deliver
-- public GUI data requests after signing in through Supabase Auth.
--
-- Passwords are managed in Supabase Auth, not in public tables or GitHub.

create extension if not exists citext;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.hrbmp_request_admins (
  admin_email citext primary key,
  display_name text not null,
  can_review_requests boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hrbmp_request_admins_email_check check (
    admin_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  )
);

comment on table public.hrbmp_request_admins is
  'Allowlist of Supabase Auth email accounts that can review HRBMP GUI data requests.';
comment on column public.hrbmp_request_admins.admin_email is
  'Must match the user email in Supabase Auth.';
comment on column public.hrbmp_request_admins.can_review_requests is
  'Set false to temporarily remove request-review privileges without deleting the row.';

drop trigger if exists hrbmp_request_admins_set_updated_at on public.hrbmp_request_admins;

create trigger hrbmp_request_admins_set_updated_at
before update on public.hrbmp_request_admins
for each row execute function public.set_updated_at();

insert into public.hrbmp_request_admins (admin_email, display_name, can_review_requests, notes)
values
  ('chengxue.li@stonybrook.edu', 'Chengxue Li', true, 'Initial HRBMP request admin'),
  ('xiangyan.yang@stonybrook.edu', 'Xiangyan Yang', true, 'Can review and approve HRBMP data requests'),
  ('xiangshan.mu@stonybrook.edu', 'Xiangshan Mu', true, 'Can review and approve HRBMP data requests')
on conflict (admin_email) do update
set
  display_name = excluded.display_name,
  can_review_requests = excluded.can_review_requests,
  notes = excluded.notes;

alter table public.hrbmp_request_admins enable row level security;

revoke all on public.hrbmp_request_admins from anon, authenticated;

create or replace function public.is_hrbmp_request_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.hrbmp_request_admins a
    where a.admin_email = (select auth.jwt() ->> 'email')
      and a.can_review_requests
  );
$$;

comment on function public.is_hrbmp_request_admin() is
  'True when the signed-in Supabase Auth email is in public.hrbmp_request_admins.';

grant execute on function public.is_hrbmp_request_admin() to authenticated;
grant select on public.hrbmp_data_requests to authenticated;
grant update (request_status) on public.hrbmp_data_requests to authenticated;

drop policy if exists "HRBMP admins can read data requests"
on public.hrbmp_data_requests;

create policy "HRBMP admins can read data requests"
on public.hrbmp_data_requests
for select
to authenticated
using ((select public.is_hrbmp_request_admin()));

drop policy if exists "HRBMP admins can update request status"
on public.hrbmp_data_requests;

create policy "HRBMP admins can update request status"
on public.hrbmp_data_requests
for update
to authenticated
using ((select public.is_hrbmp_request_admin()))
with check (
  (select public.is_hrbmp_request_admin())
  and request_status in ('submitted', 'reviewing', 'approved', 'declined')
);
