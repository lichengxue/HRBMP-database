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
    globalThis.helpers = { state, loadAdminRequests, signOutAdminUser, variablesForSource, emptyLiveData, sumRecordCounts, MAP_BASEMAPS, DEFAULT_BASEMAP, mainRequestItems, databasePageItems };
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

test('beta version and asset references agree, with just three concise update bullets', () => {
  const html = fs.readFileSync('gui/index.html', 'utf8');
  const app = fs.readFileSync('gui/app.js', 'utf8');
  assert.match(html, /class="portal-version">Beta Version 1\.1\.4</);
  assert.match(app, /const DATA_VERSION = '1\.1\.4';/);
  for (const file of ['style.css', 'archive.js', 'app.js']) assert.ok(html.includes(`${file}?v=1.1.4`));
  const start = html.indexOf('id="news"');
  const end = html.indexOf('</section>', start);
  const news = html.slice(start, end);
  const bullets = [...news.matchAll(/<li>(.*?)<\/li>/g)].map((match) => match[1].replace(/<[^>]*>/g, ''));
  assert.equal(bullets.length, 3);
  for (const [index, version] of ['1.1.2', '1.1.3', '1.1.4'].entries()) {
    assert.ok(bullets[index].startsWith(`Beta ${version}:`));
    assert.ok(bullets[index].split(/\s+/).length <= 16);
  }
  assert.doesNotMatch(news, /<p[ >]/);
});

test('News separates concise version updates from the two official HRBMP articles', () => {
  const html = fs.readFileSync('gui/index.html', 'utf8');
  const submenu = html.match(/<div class="nav-submenu" aria-label="News subsections">([\s\S]*?)<\/div>/)[1];
  assert.match(submenu, /href="#news" data-tab-link="news">Version Updates</);
  assert.match(submenu, /href="#hrbmp-news" data-tab-link="hrbmp-news">HRBMP News</);
  assert.equal([...submenu.matchAll(/<a /g)].length, 2);
  const start = html.indexOf('id="hrbmp-news"');
  const news = html.slice(start, html.indexOf('</section>', start));
  assert.match(news, /data-tab-page="hrbmp-news"/);
  assert.equal([...news.matchAll(/<article>/g)].length, 2);
  assert.match(news, /datetime="2026-05-15"/);
  assert.match(news, /datetime="2019-12-06"/);
  assert.ok(news.indexOf('2026-05-15') < news.indexOf('2019-12-06'));
  for (const url of [
    'https://news.stonybrook.edu/newsroom/extraordinary-natural-science-collection-gifted-to-somas/',
    'https://news.stonybrook.edu/university/study-shows-toxic-metals-in-hudson-river-striped-bass-decreased-over-decades-2/'
  ]) assert.ok(news.includes(`href="${url}" target="_blank" rel="noopener"`));
  assert.doesNotMatch(news, /Beta 1\.1\./);
});

