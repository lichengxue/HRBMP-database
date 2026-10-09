const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { stripTypeScriptTypes } = require('node:module');
require('../gui/archive.js');

const archive = globalThis.HRBMPArchive;
const publicTestKey = 'sb_publishable_' + 'test_fixture';
const item = (index, extra = {}) => ({
  catalog_id: `upload:${String(index).padStart(6, '0')}`, sample_id: 'TEST_SAMPLE',
  sample_date: '2024-10-03', program: 'FJS', common_name: 'TEST SPECIES',
  taxon_code: 1, asset_kind: 'representative_species_image',
  available: true, metadata_linked: true, ...extra
});

test('loads the full archive across more than 1,000 rows', async () => {
  const data = Array.from({ length: 1503 }, (_, index) => item(index));
  const cursors = [];
  const rows = await archive.fetchAvailability('https://example.supabase.co', publicTestKey, async (_url, options) => {
    const body = JSON.parse(options.body);
    cursors.push(body.p_after);
    const remaining = data.filter((row) => row.catalog_id > body.p_after);
    return { ok: true, json: async () => ({ items: remaining.slice(0, 500), has_more: remaining.length > 500 }) };
  });
  assert.equal(rows.length, 1503);
  assert.equal(cursors.length, 4);
  assert.equal(rows.at(-1).catalog_id, data.at(-1).catalog_id);
});

test('fails visibly on a missing endpoint, invalid response, or repeated page', async () => {
  await assert.rejects(archive.fetchAvailability('https://example.supabase.co', publicTestKey, async () => ({ ok: false, status: 404 })), /not been installed/);
  await assert.rejects(archive.fetchAvailability('https://example.supabase.co', publicTestKey, async () => ({ ok: true, json: async () => ({}) })), /invalid response/);
  await assert.rejects(archive.fetchAvailability('https://example.supabase.co', publicTestKey, async () => ({ ok: true, json: async () => ({ items: [item(1)], has_more: true }) })), /duplicate/);
});

test('rejects privileged keys and accepts only the anon legacy role', () => {
  const jwt = (role) => `test.${Buffer.from(JSON.stringify({ role })).toString('base64url')}.test`;
  assert.equal(archive.isPublishableKey(publicTestKey), true);
  assert.equal(archive.isPublishableKey(jwt('anon')), true);
  assert.equal(archive.isPublishableKey(jwt('service_role')), false);
  assert.equal(archive.isPublishableKey('sb_secret_' + 'test_fixture'), false);
});

test('automatic configuration rejects a privileged key returned by the server', async () => {
  const key = await archive.fetchPublishableKey('https://example.supabase.co', async () => ({ ok: true, json: async () => ({ publishableKey: publicTestKey }) }));
  assert.equal(key, publicTestKey);
  await assert.rejects(archive.fetchPublishableKey('https://example.supabase.co', async () => ({ ok: true, json: async () => ({ publishableKey: 'sb_secret_' + 'test_fixture' }) })), /invalid browser configuration/);
});

test('public configuration function returns only browser keys', async () => {
  const source = stripTypeScriptTypes(fs.readFileSync('supabase/functions/public-archive-config/index.ts', 'utf8'), { mode: 'strip' });
  function configurationHandler(managedKeys) {
    const context = vm.createContext({ Request, Response, atob, Deno: {
      env: { get: (key) => key === 'SUPABASE_PUBLISHABLE_KEYS' ? JSON.stringify(managedKeys) : undefined },
      serve: (handler) => { context.handler = handler; }
    } });
    vm.runInContext(source, context);
    return context.handler;
  }
  const request = new Request('https://example.supabase.co/functions/v1/public-archive-config');
  const response = configurationHandler({ default: publicTestKey })(request);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { publishableKey: publicTestKey });
  const rejected = configurationHandler({ default: 'sb_secret_' + 'test_fixture' })(request);
  assert.equal(rejected.status, 503);
  assert.equal(configurationHandler({ default: publicTestKey })(new Request(request.url, { method: 'POST' })).status, 405);
});

test('does not synthesize coordinates, measurements, or species for unlinked uploads', () => {
  const normalized = archive.normalizeItem(item(1, { latitude: null, longitude: null, river_mile: null }));
  assert.equal(normalized.latitude, null);
  assert.equal(normalized.longitude, null);
  assert.equal(normalized.river_mile, null);
  const rows = [normalized, archive.normalizeItem(item(2, { asset_kind: 'processed_abundance_count' })), archive.normalizeItem(item(3, { metadata_linked: false })), archive.normalizeItem(item(4, { asset_kind: 'environmental_data', available_variables: ['mean_temperature_c'] }))];
  const maps = archive.buildMapRows(rows);
  assert.equal(maps.biological.length, 1);
  assert.equal(maps.environmental.length, 1);
  assert.equal(maps.environmental[0].mean_temperature_c, undefined);
  assert.equal(archive.requestItems([normalized, { available: false }]).length, 1);
});

