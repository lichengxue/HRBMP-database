-- Public data request intake table for HRBMP demo workflows.
--
-- This table lets the static GUI submit request forms through the Supabase
-- REST API using a publishable key. Public users can insert new requests but
-- cannot read the request queue.

create table if not exists public.hrbmp_data_requests (
  request_id uuid primary key default gen_random_uuid(),
  request_scope text not null default 'fjs_archive_demo',
  request_status text not null default 'submitted',
  admin_email text not null default 'chengxue.li@stonybrook.edu',
  requester_name text not null,
  requester_email text not null,
  requester_affiliation text,
  intended_use text,
  request_notes text,
  selected_program text,
  selected_species text,
  selected_region text,
  selected_sample_id text,
  year_start integer,
  year_end integer,
  requested_data_types text[] not null default '{}',
  matching_row_count integer not null default 0,
  public_row_count integer not null default 0,
  request_summary text,
  request_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hrbmp_data_requests_status_check check (
    request_status in ('submitted', 'reviewing', 'approved', 'packaging', 'ready', 'delivered', 'declined')
  ),
  constraint hrbmp_data_requests_scope_check check (
    request_scope in ('fjs_archive_demo', 'biological_data', 'environmental_data', 'image_archive', 'all_data')
  ),
  constraint hrbmp_data_requests_email_check check (
    requester_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  ),
  constraint hrbmp_data_requests_nonnegative_counts check (
    matching_row_count >= 0 and public_row_count >= 0
  )
);

comment on table public.hrbmp_data_requests is
  'Submitted HRBMP data requests from the public GUI. Public clients can insert but not read records.';
comment on column public.hrbmp_data_requests.request_payload is
  'Full structured request payload, including filters and a preview manifest.';

drop trigger if exists hrbmp_data_requests_set_updated_at on public.hrbmp_data_requests;

create trigger hrbmp_data_requests_set_updated_at
before update on public.hrbmp_data_requests
for each row execute function public.set_updated_at();

alter table public.hrbmp_data_requests enable row level security;

grant insert on public.hrbmp_data_requests to anon, authenticated;

drop policy if exists "Public can submit HRBMP data requests"
on public.hrbmp_data_requests;

create policy "Public can submit HRBMP data requests"
on public.hrbmp_data_requests
for insert
to anon, authenticated
with check (
  request_status = 'submitted'
  and admin_email = 'chengxue.li@stonybrook.edu'
  and length(trim(requester_name)) > 0
  and length(trim(requester_email)) > 0
);