test('availability pages each retain one semantic heading in the shared green uppercase style', () => {
  const html = fs.readFileSync('gui/index.html', 'utf8');
  for (const [id, title] of [
    ['biological-database', 'Biological Database'],
    ['environmental-database', 'Environmental Database'],
    ['sampling-image-catalog', 'Sampling Image Catalog']
  ]) {
    const start = html.indexOf(`id="${id}"`);
    const page = html.slice(start, html.indexOf('</section>', start));
    assert.ok(page.includes(`<h1 class="eyebrow">${title}</h1>`));
    assert.equal([...page.matchAll(/<h1[ >]/g)].length, 1);
    assert.ok(!page.includes(`<p class="eyebrow">${title}</p>`));
  }
  const css = fs.readFileSync('gui/style.css', 'utf8');
  assert.match(css, /\.eyebrow\s*\{[^}]*color: var\(--teal\);[^}]*text-transform: uppercase;/);
  assert.match(css, /#sampling-image-catalog \.page-header h1\.eyebrow\s*\{[^}]*color: var\(--teal\);[^}]*font-size: 0\.82rem;/);
  assert.ok(html.includes('style.css?v=1.1.4-usability'));
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
  assert.deepEqual(groups.map((group) => group.kind), ['processed_abundance_count', 'representative_species_image', 'other']);
  assert.equal(groups[0].label, 'Abundance / Counts');
  assert.equal(groups[1].availableCount, 1);
  assert.equal(groups[1].awaitingUploadCount, 1);
  assert.equal(groups[1].items.length, 2);
  assert.equal(groups[2].availableCount, 1);
  assert.equal(groups.reduce((total, group) => total + group.items.length, 0), rows.filter(archive.isPublicCatalogItem).length);
  assert.deepEqual(new Set(groups.flatMap((group) => group.items.map((row) => row.catalog_id))), new Set(rows.filter(archive.isPublicCatalogItem).map((row) => row.catalog_id)));
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


require('../gui/archive-cache.js');
const publicCache = globalThis.HRBMPArchiveCache;

test('saved totals are reusable for one hour and reject corrupt or unavailable storage', () => {
  const entries = new Map();
  const storage = { getItem: (key) => entries.get(key) || null, setItem: (key, value) => entries.set(key, value) };
  const counts = { stations: 264, sampling_events: 1219, taxa: 52, observations: 5672, secret: 'PRIVATE_TEST_VALUE' };
  const checked = '2026-11-23T20:00:00.000Z';
  const saved = publicCache.writeSnapshot('https://example.supabase.co', counts, checked, storage);
  assert.equal(publicCache.readSnapshot('https://example.supabase.co', storage).counts.observations, 5672);
  assert.equal(publicCache.isFresh(saved, Date.parse(checked) + 3599999), true);
  assert.equal(publicCache.isFresh(saved, Date.parse(checked) + 3600000), false);
  assert.equal(publicCache.isFresh(saved, Date.parse(checked) - 1), false);
  assert.equal(publicCache.readSnapshot('https://another.supabase.co', storage), null);
  assert.doesNotMatch([...entries.values()].join(''), /PRIVATE_TEST_VALUE/);
  entries.set('hrbmp:snapshot:https://example.supabase.co', '{broken');
  assert.equal(publicCache.readSnapshot('https://example.supabase.co', storage), null);
  const unavailable = { getItem: () => { throw Error('Blocked'); }, setItem: () => { throw Error('Full'); } };
  assert.equal(publicCache.readSnapshot('https://example.supabase.co', unavailable), null);
  assert.equal(publicCache.writeSnapshot('https://example.supabase.co', counts, checked, unavailable), null);
});

test('catalog caching has an explicit public-field allowlist and never stores private values or file paths', () => {
  const row = item(1, { requester_email: 'PRIVATE_TEST_VALUE', storage_object_path: 'PRIVATE_TEST_VALUE',
    download_url: 'PRIVATE_TEST_VALUE', total_count_corrected: 'PRIVATE_TEST_VALUE', secret_key: 'PRIVATE_TEST_VALUE' });
  const stored = publicCache.publicItems([row]);
  assert.equal(stored[0].catalog_id, row.catalog_id);
  assert.doesNotMatch(JSON.stringify(stored), /PRIVATE_TEST_VALUE/);
});

function cachedGui(cache, fetchRows) {
  const elements = new Map();
  const document = { addEventListener: () => {}, querySelectorAll: () => [], querySelector: () => null,
    getElementById: (id) => {
      if (!['count-stations', 'count-events', 'count-taxa', 'count-observations', 'snapshot-date', 'snapshot-status'].includes(id)) return null;
      if (!elements.has(id)) elements.set(id, {});
      return elements.get(id);
    } };
  const context = vm.createContext({ console: { error: () => {} }, Event, URL, setTimeout, clearTimeout, document,
    window: { HRBMP_CONFIG: { publishableKey: publicTestKey }, HRBMPArchive: archive, HRBMPArchiveCache: cache,
      location: { hash: '#home' }, dispatchEvent: () => {} } });
  vm.runInContext(fs.readFileSync('gui/app.js', 'utf8') + `
    populateFilters = renderBiologicalRegionReference = renderBiologicalMap = renderDatabaseAvailability =
      updateDataRequestSummary = renderEnvironmental = renderCatalog = refreshAdminSession = setArchiveStatus = () => {};
    fetchDemoArchiveRows = () => globalThis.fetchRows();
    state.data = emptyLiveData();
    globalThis.helpers = { state, initializeArchive, refreshDemoArchive, archivePageNeedsData };
  `, context);
  context.fetchRows = fetchRows;
  return { ...context.helpers, elements, window: context.window };
}

test('a fresh saved catalog displays totals without any live catalog request', async () => {
  let requests = 0;
  const cache = { readSnapshot: () => null, readCatalog: async () => ({ fetchedAt: new Date().toISOString(), items: [item(1)] }), isFresh: () => true };
  const gui = cachedGui(cache, async () => { requests++; return []; });
  await gui.initializeArchive();
  assert.equal(requests, 0);
  assert.equal(gui.state.demoApiLoaded, true);
  assert.equal(gui.elements.get('count-events').textContent, '1');
  assert.match(gui.elements.get('snapshot-date').textContent, /Last checked/);
});

test('fresh saved totals keep the homepage fast even if full-catalog storage is unavailable', async () => {
  let requests = 0;
  const cache = { readSnapshot: () => ({ fetchedAt: new Date().toISOString(), counts: { stations: 264, sampling_events: 1219, taxa: 52, observations: 5672 } }),
    readCatalog: async () => null, isFresh: () => true };
  const gui = cachedGui(cache, async () => { requests++; return []; });
  await gui.initializeArchive();
  assert.equal(requests, 0);
  assert.equal(gui.elements.get('count-stations').textContent, '264');
  assert.equal(gui.state.demoApiLoaded, false);
  assert.equal(gui.archivePageNeedsData('biological-database'), true);
  assert.equal(gui.archivePageNeedsData('environmental-data-request'), true);
  assert.equal(gui.archivePageNeedsData('home'), false);
});

test('a failed background update preserves cached records and totals', async () => {
  let fail;
  const cache = { readSnapshot: () => null, readCatalog: async () => ({ fetchedAt: '2020-01-01T00:00:00Z', items: [item(1)] }), isFresh: () => false };
  const gui = cachedGui(cache, () => new Promise((_, reject) => { fail = reject; }));
  const pending = gui.initializeArchive();
  await new Promise(setImmediate);
  assert.equal(gui.state.archiveLoading, true);
  assert.equal(gui.state.demoRows.length, 1);
  assert.equal(gui.elements.get('count-events').textContent, '1');
  fail(Error('Offline'));
  await pending;
  assert.equal(gui.state.demoRows.length, 1);
  assert.equal(gui.state.demoApiLoaded, true);
  assert.equal(gui.state.archiveLoading, false);
  assert.match(gui.elements.get('snapshot-status').textContent, /last saved totals/);
});

test('a late cache read cannot overwrite a completed manual refresh', async () => {
  let restore;
  const cache = { readSnapshot: () => null, readCatalog: () => new Promise(resolve => { restore = resolve; }),
    writeSnapshot: () => null, writeCatalog: async () => true, isFresh: () => true };
  const gui = cachedGui(cache, async () => [item(2), item(3)]);
  const pending = gui.initializeArchive();
  await gui.refreshDemoArchive();
  restore({ fetchedAt: new Date().toISOString(), items: [item(1)] });
  await pending;
  assert.equal(gui.state.demoRows.length, 2);
  assert.equal(gui.state.demoRows[0].catalog_id, item(2).catalog_id);
});

test('search narrows scientific metadata and direct page jumps handle hundreds of pages', () => {
  const rows = [archive.normalizeItem(item(1, { sample_id: 'S1', original_file_name: 'fish-a.jpg', river_region_name: 'Battery' })),
    archive.normalizeItem(item(2, { sample_id: 'S2', original_file_name: 'fish-b.jpg', river_region_name: 'Albany' }))];
  assert.deepEqual(archive.searchItems(rows, 'BATTERY fish-a'), [rows[0]]);
  assert.equal(archive.searchItems(rows, 'S2 Albany').length, 1);
  assert.equal(archive.searchItems(rows, 'no match').length, 0);
  assert.deepEqual(archive.resultPage(14021, 560, 25), { page: 560, size: 25, pages: 561, start: 14000, end: 14021 });
  assert.equal(archive.resultPage(14021, 9999, 100).page, 140);
  assert.equal(archive.resultPage(0, -9, 999).size, 25);
});

test('unclassified JPEGs remain visible while folder placeholders never become requestable data', async () => {
  const rows = await archive.fetchAvailability('https://example.supabase.co', publicTestKey, async () => ({ ok: true, json: async () => ({
    has_more: false, items: [item(1, { asset_kind: 'other', mime_type: 'image/jpeg', original_file_name: 'unclassified.jpg' }),
      item(2, { asset_kind: 'other', metadata_linked: false, original_file_name: '.emptyFolderPlaceholder' })]
  }) }));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].asset_kind, 'other');
  assert.equal(archive.fileDescription(rows[0]), 'JPEG image');
  assert.equal(archive.DATA_TYPE_GROUPS.other, 'Unclassified Files');
  assert.equal(archive.requestItems(rows).length, 1);
});


