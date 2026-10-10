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
  vm.runInContext(`${code}\nglobalThis.helpers = { loadCatalogRows, manifestToCsv, buildEmailText, isHrbmpRequestAdmin };`, context);
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

test('delivery denies ordinary users and fails closed if the admin allowlist is unavailable', async () => {
  for (const [result, expectedStatus] of [
    [{ data: null, error: null }, 403],
    [{ data: null, error: new Error('Database unavailable') }, 503]
  ]) {
    let requestReads = 0;
    const client = {
      auth: { getUser: async () => ({ data: { user: { email: 'chengxue.li@stonybrook.edu' } }, error: null }) },
      from: (table) => {
        if (table !== 'hrbmp_request_admins') requestReads += 1;
        const query = { select: () => query, eq: () => query, maybeSingle: async () => result };
        return query;
      }
    };
    const context = deliveryHelpers(client);
    const response = await context.handler(new Request('https://example.supabase.co/functions/v1/deliver-approved-request', {
      method: 'POST', headers: { Authorization: 'Bearer TEST_USER_TOKEN' },
      body: JSON.stringify({ request_id: 'TEST_REQUEST' })
    }));
    assert.equal(response.status, expectedStatus);
    assert.equal(requestReads, 0);
  }
});

function guiHelpers(client) {
  const panel = { hidden: true };
  const context = vm.createContext({
    console: { error: () => {} }, Set, Map, Date, URL, setTimeout, clearTimeout,
    window: { HRBMP_CONFIG: { publishableKey: publicTestKey }, HRBMPArchive: archive,
      supabase: { createClient: () => client } },
    document: { addEventListener: () => {}, getElementById: (id) => id === 'admin-request-panel' ? panel : null }
  });
  vm.runInContext(fs.readFileSync('gui/app.js', 'utf8') + `
    renderAdminRequestRows = () => {};
    resetAdminRequestReport = () => {};
    setLoginStatus = (message) => { globalThis.loginStatus = message; };
    globalThis.helpers = { state, loadAdminRequests, signOutAdminUser, variablesForSource, emptyLiveData, sumRecordCounts, MAP_BASEMAPS, DEFAULT_BASEMAP };
  `, context);
  return { ...context, panel };
}

