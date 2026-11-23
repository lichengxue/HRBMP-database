(function (root) {
  'use strict';

  const DATA_TYPES = {
    processed_abundance_count: 'Abundance/count data',
    representative_species_image: 'Fish image',
    jar_label_image: 'Jar label image',
    field_sheet_pdf: 'Field sheet',
    lab_sheet_pdf: 'Lab sheet',
    environmental_data: 'Environmental data',
    other: 'Unclassified file'
  };
  const PROGRAM_NAMES = { FJS: 'Fall Juvenile Survey', LRS: 'Long River Survey', BSS: 'Beach Seine Survey' };
  const DATA_TYPE_GROUPS = {
    processed_abundance_count: 'Abundance / Counts',
    representative_species_image: 'Fish Images',
    jar_label_image: 'Jar Label Images',
    field_sheet_pdf: 'Field Sheets',
    lab_sheet_pdf: 'Lab Sheets',
    environmental_data: 'Environmental Data',
    other: 'Unclassified Files'
  };

  const PUBLIC_ASSET_KINDS = new Set(['processed_abundance_count', 'representative_species_image', 'environmental_data']);
  function isPublicCatalogItem(item) {
    return item.metadata_linked === true && PUBLIC_ASSET_KINDS.has(item.asset_kind) && !isFolderPlaceholder(item);
  }
  function isFolderPlaceholder(item) {
    return String(item.original_file_name || '').split('/').at(-1) === '.emptyFolderPlaceholder';
  }
  function searchItems(items, query = '') {
    const words = String(query).trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return items;
    return items.filter((item) => {
      const text = [item.sample_id, item.sample_date, item.common_name, item.scientific_name,
        item.original_file_name, item.program, item.monitoring_program, item.river_region_name,
        DATA_TYPES[item.asset_kind], ...(item.available_variables || [])].join(' ').toLowerCase();
      return words.every((word) => text.includes(word));
    });
  }
  function resultPage(total, page, size = 25) {
    size = [25, 50, 100].includes(Number(size)) ? Number(size) : 25;
    const pages = Math.max(1, Math.ceil(total / size));
    page = Number.isFinite(Number(page)) ? Math.max(0, Math.min(Math.trunc(Number(page)), pages - 1)) : 0;
    return { page, size, pages, start: page * size, end: Math.min((page + 1) * size, total) };
  }
  function fileDescription(item) {
    const name = item.original_file_name || '';
    const mime = item.mime_type || '';
    if (/jpe?g$/i.test(name) || mime === 'image/jpeg') return 'JPEG image';
    if (/\.pdf$/i.test(name) || mime === 'application/pdf') return 'PDF document';
    if (/^image\//i.test(mime)) return 'Image';
    return mime && mime !== 'application/octet-stream' ? mime : 'File format not assigned';
  }

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
        if (isPublicCatalogItem(row)) rows.push(normalizeItem(row));
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
    for (const item of items.filter(isPublicCatalogItem)) {
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
    return items.filter((item) => item.available && isPublicCatalogItem(item));
  }

  function groupItemsByDataType(items) {
    const groups = new Map();
    const order = Object.keys(DATA_TYPE_GROUPS);
    for (const item of items.filter(isPublicCatalogItem)) {
      const kind = item.asset_kind || 'other';
      if (!groups.has(kind)) groups.set(kind, {
        kind, label: DATA_TYPE_GROUPS[kind] || DATA_TYPES[kind] || kind,
        items: [], availableCount: 0, awaitingUploadCount: 0
      });
      const group = groups.get(kind);
      group.items.push(item);
      if (item.available) group.availableCount += 1;
      else group.awaitingUploadCount += 1;
    }
    const rank = (kind) => order.includes(kind) ? order.indexOf(kind) : order.length;
    return [...groups.values()].sort((a, b) => rank(a.kind) - rank(b.kind) || a.label.localeCompare(b.label));
  }

  function isImageItem(item) {
    if (!isPublicCatalogItem(item)) return false;
    return /^image\//i.test(item.mime_type || '')
      || ['representative_species_image', 'jar_label_image'].includes(item.asset_kind)
      || /\.(avif|bmp|gif|heic|heif|jpe?g|png|svg|tiff?|webp)$/i.test(item.original_file_name || '');
  }

  function filterImageItems(items, filters = {}) {
    return filterDatabaseItems(items.filter(isImageItem), 'biological', filters);
  }

  function buildImageMapRows(items) {
    const samples = new Map();
    for (const item of items.filter(isImageItem)) {
      if (!item.metadata_linked || !item.sample_id
        || !Number.isFinite(item.latitude) || !Number.isFinite(item.longitude)
        || Math.abs(item.latitude) > 90 || Math.abs(item.longitude) > 180) continue;
      let sample = samples.get(item.sample_id);
      if (!sample) {
        sample = { ...item, image_count: 0, missing_image_count: 0, image_items: [] };
        samples.set(item.sample_id, sample);
      }
      sample.image_count += item.available ? 1 : 0;
      sample.missing_image_count += item.available ? 0 : 1;
      sample.image_items.push(item);
    }
    return [...samples.values()];
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
      if (!isPublicCatalogItem(item)) return false;
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

  root.HRBMPArchive = { DATA_TYPES, DATA_TYPE_GROUPS, PROGRAM_NAMES, isPublicCatalogItem, isFolderPlaceholder, searchItems, resultPage, fileDescription, isPublishableKey, fetchPublishableKey, fetchAvailability, normalizeItem, buildMapRows, buildImageMapRows, isImageItem, filterImageItems, groupItemsByDataType, requestItems, filterDatabaseItems };
})(typeof window === 'undefined' ? globalThis : window);