test('field and lab sheets stay out of public lists, maps, selections and saved catalogs', async () => {
  const rows = [item(1), item(2, { asset_kind: 'field_sheet_pdf' }), item(3, { asset_kind: 'lab_sheet_pdf' })];
  const fetched = await archive.fetchAvailability('https://example.supabase.co', publicTestKey, async () => ({ ok: true,
    json: async () => ({ items: rows, has_more: false }) }));
  assert.equal(fetched.length, 1);
  assert.equal(archive.filterDatabaseItems(rows, 'biological').length, 1);
  assert.equal(archive.requestItems(rows).length, 1);
  assert.equal(publicCache.publicItems(rows).length, 1);
  assert.deepEqual(archive.groupItemsByDataType(rows).map(group => group.kind), ['representative_species_image']);
});


test('all matching items can be requested without visiting hundreds of preview pages', () => {
  const context = guiHelpers(adminClient());
  context.helpers.state.demoRows = Array.from({ length: 3501 }, (_, index) => archive.normalizeItem(item(index)));
  assert.equal(context.helpers.mainRequestItems('biological').length, 3501);
  context.helpers.state.databasePages.biological = 123;
  const page = context.helpers.databasePageItems('biological');
  assert.equal(page.length, 25);
  context.helpers.state.databaseSelections.biological = new Set(page.map(row => row.catalog_id));
  context.helpers.state.databasePages.biological = 0;
  assert.equal(context.helpers.mainRequestItems('biological').length, 25);
});

