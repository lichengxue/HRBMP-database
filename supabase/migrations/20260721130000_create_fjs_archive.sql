-- Fall Juvenile Survey archive schema for Supabase/PostgreSQL.
-- Binary files live in Supabase Storage; PostgreSQL stores searchable metadata.

create extension if not exists pgcrypto;

do $$
begin
  create type public.archive_access_level as enum ('private', 'restricted', 'public');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.fjs_asset_kind as enum (
    'jar_label_image',
    'representative_species_image',
    'field_sheet_pdf',
    'lab_sheet_pdf',
    'other'
  );
exception
  when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.fjs_import_batches (
  batch_id uuid primary key default gen_random_uuid(),
  batch_name text not null unique,
  source_root text,
  processed_csv_file text,
  data_dictionary_file text,
  notes text,
  created_at timestamptz not null default now()
);

comment on table public.fjs_import_batches is
  'Provenance records for Fall Juvenile Survey archive imports.';

create table if not exists public.fjs_samples (
  sample_id text primary key,
  program text not null default 'FJS',
  task_code integer not null,
  sample_number integer not null,
  sample_date date not null,
  sample_time time,
  year integer,
  month integer,
  site_code text,
  river_mile numeric,
  river_region_number integer,
  river_region_name text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  gear_code text,
  vessel_code text,
  wave_height numeric,
  tide_stage text,
  river_run text,
  river_depth numeric,
  tow_speed numeric,
  sample_depth_m numeric,
  volume_water_sampled_cubic_meters numeric,
  duration_minutes numeric,
  net_mesh numeric,
  net_length_opening_width_ratio numeric,
  flowmeter_number text,
  flowmeter_start numeric,
  flowmeter_end numeric,
  flowmeter_difference numeric,
  water_temperature_c numeric,
  dissolved_oxygen_mg_l numeric,
  ph numeric,
  conductivity_us_cm numeric,
  turbidity numeric,
  water_quality_sample_depth numeric,
  day_night text,
  source_csv_name text,
  raw_event jsonb not null default '{}'::jsonb,
  access_level public.archive_access_level not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fjs_samples_unique_source_key unique (program, task_code, sample_number, sample_date),
  constraint fjs_samples_latitude_range check (latitude is null or latitude between -90 and 90),
  constraint fjs_samples_longitude_range check (longitude is null or longitude between -180 and 180)
);

comment on table public.fjs_samples is
  'One Fall Juvenile Survey sampling event/sample jar represented in the archive.';
comment on column public.fjs_samples.sample_id is
  'Readable stable key, e.g. 98_20171023_1591.';
comment on column public.fjs_samples.raw_event is
  'JSON copy of source event-level fields retained for auditability.';

create trigger fjs_samples_set_updated_at
before update on public.fjs_samples
for each row execute function public.set_updated_at();

