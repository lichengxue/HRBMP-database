-- Example: manually change FJS sample access levels in Supabase.
--
-- Where to run:
--   Supabase Dashboard -> SQL Editor -> New query
--
-- Why this updates 3 tables:
--   The GUI reads public.fjs_archive_catalog.
--   That catalog view combines:
--     1. public.fjs_samples
--        sample/event rows
--     2. public.fjs_sample_taxa
--        processed abundance/count rows
--     3. public.fjs_assets
--        representative fish images, jar labels, field sheets, and lab sheets
--
-- Access options:
--   'public'     = visible in the current GUI Demo tab
--   'restricted' = for authenticated users; current Demo tab does not fully show this yet
--   'private'    = hidden from the public GUI
--
-- Common sample_filter examples:
--   All 2018 samples:       sample_filter := '98_2018%';
--   One exact sample:       sample_filter := '98_20181022_1745';
--   All October 2018 rows:  sample_filter := '98_201810%';
--
-- Important:
--   This example makes only these request data types public for the chosen samples:
--     - Processed abundance/count data
--     - Representative fish images
--
--   These document/file types stay private by default:
--     - Jar labels
--     - Field sheets
--     - Lab sheets

begin;

-- EDIT THIS: choose 'public', 'restricted', or 'private' for counts and
-- representative fish images.
create temporary table _fjs_access_options (
  chosen_access public.archive_access_level,
  sample_filter text
) on commit drop;

-- EDIT THIS: choose which sample_id values should be updated.
-- The percent sign (%) means "anything after this text".
insert into _fjs_access_options
values ('public', '98_2018%');

-- Update sample/event rows.
update public.fjs_samples s
set access_level = o.chosen_access
from _fjs_access_options o
where s.sample_id like o.sample_filter;

-- Update processed abundance/count rows.
update public.fjs_sample_taxa st
set access_level = o.chosen_access
from _fjs_access_options o
where st.sample_id like o.sample_filter;

-- Update representative fish images.
update public.fjs_assets a
set access_level = o.chosen_access
from _fjs_access_options o
where a.sample_id like o.sample_filter
  and a.asset_kind = 'representative_species_image';

-- Keep jar labels, field sheets, and lab sheets private by default.
update public.fjs_assets a
set access_level = 'private'
from _fjs_access_options o
where a.sample_id like o.sample_filter
  and a.asset_kind in ('jar_label_image', 'field_sheet_pdf', 'lab_sheet_pdf');

-- Check what the GUI can see after the update.
-- Public rows should appear here with effective_access_level = 'public'.
select
  c.sample_id,
  c.effective_access_level,
  count(*) as rows
from public.fjs_archive_catalog c
cross join _fjs_access_options o
where c.sample_id like o.sample_filter
group by c.sample_id, c.effective_access_level
order by c.sample_id, c.effective_access_level;

-- Check each request data type for the chosen samples.
select
  st.sample_id,
  'processed_abundance_count' as request_data_type,
  st.access_level::text as access_level,
  count(*) as rows
from public.fjs_sample_taxa st
cross join _fjs_access_options o
where st.sample_id like o.sample_filter
group by st.sample_id, st.access_level
union all
select
  a.sample_id,
  a.asset_kind::text as request_data_type,
  a.access_level::text as access_level,
  count(*) as rows
from public.fjs_assets a
cross join _fjs_access_options o
where a.sample_id like o.sample_filter
  and a.asset_kind in (
    'representative_species_image',
    'jar_label_image',
    'field_sheet_pdf',
    'lab_sheet_pdf'
  )
group by a.sample_id, a.asset_kind, a.access_level
order by sample_id, request_data_type, access_level;

commit;