test('browser catalog writes wait for the complete transaction and recover from storage failure', async () => {
  let stored, failWrite = false;
  const database = { close: () => {}, transaction: () => {
    const tx = { objectStore: () => ({
      get: () => request(false), put: (value) => request(true, value)
    }) };
    function request(write, value) {
      const req = {};
      queueMicrotask(() => {
        req.result = write ? 'source' : stored;
        req.onsuccess?.();
        queueMicrotask(() => {
          if (write && failWrite) tx.onabort?.();
          else { if (write) stored = value; tx.oncomplete?.(); }
        });
      });
      return req;
    }
    return tx;
  } };
  const root = { HRBMPArchive: archive, setTimeout, clearTimeout,
    indexedDB: { open: () => { const req = {}; queueMicrotask(() => { req.result = database; req.onsuccess(); }); return req; } } };
  vm.runInNewContext(fs.readFileSync('gui/archive-cache.js', 'utf8'), { window: root, URL, setTimeout, clearTimeout });
  const cache = root.HRBMPArchiveCache;
  const date = new Date().toISOString();
  assert.equal(await cache.writeCatalog('https://example.supabase.co', [item(1)], date), true);
  assert.equal((await cache.readCatalog('https://example.supabase.co')).items.length, 1);
  failWrite = true;
  assert.equal(await cache.writeCatalog('https://example.supabase.co', [item(1), item(2)], date), false);
  assert.equal((await cache.readCatalog('https://example.supabase.co')).items.length, 1);
  assert.equal(await cache.readCatalog('https://different.supabase.co'), null);
});