function adminClient({ session = { user: { email: 'admin@example.invalid' } }, authorized = true,
  authorizationError = null, rows = [], readRows = null } = {}) {
  const client = { reads: 0, checks: 0 };
  client.auth = {
    getSession: async () => ({ data: { session }, error: null }),
    signOut: async () => { session = null; return { error: null }; },
    onAuthStateChange: (callback) => {
      client.authChanged = callback;
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  };
  client.rpc = async (name) => {
    assert.equal(name, 'is_hrbmp_request_admin');
    client.checks += 1;
    return { data: authorized, error: authorizationError };
  };
  client.from = (table) => {
    assert.equal(table, 'hrbmp_data_requests');
    client.reads += 1;
    const query = { select: () => query, order: () => query,
      limit: async () => readRows ? readRows() : { data: rows, error: null } };
    return query;
  };
  return client;
}

test('GUI hides admin review until the server confirms membership; denied/error logins never read requests', async () => {
  for (const options of [{ session: null }, { authorized: false },
    { authorized: 'true' }, { authorizationError: new Error('Access check unavailable') }]) {
    const client = adminClient(options);
    const context = guiHelpers(client);
    await context.helpers.loadAdminRequests();
    assert.equal(context.panel.hidden, true);
    assert.equal(context.helpers.state.adminAuthorized, false);
    assert.equal(context.helpers.state.adminRequests.length, 0);
    assert.equal(client.reads, 0);
  }
  const client = adminClient({ rows: [{ request_id: 'TEST_PRIVATE_REQUEST' }] });
  const context = guiHelpers(client);
  await context.helpers.loadAdminRequests();
  assert.equal(context.panel.hidden, false);
  assert.equal(context.helpers.state.adminRequests.length, 1);
  assert.equal(client.checks, 1);
  client.authChanged('SIGNED_OUT', null);
  assert.equal(context.panel.hidden, true);
  assert.equal(context.helpers.state.adminRequests.length, 0);
});

test('GUI clears private request state on a failed refresh or sign-out, including an in-flight response', async () => {
  let resolveRows;
  const client = adminClient({ rows: [{ request_id: 'TEST_PRIVATE_REQUEST' }] });
  const context = guiHelpers(client);
  await context.helpers.loadAdminRequests();
  client.rpc = async () => ({ data: null, error: new Error('Access check unavailable') });
  await context.helpers.loadAdminRequests();
  assert.equal(context.panel.hidden, true);
  assert.equal(context.helpers.state.adminRequests.length, 0);
  client.rpc = async () => ({ data: true, error: null });
  const pending = new Promise(resolve => { resolveRows = resolve; });
  client.from = () => {
    const query = { select: () => query, order: () => query, limit: () => pending };
    return query;
  };
  const loading = context.helpers.loadAdminRequests();
  await new Promise(resolve => setTimeout(resolve, 0));
  await context.helpers.signOutAdminUser();
  resolveRows({ data: [{ request_id: 'TEST_PRIVATE_REQUEST' }], error: null });
  await loading;
  assert.equal(context.panel.hidden, true);
  assert.equal(context.helpers.state.adminRequests.length, 0);
  assert.equal(context.helpers.state.adminAuthorized, false);
});

test('GUI starts empty and offers only actually recorded HRBMP variables, without example-data fetches', () => {
  const context = guiHelpers(adminClient());
  assert.equal(context.helpers.emptyLiveData().counts.observations, 0);
  assert.equal(context.helpers.emptyLiveData().environmental_availability.length, 0);
  assert.equal(context.helpers.variablesForSource('hrbmp').length, 0);
  context.helpers.state.demoApiLoaded = true;
  context.helpers.state.environmentalRows = [{ available_variables: ['mean_temperature_c'] }];
  assert.equal(JSON.stringify(context.helpers.variablesForSource('hrbmp')), '["mean_temperature_c"]');
  for (const source of ['usgs', 'epa', 'noaa']) assert.equal(context.helpers.variablesForSource(source).length, 0);
  const html = fs.readFileSync('gui/index.html', 'utf8');
  assert.match(html, /id="admin-request-panel"[^>]* hidden/);
  assert.doesNotMatch(html, /Hudson River Biological Availability Layers|Biological record totals are summarized|USGS|EPA|NOAA/);
  assert.doesNotMatch(fs.readFileSync('gui/app.js', 'utf8'), /example_summary\.json|deriveEnvironmentalCovariates|FALLBACK_DATA|FALLBACK_METADATA/);
});

test('image catalog filters only real image assets, including missing and unlinked uploads', () => {
  const rows = [
    archive.normalizeItem(item(1, { sample_id: 'S1', river_region_name: 'Battery', mime_type: 'image/jpeg' })),
    archive.normalizeItem(item(2, { sample_id: 'S2', asset_kind: 'jar_label_image', available: false })),
    archive.normalizeItem(item(3, { sample_id: null, sample_date: null, metadata_linked: false, asset_kind: 'other', original_file_name: 'TEST_unlinked.PNG' })),
    archive.normalizeItem(item(4, { asset_kind: 'field_sheet_pdf', mime_type: 'application/pdf' })),
    archive.normalizeItem(item(5, { asset_kind: 'processed_abundance_count' })),
    archive.normalizeItem(item(6, { asset_kind: 'environmental_data' }))
  ];
  assert.equal(archive.filterImageItems(rows).length, 3);
  assert.deepEqual(archive.filterImageItems(rows, { species: 'TEST SPECIES', region: 'Battery', sample: 'S1', program: 'FJS', yearStart: '2024', dataType: 'representative_species_image' }), [rows[0]]);
  assert.deepEqual(archive.filterImageItems(rows, { availability: 'awaiting_upload' }), [rows[1]]);
  assert.deepEqual(archive.filterImageItems(rows, { availability: 'metadata_pending' }), [rows[2]]);
  assert.equal(archive.filterImageItems(rows, { yearStart: '2024' }).includes(rows[2]), false);
  assert.equal(archive.requestItems(archive.filterImageItems(rows)).length, 2);
});

test('image map groups actual files per sample and does not fabricate coordinates or count missing files as available', () => {
  const located = { sample_id: 'S1', latitude: 40.8, longitude: -73.9 };
  const rows = [
    archive.normalizeItem(item(1, located)),
    archive.normalizeItem(item(2, { ...located, asset_kind: 'jar_label_image' })),
    archive.normalizeItem(item(3, { ...located, available: false })),
    archive.normalizeItem(item(4, { ...located, sample_id: 'S2', available: false })),
    archive.normalizeItem(item(5, { sample_id: 'S3', latitude: null, longitude: null })),
    archive.normalizeItem(item(6, { ...located, sample_id: 'S4', metadata_linked: false })),
    archive.normalizeItem(item(7, { ...located, sample_id: 'S5', latitude: 91 })),
    archive.normalizeItem(item(8, { ...located, asset_kind: 'processed_abundance_count' }))
  ];
  const samples = archive.buildImageMapRows(rows);
  assert.equal(samples.length, 2);
  assert.equal(samples[0].image_count, 2);
  assert.equal(samples[0].missing_image_count, 1);
  assert.equal(samples[0].image_items.length, 3);
  assert.equal(samples[1].image_count, 0);
  assert.equal(samples[1].missing_image_count, 1);
  assert.equal(samples[0].latitude, located.latitude);
  const context = guiHelpers(adminClient());
  assert.equal(context.helpers.sumRecordCounts(samples, 'catalog'), 2);
});

test('data-type groups contain only real records and distinguish available items from missing uploads', () => {
  const rows = [
    archive.normalizeItem(item(1, { asset_kind: 'lab_sheet_pdf' })),
    archive.normalizeItem(item(2, { asset_kind: 'representative_species_image', available: false })),
    archive.normalizeItem(item(3, { asset_kind: 'processed_abundance_count' })),
    archive.normalizeItem(item(4, { asset_kind: 'representative_species_image' })),
    archive.normalizeItem(item(5, { asset_kind: 'other', metadata_linked: false }))
  ];
  const before = rows.map((row) => row.catalog_id);
  const groups = archive.groupItemsByDataType(rows);
  assert.deepEqual(groups.map((group) => group.kind), ['processed_abundance_count', 'representative_species_image', 'lab_sheet_pdf', 'other']);
  assert.equal(groups[0].label, 'Abundance / Counts');
  assert.equal(groups[1].availableCount, 1);
  assert.equal(groups[1].awaitingUploadCount, 1);
  assert.equal(groups[1].items.length, 2);
  assert.equal(groups[3].availableCount, 1);
  assert.equal(groups.reduce((total, group) => total + group.items.length, 0), rows.length);
  assert.deepEqual(new Set(groups.flatMap((group) => group.items.map((row) => row.catalog_id))), new Set(before));
  assert.deepEqual(rows.map((row) => row.catalog_id), before);
  assert.deepEqual(archive.groupItemsByDataType([]), []);
});

test('Light Reference uses the key-free street source and styles only raster tiles', () => {
  const { MAP_BASEMAPS, DEFAULT_BASEMAP } = guiHelpers(adminClient()).helpers;
  assert.equal(DEFAULT_BASEMAP, 'street');
  assert.equal(MAP_BASEMAPS.street.url, 'https://tile.openstreetmap.org/{z}/{x}/{y}.png');
  assert.equal(MAP_BASEMAPS.light.url, MAP_BASEMAPS.street.url);
  assert.equal(MAP_BASEMAPS.light.options.className, 'light-reference-tiles');
  assert.match(MAP_BASEMAPS.light.options.attribution, /openstreetmap.org\/copyright/);
  assert.doesNotMatch(fs.readFileSync('gui/app.js', 'utf8'), /basemaps\.cartocdn\.com/);
  assert.match(fs.readFileSync('gui/style.css', 'utf8'), /\.light-reference-tiles \.leaflet-tile\s*\{\s*filter: grayscale\(1\)/);
});

test('all three catalog/database maps stay visible above availability tables with Street Map selected and ArcGIS retained', () => {
  const html = fs.readFileSync('gui/index.html', 'utf8');
  for (const [scope, prefix] of [['biological', 'bio'], ['environmental', 'env'], ['catalog', 'catalog']]) {
    const start = html.indexOf(`id="${scope === 'catalog' ? 'sampling-image-catalog' : scope + '-database'}"`);
    const end = html.indexOf(`id="${scope === 'catalog' ? 'educational-materials' : scope + '-data-request'}"`, start);
    const page = html.slice(start, end);
    assert.equal(page.includes('<details'), false);
    assert.ok(page.indexOf(`id="${prefix}-map"`) < page.indexOf('class="database-availability"'));
    assert.match(page, /value="street" selected>Street Map/);
    assert.match(page, /value="satellite">ArcGIS Satellite Imagery/);
    assert.equal(page.split(`id="${prefix}-map"`).length - 1, 1);
  }
  assert.match(fs.readFileSync('gui/app.js', 'utf8'), /server\.arcgisonline\.com\/ArcGIS\/rest\/services\/World_Imagery\/MapServer\/tile/);
  assert.match(fs.readFileSync('gui/app.js', 'utf8'), /window\.addEventListener\('resize', refreshActiveMap\)/);
});

test('environmental delivery appears in the manifest and email', () => {
  const context = deliveryHelpers();
  const csv = context.helpers.manifestToCsv([], [], '', '', [{ sample_id: 'TEST_SAMPLE', asset_kind: 'environmental_data' }], 'request-packages/test/environment.csv', 'https://example.test/download');
  assert.match(csv, /environmental_data/);
  assert.match(csv, /https:\/\/example.test\/download/);
  const email = context.helpers.buildEmailText({ request_id: 'TEST_REQUEST' }, { assetLinks: [], countsUrl: null, environmentalUrl: 'https://example.test/environment', manifestUrl: 'https://example.test/manifest', expiresAt: 'TEST_DATE' });
  assert.match(email, /Environmental data CSV: https:\/\/example.test\/environment/);
});