test('biological filters select real records/files by species, location, date, type, and life-stage coverage', () => {
  const rows = [
    archive.normalizeItem(item(1, { sample_id: 'S1', river_region_name: 'Battery', asset_kind: 'processed_abundance_count', available_life_stages: ['Yearling'] })),
    archive.normalizeItem(item(2, { sample_id: 'S1', river_region_name: 'Battery' })),
    archive.normalizeItem(item(3, { sample_id: 'S2', river_region_name: 'Albany', sample_date: '2023-10-03' })),
    archive.normalizeItem(item(4, { asset_kind: 'environmental_data', available_variables: ['mean_temperature_c'] }))
  ];
  const filters = { program: 'Fall Juvenile Survey', species: 'TEST SPECIES', region: 'Battery', sample: 'S1', yearStart: '2024', yearEnd: '2024', monthStart: '10', dayEnd: '03' };
  assert.equal(archive.filterDatabaseItems(rows, 'biological', filters).length, 2);
  assert.deepEqual(archive.filterDatabaseItems(rows, 'biological', { ...filters, dataType: 'processed_abundance_count', lifeStage: 'Yearling' }).map(row => row.catalog_id), [rows[0].catalog_id]);
  assert.equal(archive.filterDatabaseItems(rows, 'biological', { ...filters, dayStart: '04' }).length, 0);
});

test('environmental filters show only samples with the requested recorded variable without exposing values', () => {
  const rows = [
    archive.normalizeItem(item(1, { sample_id: 'S1', asset_kind: 'environmental_data', available_variables: ['mean_temperature_c', 'mean_ph'] })),
    archive.normalizeItem(item(2, { sample_id: 'S2', asset_kind: 'environmental_data', available_variables: ['mean_temperature_c'] })),
    archive.normalizeItem(item(3))
  ];
  assert.equal(archive.filterDatabaseItems(rows, 'environmental', { variable: 'all' }).length, 2);
  const selected = archive.filterDatabaseItems(rows, 'environmental', { variable: 'mean_ph', sample: 'S1', program: 'FJS' });
  assert.equal(selected.length, 1);
  assert.equal(selected[0].mean_ph, undefined);
  assert.equal(archive.filterDatabaseItems(rows, 'environmental', { variable: 'mean_salinity_psu' }).length, 0);
});

test('unlinked uploads remain selectable without invented metadata; missing uploads cannot be requested', () => {
  const pending = archive.normalizeItem(item(1, { metadata_linked: false, sample_id: null, sample_date: null, common_name: null, taxon_code: null, asset_kind: 'other' }));
  const missing = archive.normalizeItem(item(2, { available: false }));
  const rows = [pending, missing];
  assert.deepEqual(archive.filterDatabaseItems(rows, 'biological', { availability: 'metadata_pending' }), [pending]);
  assert.deepEqual(archive.filterDatabaseItems(rows, 'biological', { availability: 'awaiting_upload' }), [missing]);
  assert.equal(archive.filterDatabaseItems(rows, 'biological', { yearStart: '2024' }).includes(pending), false);
  assert.deepEqual(archive.requestItems(rows), [pending]);
});

function deliveryHelpers(client = {}) {
  const source = fs.readFileSync('supabase/functions/deliver-approved-request/index.ts', 'utf8');
  const code = stripTypeScriptTypes(source, { mode: 'strip' }).replace(/^import[^\n]+\n/, '');
  const context = vm.createContext({
    console, Request, Response, Set, Date, Error,
    createClient: () => client,
    Deno: { env: { get: (key) => ({ SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'test-only' })[key] }, serve: (callback) => { context.handler = callback; } }
  });
  vm.runInContext(`${code}\nglobalThis.helpers = { loadCatalogRows, manifestToCsv, buildEmailText };`, context);
  return context;
}

test('approved live requests resolve only selected IDs, in batches without a row cap', async () => {
  const ids = Array.from({ length: 1503 }, (_, index) => `upload:${index}`);
  const batches = [];
  const context = deliveryHelpers();
  const rows = await context.helpers.loadCatalogRows({ rpc: async (name, args) => {
    assert.equal(name, 'get_hrbmp_request_items');
    batches.push(args.p_catalog_ids.length);
    return { data: args.p_catalog_ids.map((catalog_id) => ({ catalog_id })), error: null };
  } }, { request_payload: { source: 'supabase_archive', catalog_ids: ids } });
  assert.equal(rows.length, 1503);
  assert.deepEqual(batches, [500, 500, 500, 3]);
  await assert.rejects(context.helpers.loadCatalogRows({ rpc: async () => ({ data: [], error: null }) }, { request_payload: { source: 'supabase_archive', catalog_ids: ['upload:removed'] } }), /removed/);
});

test('an unauthenticated caller cannot obtain privileged download resolution', async () => {
  let reads = 0;
  const context = deliveryHelpers({ auth: { getUser: async () => ({ data: {}, error: new Error('Invalid user') }) }, rpc: async () => { reads += 1; } });
  const response = await context.handler(new Request('https://example.supabase.co/functions/v1/deliver-approved-request', { method: 'POST', body: JSON.stringify({ request_id: 'TEST_REQUEST' }) }));
  assert.equal(response.status, 401);
  assert.equal(reads, 0);
});

test('environmental delivery appears in the manifest and email', () => {
  const context = deliveryHelpers();
  const csv = context.helpers.manifestToCsv([], [], '', '', [{ sample_id: 'TEST_SAMPLE', asset_kind: 'environmental_data' }], 'request-packages/test/environment.csv', 'https://example.test/download');
  assert.match(csv, /environmental_data/);
  assert.match(csv, /https:\/\/example.test\/download/);
  const email = context.helpers.buildEmailText({ request_id: 'TEST_REQUEST' }, { assetLinks: [], countsUrl: null, environmentalUrl: 'https://example.test/environment', manifestUrl: 'https://example.test/manifest', expiresAt: 'TEST_DATE' });
  assert.match(email, /Environmental data CSV: https:\/\/example.test\/environment/);
});
