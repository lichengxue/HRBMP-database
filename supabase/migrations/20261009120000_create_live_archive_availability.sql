-- Publish availability metadata without granting access to source data/files.
create schema if not exists hrbmp_internal;
revoke all on schema hrbmp_internal from public, anon, authenticated;

create or replace view hrbmp_internal.archive_items as
with sample_metadata as (
  select s.sample_id, s.program, s.sample_date, s.river_mile,
    s.river_region_number, s.river_region_name, s.latitude, s.longitude,
    array_remove(array[
      case when s.water_temperature_c is not null then 'mean_temperature_c' end,
      case when s.dissolved_oxygen_mg_l is not null then 'mean_dissolved_oxygen_mg_l' end,
      case when s.conductivity_us_cm is not null then 'mean_conductivity_us_cm' end,
      case when s.ph is not null then 'mean_ph' end,
      case when s.turbidity is not null then 'mean_turbidity_ntu' end,
      case when s.sample_depth_m is not null then 'sampling_depth_m' end
    ], null) as available_variables
  from public.fjs_samples s
)
select 'count:' || st.sample_taxon_id::text as catalog_id,
  s.sample_id, s.program, s.sample_date, s.river_mile,
  s.river_region_number, s.river_region_name, s.latitude, s.longitude,
  st.taxon_code, t.common_name, t.scientific_name,
  'processed_abundance_count'::text as asset_kind,
  'processed_counts_by_sample_taxon.csv'::text as original_file_name,
  'text/csv'::text as mime_type, null::bigint as file_size_bytes,
  true as available, true as metadata_linked,
  array_remove(array[
    case when st.eggs_count is not null then 'Egg' end,
    case when st.yolk_sac_larvae_count is not null then 'Yolk-sac larvae' end,
    case when st.post_yolk_sac_larvae_count is not null then 'Post-yolk-sac larvae' end,
    case when st.young_of_year_count is not null or st.young_of_year_count_corrected is not null then 'Young of the year' end,
    case when st.yearling_count is not null or st.yearling_count_corrected is not null then 'Yearling' end
  ], null)::text[] as available_life_stages,
  '{}'::text[] as available_variables,
  null::text as life_stage_code,
  null::text as storage_bucket, null::text as storage_object_path,
  st.sample_taxon_id
from public.fjs_sample_taxa st
join sample_metadata s on s.sample_id = st.sample_id
join public.fjs_taxa t on t.taxon_code = st.taxon_code
union all
select case when o.id is null then 'asset:' || a.asset_id::text else 'upload:' || o.id::text end,
  s.sample_id, s.program, s.sample_date, s.river_mile,
  s.river_region_number, s.river_region_name, s.latitude, s.longitude,
  st.taxon_code, t.common_name, t.scientific_name,
  a.asset_kind::text, a.original_file_name, a.mime_type, a.file_size_bytes,
  o.id is not null, true, '{}'::text[], '{}'::text[], a.life_stage_code,
  a.storage_bucket, a.storage_object_path, a.sample_taxon_id
from public.fjs_assets a
join sample_metadata s on s.sample_id = a.sample_id
left join public.fjs_sample_taxa st on st.sample_taxon_id = a.sample_taxon_id
left join public.fjs_taxa t on t.taxon_code = st.taxon_code
left join storage.objects o on o.bucket_id = a.storage_bucket and o.name = a.storage_object_path
where a.storage_bucket = 'fjs-archive'
union all
select 'environment:' || s.sample_id,
  s.sample_id, s.program, s.sample_date, s.river_mile,
  s.river_region_number, s.river_region_name, s.latitude, s.longitude,
  null::integer, null::text, null::text,
  'environmental_data', 'environmental_data.csv', 'text/csv', null::bigint,
  true, true, '{}'::text[], s.available_variables, null::text,
  null::text, null::text, null::uuid
from sample_metadata s
where cardinality(s.available_variables) > 0
union all
-- Keep uploaded files visible even when their catalog import has not run yet.
select 'upload:' || o.id::text,
  s.sample_id, coalesce(s.program, 'FJS'), s.sample_date, s.river_mile,
  s.river_region_number, s.river_region_name, s.latitude, s.longitude,
  null::integer, null::text, null::text,
  'other', regexp_replace(o.name, '^.*/', ''), o.metadata ->> 'mimetype', null::bigint,
  true, false, '{}'::text[], '{}'::text[], null::text,
  o.bucket_id, o.name, null::uuid
