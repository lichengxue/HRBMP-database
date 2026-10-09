(function (root) {
  'use strict';

  const DATA_TYPES = {
    processed_abundance_count: 'Abundance/count data',
    representative_species_image: 'Fish image',
    jar_label_image: 'Jar label image',
    field_sheet_pdf: 'Field sheet',
    lab_sheet_pdf: 'Lab sheet',
    environmental_data: 'Environmental data',
    other: 'Other file'
  };
  const PROGRAM_NAMES = { FJS: 'Fall Juvenile Survey', LRS: 'Long River Survey', BSS: 'Beach Seine Survey' };

  function isPublishableKey(key) {
    if (typeof key !== 'string' || !key.trim()) return false;
    if (key.startsWith('sb_publishable_')) return true;
    try {
      const payload = JSON.parse(root.atob(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload.role === 'anon';
    } catch {
      return false;
    }
  }

  async function fetchAvailability(url, key, fetcher = root.fetch.bind(root)) {
    if (!isPublishableKey(key)) throw new Error('A Supabase publishable key is required.');
    const rows = [];
    const seen = new Set();
    let cursor = '';
    while (true) {
      const response = await fetcher(`${url.replace(/\/$/, '')}/rest/v1/rpc/get_hrbmp_archive_availability`, {
        method: 'POST',
        headers: { apikey: key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_after: cursor, p_limit: 500 }),
        signal: AbortSignal.timeout(20000)
      });
      if (!response.ok) {
        throw new Error(response.status === 404
          ? 'The archive availability endpoint has not been installed.'
          : `The archive could not be loaded (HTTP ${response.status}).`);
      }
      const page = await response.json();
      if (!Array.isArray(page.items) || typeof page.has_more !== 'boolean') {
        throw new Error('The archive returned an invalid response.');
      }
      for (const row of page.items) {
        if (typeof row.catalog_id !== 'string' || !row.catalog_id || seen.has(row.catalog_id)) {
          throw new Error('The archive returned duplicate or invalid item identifiers.');
        }
        seen.add(row.catalog_id);
        rows.push(normalizeItem(row));
      }
      if (!page.has_more) return rows;
      const next = page.items.at(-1)?.catalog_id;
      if (!next || next <= cursor) throw new Error('The archive pagination did not advance.');
      cursor = next;
    }
  }

  async function fetchPublishableKey(url, fetcher = root.fetch.bind(root)) {
    const response = await fetcher(`${url.replace(/\/$/, '')}/functions/v1/public-archive-config`, {
      signal: AbortSignal.timeout(15000), cache: 'no-store'
    });
    if (!response.ok) throw new Error('The archive connection is not configured.');
    const configuration = await response.json();
    if (!isPublishableKey(configuration.publishableKey)) throw new Error('The archive returned an invalid browser configuration.');
    return configuration.publishableKey;
  }

  function normalizeItem(row) {
    const [year, month, day] = String(row.sample_date || '').split('-').map(Number);
    const numberOrNull = (value) => value === null || value === undefined || value === '' ? null : Number(value);
    return {
      ...row,
      year: year || null,
      month: month || null,
      day: day || null,
      sample_year: year || null,
      latitude: numberOrNull(row.latitude),
      longitude: numberOrNull(row.longitude),
      river_mile: numberOrNull(row.river_mile),
      monitoring_program: PROGRAM_NAMES[row.program] || row.program || 'Unassigned',
      region: row.river_region_name || 'Unassigned',
      region_number: numberOrNull(row.river_region_number),
      region_code: row.river_region_code || '',
      station_id: row.sample_id || row.catalog_id,
      station_name: row.sample_id || 'Metadata pending',
      common_name: row.common_name || 'Species unassigned',
      display_kind: row.asset_kind,
      available: row.available === true,
      metadata_linked: row.metadata_linked === true,
      available_variables: Array.isArray(row.available_variables) ? row.available_variables : [],
      available_life_stages: Array.isArray(row.available_life_stages) ? row.available_life_stages : []
    };
  }

  function buildMapRows(items) {
    const biological = new Map();
    const environmental = [];
    for (const item of items) {
      if (!item.metadata_linked || !item.sample_id) continue;
      if (item.asset_kind === 'environmental_data') {
        environmental.push({ ...item, environmental_records: 1, availability_only: true });
        continue;
      }
      if (item.taxon_code === null || item.taxon_code === undefined) continue;
      const id = `${item.sample_id}|${item.taxon_code}`;
      const existing = biological.get(id);
      if (existing) {
        existing.available_life_stages = [...new Set([...existing.available_life_stages, ...item.available_life_stages])];
      } else {
        biological.set(id, { ...item, biological_records: 1, sampling_events: 1, availability_only: true });
      }
    }
    return { biological: [...biological.values()], environmental };
  }

  function requestItems(items) {
    return items.filter((item) => item.available);
  }

  function filterDatabaseItems(items, scope, filters = {}) {
    const matches = (value, selected) => !selected || selected === 'all' || String(value || '').toLowerCase() === String(selected).toLowerCase();
    const inRange = (value, start, end) => {
      const lower = start && start !== 'all' ? Number(start) : null;
      const upper = end && end !== 'all' ? Number(end) : null;
      if (lower === null && upper === null) return true;
      return value !== null && value !== undefined && (lower === null || value >= lower) && (upper === null || value <= upper);
    };
    return items.filter((item) => {
      if ((item.asset_kind === 'environmental_data') !== (scope === 'environmental')) return false;
      if (!matches(item.monitoring_program, filters.program) && !matches(item.program, filters.program)) return false;
      if (!matches(item.river_region_name, filters.region) || !matches(item.sample_id, filters.sample)) return false;
      if (!inRange(item.year, filters.yearStart, filters.yearEnd) || !inRange(item.month, filters.monthStart, filters.monthEnd) || !inRange(item.day, filters.dayStart, filters.dayEnd)) return false;
      if (scope === 'environmental') return !filters.variable || filters.variable === 'all' || item.available_variables.includes(filters.variable);
      if (!matches(item.common_name, filters.species) || !matches(item.asset_kind, filters.dataType)) return false;
      if (filters.lifeStage && filters.lifeStage !== 'all' && !item.available_life_stages.includes(filters.lifeStage)) return false;
      if (filters.availability === 'available' && !item.available) return false;
      if (filters.availability === 'awaiting_upload' && item.available) return false;
      if (filters.availability === 'metadata_pending' && (item.metadata_linked || !item.available)) return false;
      return true;
    });
  }

  root.HRBMPArchive = { DATA_TYPES, PROGRAM_NAMES, isPublishableKey, fetchPublishableKey, fetchAvailability, normalizeItem, buildMapRows, requestItems, filterDatabaseItems };
})(typeof window === 'undefined' ? globalThis : window);