create table if not exists public.fjs_taxa (
  taxon_code integer primary key,
  common_name text not null,
  scientific_name text,
  taxonomic_group text default 'fish',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.fjs_taxa is
  'Taxonomic lookup table for FJS fish and other taxa.';

create trigger fjs_taxa_set_updated_at
before update on public.fjs_taxa
for each row execute function public.set_updated_at();

create table if not exists public.fjs_sample_taxa (
  sample_taxon_id uuid primary key default gen_random_uuid(),
  sample_id text not null references public.fjs_samples(sample_id) on delete cascade,
  taxon_code integer not null references public.fjs_taxa(taxon_code),
  source_record_id text,
  source_row_number integer,
  eggs_count integer,
  yolk_sac_larvae_count integer,
  post_yolk_sac_larvae_count integer,
  young_of_year_count integer,
  unidentified_count integer,
  older_count integer,
  yearling_count integer,
  yearling_and_older_count integer,
  young_of_year_count_corrected integer,
  yearling_count_corrected integer,
  older_count_corrected integer,
  yearling_and_older_count_corrected integer,
  total_count_corrected integer generated always as (
    coalesce(young_of_year_count_corrected, 0) +
    coalesce(yearling_count_corrected, 0) +
    coalesce(older_count_corrected, 0) +
    coalesce(yearling_and_older_count_corrected, 0)
  ) stored,
  total_length_class_1 integer,
  total_length_class_2 integer,
  total_length_class_3 integer,
  total_length_class_4 integer,
  division_1_cutoff_mm numeric,
  division_2_cutoff_mm numeric,
  catch_code text,
  use_code text,
  sample_narrative text,
  raw_record jsonb not null default '{}'::jsonb,
  access_level public.archive_access_level not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fjs_sample_taxa_unique_taxon_per_sample unique (sample_id, taxon_code),
  constraint fjs_sample_taxa_nonnegative_counts check (
    coalesce(eggs_count, 0) >= 0 and
    coalesce(yolk_sac_larvae_count, 0) >= 0 and
    coalesce(post_yolk_sac_larvae_count, 0) >= 0 and
    coalesce(young_of_year_count, 0) >= 0 and
    coalesce(unidentified_count, 0) >= 0 and
    coalesce(older_count, 0) >= 0 and
    coalesce(yearling_count, 0) >= 0 and
    coalesce(yearling_and_older_count, 0) >= 0 and
    coalesce(young_of_year_count_corrected, 0) >= 0 and
    coalesce(yearling_count_corrected, 0) >= 0 and
    coalesce(older_count_corrected, 0) >= 0 and
    coalesce(yearling_and_older_count_corrected, 0) >= 0
  )
);

comment on table public.fjs_sample_taxa is
  'Processed FJS count records by sample and taxon/species.';
comment on column public.fjs_sample_taxa.total_count_corrected is
  'Generated total from corrected YOY, yearling, older, and yearling-and-older counts.';
comment on column public.fjs_sample_taxa.raw_record is
  'JSON copy of the original processed CSV row retained for auditability.';

create trigger fjs_sample_taxa_set_updated_at
before update on public.fjs_sample_taxa
for each row execute function public.set_updated_at();

create table if not exists public.fjs_representative_specimens (
  representative_id uuid primary key default gen_random_uuid(),
  sample_taxon_id uuid not null references public.fjs_sample_taxa(sample_taxon_id) on delete cascade,
  sample_id text not null,
  taxon_code integer not null,
  representative_label text,
  notes text,
  created_at timestamptz not null default now(),
  constraint fjs_representative_one_per_sample_taxon unique (sample_taxon_id),
  constraint fjs_representative_sample_taxon_match foreign key (sample_id, taxon_code)
    references public.fjs_sample_taxa(sample_id, taxon_code) on delete cascade
);

comment on table public.fjs_representative_specimens is
  'One representative fish/specimen per sample and taxon. Multiple image assets may point to the same representative.';

create table if not exists public.fjs_assets (
  asset_id uuid primary key default gen_random_uuid(),
  sample_id text not null references public.fjs_samples(sample_id) on delete cascade,
  sample_taxon_id uuid references public.fjs_sample_taxa(sample_taxon_id) on delete set null,
  representative_id uuid references public.fjs_representative_specimens(representative_id) on delete set null,
  asset_kind public.fjs_asset_kind not null,
  storage_bucket text not null default 'fjs-archive',
  storage_object_path text not null,
  original_file_name text not null,
  local_source_path text,
  mime_type text,
  file_size_bytes bigint,
  sha256 text,
  life_stage_code text,
  specimen_number integer,
  orientation_code text,
  orientation_name text,
  image_view text,
  source_sequence integer,
  sheet_code text,
  notes text,
  access_level public.archive_access_level not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fjs_assets_unique_storage_object unique (storage_bucket, storage_object_path),
  constraint fjs_assets_unique_source_file_per_sample unique (sample_id, asset_kind, original_file_name),
  constraint fjs_assets_nonnegative_size check (file_size_bytes is null or file_size_bytes >= 0),
  constraint fjs_assets_sha256_format check (sha256 is null or sha256 ~ '^[0-9a-f]{64}$'),
  constraint fjs_assets_life_stage_code_format check (life_stage_code is null or life_stage_code ~ '^[0-9]{2}$'),
  constraint fjs_assets_specimen_number_positive check (specimen_number is null or specimen_number > 0),
  constraint fjs_assets_orientation_code_format check (orientation_code is null or orientation_code ~ '^[0-9]{2}$'),
  constraint fjs_assets_representative_requires_taxon check (
    asset_kind <> 'representative_species_image' or sample_taxon_id is not null
  )
);

comment on table public.fjs_assets is
  'Archive catalog for FJS JPG and PDF files stored in Supabase Storage.';
comment on column public.fjs_assets.storage_object_path is
  'Object path inside the Supabase Storage bucket, e.g. samples/98_20171023_1591/representative_species_image/file.JPG.';
comment on column public.fjs_assets.sha256 is
  'Checksum used to detect duplicate, replaced, or corrupted files.';
comment on column public.fjs_assets.life_stage_code is
  'Two-digit life-stage code from fish photo filename.';
comment on column public.fjs_assets.specimen_number is
  'Representative fish/specimen number from fish photo filename.';
comment on column public.fjs_assets.orientation_code is
  'Two-digit fish-orientation code from fish photo filename.';
comment on column public.fjs_assets.orientation_name is
  'Readable orientation label when known: left_side, right_side, top_down, or bottom_up.';

create trigger fjs_assets_set_updated_at
before update on public.fjs_assets
for each row execute function public.set_updated_at();

create table if not exists public.fjs_variable_dictionary (
  variable_name text primary key,
  full_name text,
  fjs_level text,
  unit text,
  description text,
  source_file_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.fjs_variable_dictionary is
  'Imported FJS data dictionary variable definitions.';

create trigger fjs_variable_dictionary_set_updated_at
before update on public.fjs_variable_dictionary
for each row execute function public.set_updated_at();

create table if not exists public.fjs_variable_code_options (
  variable_name text not null references public.fjs_variable_dictionary(variable_name) on delete cascade,
  code_value text not null,
  code_description text,
  source_file_name text,
  created_at timestamptz not null default now(),
  primary key (variable_name, code_value)
);

comment on table public.fjs_variable_code_options is
  'Coded-value lookups from the FJS data dictionary.';

create index if not exists idx_fjs_samples_date on public.fjs_samples(sample_date);
create index if not exists idx_fjs_samples_region on public.fjs_samples(river_region_number);
create index if not exists idx_fjs_samples_access_level on public.fjs_samples(access_level);
create index if not exists idx_fjs_sample_taxa_sample_id on public.fjs_sample_taxa(sample_id);
create index if not exists idx_fjs_sample_taxa_taxon_code on public.fjs_sample_taxa(taxon_code);
create index if not exists idx_fjs_sample_taxa_access_level on public.fjs_sample_taxa(access_level);
create index if not exists idx_fjs_assets_sample_id on public.fjs_assets(sample_id);
create index if not exists idx_fjs_assets_sample_taxon_id on public.fjs_assets(sample_taxon_id);
create index if not exists idx_fjs_assets_kind on public.fjs_assets(asset_kind);
create index if not exists idx_fjs_assets_access_level on public.fjs_assets(access_level);
create index if not exists idx_fjs_assets_sha256 on public.fjs_assets(sha256);

create or replace view public.fjs_archive_catalog
with (security_invoker = true) as
select
  s.sample_id,
  s.program,
  s.task_code,
  s.sample_number,
  s.sample_date,
  s.sample_time,
  s.river_mile,
  s.river_region_number,
  s.river_region_name,
  s.latitude,
  s.longitude,
  st.sample_taxon_id,
  t.taxon_code,
  t.common_name,
  t.scientific_name,
  st.young_of_year_count_corrected,
  st.yearling_count_corrected,
  st.older_count_corrected,
  st.yearling_and_older_count_corrected,
  st.total_count_corrected,
  a.asset_id,
  a.asset_kind,
  a.storage_bucket,
  a.storage_object_path,
  a.original_file_name,
  a.mime_type,
  a.file_size_bytes,
  a.sha256,
  a.life_stage_code,
  a.specimen_number,
  a.orientation_code,
  a.orientation_name,
  a.image_view,
  a.sheet_code,
  least(
    s.access_level,
    coalesce(st.access_level, s.access_level),
    coalesce(a.access_level, s.access_level)
  ) as effective_access_level
from public.fjs_samples s
left join public.fjs_sample_taxa st on st.sample_id = s.sample_id
left join public.fjs_taxa t on t.taxon_code = st.taxon_code
left join public.fjs_assets a on a.sample_id = s.sample_id
  and (a.sample_taxon_id = st.sample_taxon_id or a.sample_taxon_id is null);

comment on view public.fjs_archive_catalog is
  'Convenience view joining FJS samples, counts, taxa, and archive assets.';

-- Create a private Supabase Storage bucket for FJS files.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fjs-archive',
  'fjs-archive',
  false,
  52428800,
  array['image/jpeg', 'application/pdf', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.fjs_import_batches enable row level security;
alter table public.fjs_samples enable row level security;
alter table public.fjs_taxa enable row level security;
alter table public.fjs_sample_taxa enable row level security;
alter table public.fjs_representative_specimens enable row level security;
alter table public.fjs_assets enable row level security;
alter table public.fjs_variable_dictionary enable row level security;
alter table public.fjs_variable_code_options enable row level security;

grant select on public.fjs_samples to anon, authenticated;
grant select on public.fjs_taxa to anon, authenticated;
grant select on public.fjs_sample_taxa to anon, authenticated;
grant select on public.fjs_representative_specimens to anon, authenticated;
grant select on public.fjs_assets to anon, authenticated;
grant select on public.fjs_variable_dictionary to anon, authenticated;
grant select on public.fjs_variable_code_options to anon, authenticated;
grant select on public.fjs_archive_catalog to anon, authenticated;

create policy "Public can read public FJS samples"
on public.fjs_samples
for select
to anon, authenticated
using (access_level = 'public');

create policy "Authenticated users can read restricted FJS samples"
on public.fjs_samples
for select
to authenticated
using (access_level in ('public', 'restricted'));

create policy "Public can read FJS taxa"
on public.fjs_taxa
for select
to anon, authenticated
using (true);

create policy "Public can read public FJS sample taxa"
on public.fjs_sample_taxa
for select
to anon, authenticated
using (access_level = 'public');

create policy "Authenticated users can read restricted FJS sample taxa"
on public.fjs_sample_taxa
for select
to authenticated
using (access_level in ('public', 'restricted'));

create policy "Public can read public FJS representatives"
on public.fjs_representative_specimens
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.fjs_sample_taxa st
    where st.sample_taxon_id = fjs_representative_specimens.sample_taxon_id
      and st.access_level = 'public'
  )
);

create policy "Authenticated users can read restricted FJS representatives"
on public.fjs_representative_specimens
for select
to authenticated
using (
  exists (
    select 1
    from public.fjs_sample_taxa st
    where st.sample_taxon_id = fjs_representative_specimens.sample_taxon_id
      and st.access_level in ('public', 'restricted')
  )
);

create policy "Public can read public FJS assets"
on public.fjs_assets
for select
to anon, authenticated
using (access_level = 'public');

create policy "Authenticated users can read restricted FJS assets"
on public.fjs_assets
for select
to authenticated
using (access_level in ('public', 'restricted'));

create policy "Public can read FJS variable dictionary"
on public.fjs_variable_dictionary
for select
to anon, authenticated
using (true);

create policy "Public can read FJS variable code options"
on public.fjs_variable_code_options
for select
to anon, authenticated
using (true);

create policy "Public can read public FJS archive storage objects"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'fjs-archive'
  and exists (
    select 1
    from public.fjs_assets a
    where a.storage_bucket = storage.objects.bucket_id
      and a.storage_object_path = storage.objects.name
      and a.access_level = 'public'
  )
);

create policy "Authenticated users can read restricted FJS archive storage objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'fjs-archive'
  and exists (
    select 1
    from public.fjs_assets a
    where a.storage_bucket = storage.objects.bucket_id
      and a.storage_object_path = storage.objects.name
      and a.access_level in ('public', 'restricted')
  )
);