from storage.objects o
left join sample_metadata s on o.name like 'samples/%' and s.sample_id = split_part(o.name, '/', 2)
where o.bucket_id = 'fjs-archive'
  and o.name not like 'request-packages/%'
  and o.name not like '%/'
  and not exists (
    select 1 from public.fjs_assets a
    where a.storage_bucket = o.bucket_id and a.storage_object_path = o.name
  );

revoke all on hrbmp_internal.archive_items from public, anon, authenticated;

create or replace function public.get_hrbmp_archive_availability(
  p_after text default '', p_limit integer default 500
)
returns jsonb
language sql stable security definer
set search_path = ''
as $$
  with page as (
    select i.* from hrbmp_internal.archive_items i
    where i.catalog_id collate "C" > coalesce(p_after, '') collate "C"
    order by i.catalog_id collate "C"
    limit least(greatest(coalesce(p_limit, 500), 1), 500) + 1
  ), visible as (
    select * from page order by catalog_id collate "C"
    limit least(greatest(coalesce(p_limit, 500), 1), 500)
  )
  select jsonb_build_object(
    'items', coalesce((select jsonb_agg(jsonb_build_object(
      'catalog_id', v.catalog_id,
      'sample_id', v.sample_id,
      'program', v.program,
      'sample_date', v.sample_date,
      'river_mile', v.river_mile,
      'river_region_number', v.river_region_number,
      'river_region_name', v.river_region_name,
      'latitude', v.latitude,
      'longitude', v.longitude,
      'taxon_code', v.taxon_code,
      'common_name', v.common_name,
      'scientific_name', v.scientific_name,
      'asset_kind', v.asset_kind,
      'original_file_name', v.original_file_name,
      'mime_type', v.mime_type,
      'file_size_bytes', v.file_size_bytes,
      'available', v.available,
      'metadata_linked', v.metadata_linked,
      'available_life_stages', v.available_life_stages,
      'available_variables', v.available_variables,
      'life_stage_code', v.life_stage_code
    ) order by v.catalog_id collate "C") from visible v), '[]'::jsonb),
    'has_more', (select count(*) from page) > least(greatest(coalesce(p_limit, 500), 1), 500)
  );
$$;

comment on function public.get_hrbmp_archive_availability(text, integer) is
  'Public availability for the full FJS archive, including private and unlinked uploads. Excludes source measurements, storage paths, and download URLs.';

revoke all on function public.get_hrbmp_archive_availability(text, integer) from public;
grant execute on function public.get_hrbmp_archive_availability(text, integer) to anon, authenticated, service_role;

-- Only the trusted delivery function may resolve requested IDs to source data.
create or replace function public.get_hrbmp_request_items(p_catalog_ids text[])
returns jsonb
language sql stable security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(to_jsonb(i) || jsonb_build_object(
    'young_of_year_count_corrected', st.young_of_year_count_corrected,
    'yearling_count_corrected', st.yearling_count_corrected,
    'older_count_corrected', st.older_count_corrected,
    'yearling_and_older_count_corrected', st.yearling_and_older_count_corrected,
    'total_count_corrected', st.total_count_corrected,
    'environmental_values', case when i.asset_kind = 'environmental_data' then jsonb_build_object(
      'water_temperature_c', s.water_temperature_c,
      'dissolved_oxygen_mg_l', s.dissolved_oxygen_mg_l,
      'conductivity_us_cm', s.conductivity_us_cm,
      'ph', s.ph,
      'turbidity', s.turbidity,
      'sample_depth_m', s.sample_depth_m
    ) else null end
  ) order by i.catalog_id collate "C"), '[]'::jsonb)
  from hrbmp_internal.archive_items i
  left join public.fjs_sample_taxa st on st.sample_taxon_id = i.sample_taxon_id
  left join public.fjs_samples s on s.sample_id = i.sample_id
  where i.catalog_id = any(p_catalog_ids) and i.available;
$$;

revoke all on function public.get_hrbmp_request_items(text[]) from public, anon, authenticated;
grant execute on function public.get_hrbmp_request_items(text[]) to service_role;

notify pgrst, 'reload schema';
