/* Cache public availability metadata only; never credentials, requests or file contents. */
(function (root) {
  'use strict';
  const VERSION = 2;
  const MAX_AGE = 60 * 60 * 1000;
  const PUBLIC_FIELDS = ['catalog_id', 'sample_id', 'program', 'sample_date', 'river_mile',
    'river_region_number', 'river_region_name', 'latitude', 'longitude', 'taxon_code',
    'common_name', 'scientific_name', 'asset_kind', 'original_file_name', 'mime_type',
    'file_size_bytes', 'available', 'metadata_linked', 'available_life_stages',
    'available_variables', 'life_stage_code'];
  const sourceKey = (url) => new URL(url).origin;
  const validDate = (value) => typeof value === 'string' && Number.isFinite(Date.parse(value));
  function validEntry(entry, url) {
    return entry?.version === VERSION && entry.source === sourceKey(url) && validDate(entry.fetchedAt);
  }
  function isFresh(entry, now = Date.now()) {
    const age = now - Date.parse(entry?.fetchedAt);
    return Number.isFinite(age) && age >= 0 && age < MAX_AGE;
  }
  function readSnapshot(url, storage) {
    try {
      const entry = JSON.parse((storage || root.localStorage).getItem('hrbmp:snapshot:' + sourceKey(url)));
      if (!validEntry(entry, url) || !['stations', 'sampling_events', 'taxa', 'observations']
        .every((key) => Number.isSafeInteger(entry.counts?.[key]) && entry.counts[key] >= 0)) return null;
      return entry;
    } catch { return null; }
  }
  function writeSnapshot(url, counts, fetchedAt, storage) {
    try {
      const publicCounts = Object.fromEntries(['stations', 'sampling_events', 'taxa', 'observations'].map((key) => [key, counts[key]]));
      const entry = { version: VERSION, source: sourceKey(url), fetchedAt, counts: publicCounts };
      if (!validEntry(entry, url) || !Object.values(publicCounts).every((value) => Number.isSafeInteger(value) && value >= 0)) return null;
      (storage || root.localStorage).setItem('hrbmp:snapshot:' + sourceKey(url), JSON.stringify(entry));
      return entry;
    } catch { return null; }
  }
  function publicItems(rows) {
    return rows.filter((row) => root.HRBMPArchive.isPublicCatalogItem(row)).map((row) => Object.fromEntries(PUBLIC_FIELDS.filter((key) => Object.hasOwn(row, key))
      .map((key) => [key, row[key]])));
  }
  function validCatalog(entry, url) {
    if (!validEntry(entry, url) || !Array.isArray(entry.items)) return false;
    const ids = new Set();
    return entry.items.every((item) => {
      if (typeof item?.catalog_id !== 'string' || !item.catalog_id || ids.has(item.catalog_id)
        || typeof item.available !== 'boolean' || typeof item.metadata_linked !== 'boolean') return false;
      ids.add(item.catalog_id);
      return true;
    });
  }
  // One object contains the complete catalog; an interrupted write cannot save half a catalog.
  function databaseOperation(mode, source, entry) {
    return new Promise((resolve) => {
      let db, transaction, settled = false, value = null;
      const finish = (result) => {
        if (settled) return;
        settled = true;
        root.clearTimeout(timer);
        db?.close();
        resolve(result);
      };
      const timer = root.setTimeout(() => { try { transaction?.abort(); } catch {} finish(null); }, 4000);
      try {
        if (!root.indexedDB) { finish(null); return; }
        const opening = root.indexedDB.open('hrbmp-public-availability', VERSION);
        opening.onupgradeneeded = () => {
          const database = opening.result;
          if (!database.objectStoreNames.contains('catalogs')) database.createObjectStore('catalogs');
        };
        opening.onerror = opening.onblocked = () => finish(null);
        opening.onsuccess = () => {
          db = opening.result;
          if (settled) { db.close(); return; }
          db.onversionchange = () => db.close();
          try {
            transaction = db.transaction('catalogs', mode);
            const store = transaction.objectStore('catalogs');
            const request = mode === 'readonly' ? store.get(source) : store.put(entry, source);
            request.onsuccess = () => { value = mode === 'readonly' ? request.result : true; };
            transaction.oncomplete = () => finish(value);
            transaction.onerror = transaction.onabort = () => finish(null);
          } catch { finish(null); }
        };
      } catch { finish(null); }
    });
  }
  async function readCatalog(url) {
    const entry = await databaseOperation('readonly', sourceKey(url));
    return validCatalog(entry, url) ? { ...entry, items: publicItems(entry.items) } : null;
  }
  async function writeCatalog(url, rows, fetchedAt) {
    const entry = { version: VERSION, source: sourceKey(url), fetchedAt, items: publicItems(rows) };
    if (!validCatalog(entry, url)) return false;
    return Boolean(await databaseOperation('readwrite', sourceKey(url), entry));
  }
  root.HRBMPArchiveCache = { MAX_AGE, isFresh, readSnapshot, writeSnapshot, readCatalog, writeCatalog, publicItems };
})(typeof window === 'undefined' ? globalThis : window);
