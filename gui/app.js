const FALLBACK_DATA = {
  generated_at_utc: '2026-05-03 00:00:00 UTC',
  note: '',
  counts: {
    stations: 3,
    sampling_events: 4,
    taxa: 4,
    observations: 7
  },
  stations: [
    {
      station_id: 'ST001',
      station_name: 'Upper Reach - Prototype',
      river_mile: 145.2,
      latitude: 42.25,
      longitude: -73.79,
      region: 'Upper Hudson'
    },
    {
      station_id: 'ST002',
      station_name: 'Mid Reach - Prototype',
      river_mile: 98.4,
      latitude: 41.7,
      longitude: -73.95,
      region: 'Mid Hudson'
    },
    {
      station_id: 'ST003',
      station_name: 'Lower Reach - Prototype',
      river_mile: 32.7,
      latitude: 40.8,
      longitude: -73.98,
      region: 'Lower Hudson'
    }
  ],
  sampling_events: [
    {
      event_id: 'EV001',
      station_id: 'ST001',
      station_name: 'Upper Reach - Prototype',
      region: 'Upper Hudson',
      sample_date: '2024-06-10',
      year: 2024,
      month: 6,
      day: 10,
      gear_type: 'Trawl',
      program: 'Prototype Survey',
      sampling_depth_m: 5.5
    },
    {
      event_id: 'EV002',
      station_id: 'ST002',
      station_name: 'Mid Reach - Prototype',
      region: 'Mid Hudson',
      sample_date: '2024-07-15',
      year: 2024,
      month: 7,
      day: 15,
      gear_type: 'Seine',
      program: 'Prototype Survey',
      sampling_depth_m: 3.1
    },
    {
      event_id: 'EV003',
      station_id: 'ST003',
      station_name: 'Lower Reach - Prototype',
      region: 'Lower Hudson',
      sample_date: '2025-05-20',
      year: 2025,
      month: 5,
      day: 20,
      gear_type: 'Trawl',
      program: 'Prototype Survey',
      sampling_depth_m: 6
    },
    {
      event_id: 'EV004',
      station_id: 'ST001',
      station_name: 'Upper Reach - Prototype',
      region: 'Upper Hudson',
      sample_date: '2025-08-12',
      year: 2025,
      month: 8,
      day: 12,
      gear_type: 'Seine',
      program: 'Prototype Survey',
      sampling_depth_m: 4.2
    }
  ],
  annual_total_abundance: [
    { year: 2024, total_abundance: 135 },
    { year: 2025, total_abundance: 130 }
  ],
  taxa_totals: [
    {
      taxon_id: 'TX003',
      scientific_name: 'Fundulus heteroclitus',
      common_name: 'Mummichog',
      taxonomic_group: 'Fish',
      total_abundance: 118
    },
    {
      taxon_id: 'TX004',
      scientific_name: 'Crangon septemspinosa',
      common_name: 'Sand Shrimp',
      taxonomic_group: 'Invertebrate',
      total_abundance: 79
    },
    {
      taxon_id: 'TX001',
      scientific_name: 'Morone saxatilis',
      common_name: 'Striped Bass',
      taxonomic_group: 'Fish',
      total_abundance: 51
    },
    {
      taxon_id: 'TX002',
      scientific_name: 'Alosa sapidissima',
      common_name: 'American Shad',
      taxonomic_group: 'Fish',
      total_abundance: 17
    }
  ],
  environmental_summary: [
    {
      mean_temperature_c: 21.18,
      mean_salinity_psu: 4.58,
      mean_dissolved_oxygen_mg_l: 7.78,
      mean_turbidity_ntu: 13.85,
      mean_chlorophyll_a: 8
    }
  ],
  biological_availability: [
    {
      station_id: 'ST001',
      station_name: 'Upper Reach - Prototype',
      river_mile: 145.2,
      latitude: 42.25,
      longitude: -73.79,
      region: 'Upper Hudson',
      year: 2024,
      month: 6,
      day: 10,
      gear_type: 'Trawl',
      sampling_events: 1,
      biological_records: 2,
      total_abundance: 63
    },
    {
      station_id: 'ST002',
      station_name: 'Mid Reach - Prototype',
      river_mile: 98.4,
      latitude: 41.7,
      longitude: -73.95,
      region: 'Mid Hudson',
      year: 2024,
      month: 7,
      day: 15,
      gear_type: 'Seine',
      sampling_events: 1,
      biological_records: 2,
      total_abundance: 72
    },
    {
      station_id: 'ST003',
      station_name: 'Lower Reach - Prototype',
      river_mile: 32.7,
      latitude: 40.8,
      longitude: -73.98,
      region: 'Lower Hudson',
      year: 2025,
      month: 5,
      day: 20,
      gear_type: 'Trawl',
      sampling_events: 1,
      biological_records: 2,
      total_abundance: 92
    },
    {
      station_id: 'ST001',
      station_name: 'Upper Reach - Prototype',
      river_mile: 145.2,
      latitude: 42.25,
      longitude: -73.79,
      region: 'Upper Hudson',
      year: 2025,
      month: 8,
      day: 12,
      gear_type: 'Seine',
      sampling_events: 1,
      biological_records: 1,
      total_abundance: 38
    }
  ],
  environmental_availability: [
    {
      station_id: 'ST001',
      station_name: 'Upper Reach - Prototype',
      river_mile: 145.2,
      latitude: 42.25,
      longitude: -73.79,
      region: 'Upper Hudson',
      year: 2024,
      month: 6,
      environmental_records: 1,
      mean_temperature_c: 19.3,
      mean_salinity_psu: 2.4,
      mean_dissolved_oxygen_mg_l: 8.1
    },
    {
      station_id: 'ST002',
      station_name: 'Mid Reach - Prototype',
      river_mile: 98.4,
      latitude: 41.7,
      longitude: -73.95,
      region: 'Mid Hudson',
      year: 2024,
      month: 7,
      environmental_records: 1,
      mean_temperature_c: 23.1,
      mean_salinity_psu: 4.8,
      mean_dissolved_oxygen_mg_l: 7.4
    },
    {
      station_id: 'ST003',
      station_name: 'Lower Reach - Prototype',
      river_mile: 32.7,
      latitude: 40.8,
      longitude: -73.98,
      region: 'Lower Hudson',
      year: 2025,
      month: 5,
      environmental_records: 1,
      mean_temperature_c: 17.8,
      mean_salinity_psu: 7.2,
      mean_dissolved_oxygen_mg_l: 8.6
    },
    {
      station_id: 'ST001',
      station_name: 'Upper Reach - Prototype',
      river_mile: 145.2,
      latitude: 42.25,
      longitude: -73.79,
      region: 'Upper Hudson',
      year: 2025,
      month: 8,
      environmental_records: 1,
      mean_temperature_c: 24.5,
      mean_salinity_psu: 3.9,
      mean_dissolved_oxygen_mg_l: 7
    }
  ],
  sampling_image_catalog: []
};

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const DATA_VERSION = '1.1.2';
const DATA_REQUEST_VERSION = `${DATA_VERSION}-${Date.now()}`;
const API_PORT = '8010';
const MIN_BIOLOGICAL_DEMO_ROWS = 100;
const MIN_ENVIRONMENTAL_DEMO_ROWS = 100;
const HOME_SNAPSHOT_COUNTS = {
  stations: 326,
  sampling_events: 7842,
  taxa: 171,
  observations: 10864
};
const DEMO_SUPABASE_URL = 'https://vnqulddrlhkftcqpekpl.supabase.co';
const DEMO_SUPABASE_KEY_STORAGE = 'hrbmp_demo_supabase_publishable_key';
const DEMO_ADMIN_EMAIL = 'chengxue.li@stonybrook.edu';
const DEMO_ARCHIVE_SELECT = [
  'sample_id',
  'program',
  'sample_date',
  'river_mile',
  'river_region_number',
  'river_region_name',
  'taxon_code',
  'common_name',
  'scientific_name',
  'young_of_year_count_corrected',
  'yearling_count_corrected',
  'older_count_corrected',
  'yearling_and_older_count_corrected',
  'total_count_corrected',
  'asset_kind',
  'storage_bucket',
  'storage_object_path',
  'original_file_name',
  'mime_type',
  'file_size_bytes',
  'image_view',
  'sheet_code',
  'effective_access_level'
].join(',');
const ADMIN_REQUEST_SELECT = [
  'request_id',
  'created_at',
  'request_status',
  'requester_name',
  'requester_email',
  'requester_affiliation',
  'intended_use',
  'request_notes',
  'selected_program',
  'selected_species',
  'selected_region',
  'selected_sample_id',
  'year_start',
  'year_end',
  'requested_data_types',
  'matching_row_count',
  'public_row_count',
  'request_summary',
  'request_payload'
].join(',');

const DEMO_REGION_CODE_LABELS = {
  BT: 'BT - Battery',
  YK: 'YK - Yonkers',
  TZ: 'TZ - Tappan Zee',
  CH: 'CH - Croton-Haverstraw',
  IP: 'IP - Indian Point',
  WP: 'WP - West Point',
  CW: 'CW - Cornwall',
  PK: 'PK - Poughkeepsie',
  HP: 'HP - Hyde Park',
  KG: 'KG - Kingston',
  SG: 'SG - Saugerties',
  CS: 'CS - Catskill',
  AL: 'AL - Albany'
};

const DEMO_FALLBACK_SAMPLES = {
  '98_20171023_1591': {
    sample_id: '98_20171023_1591',
    program: 'FJS',
    sample_date: '2017-10-23',
    river_mile: 8,
    river_region_number: 0,
    river_region_name: 'BT - Battery',
    latitude: 40.81,
    longitude: -73.98
  },
  '98_20171023_1592': {
    sample_id: '98_20171023_1592',
    program: 'FJS',
    sample_date: '2017-10-23',
    river_mile: 9,
    river_region_number: 0,
    river_region_name: 'BT - Battery',
    latitude: 40.82,
    longitude: -73.97
  }
};

const DEMO_FALLBACK_SAMPLE_TAXA = [
  {
    sample_id: '98_20171023_1591',
    taxon_code: 1,
    common_name: 'ALEWIFE',
    young_of_year_count_corrected: 1,
    yearling_count_corrected: 0,
    older_count_corrected: 0,
    yearling_and_older_count_corrected: 0,
    total_count_corrected: 1
  },
  {
    sample_id: '98_20171023_1591',
    taxon_code: 2,
    common_name: 'BAY ANCHOVY',
    young_of_year_count_corrected: 0,
    yearling_count_corrected: 2,
    older_count_corrected: 0,
    yearling_and_older_count_corrected: 2,
    total_count_corrected: 4
  },
  {
    sample_id: '98_20171023_1591',
    taxon_code: 45,
    common_name: 'WEAKFISH',
    young_of_year_count_corrected: 2,
    yearling_count_corrected: 0,
    older_count_corrected: 0,
    yearling_and_older_count_corrected: 0,
    total_count_corrected: 2
  },
  {
    sample_id: '98_20171023_1592',
    taxon_code: 2,
    common_name: 'BAY ANCHOVY',
    young_of_year_count_corrected: 2,
    yearling_count_corrected: 0,
    older_count_corrected: 0,
    yearling_and_older_count_corrected: 0,
    total_count_corrected: 2
  }
];

const DEMO_FALLBACK_ASSETS = [
  { sample_id: '98_20171023_1591', asset_kind: 'jar_label_image', original_file_name: '98_20171023_1591_J01.JPG', mime_type: 'image/jpeg', sheet_code: 'J01' },
  { sample_id: '98_20171023_1591', asset_kind: 'field_sheet_pdf', original_file_name: '98_20171023_1591_SC1.pdf', mime_type: 'application/pdf', sheet_code: 'SC1' },
  { sample_id: '98_20171023_1591', asset_kind: 'lab_sheet_pdf', original_file_name: '98_20171023_1591_LW1.pdf', mime_type: 'application/pdf', sheet_code: 'LW1' },
  { sample_id: '98_20171023_1591', taxon_code: 1, asset_kind: 'representative_species_image', original_file_name: '98_20171023_1591_J01_001_04_01_01.JPG', mime_type: 'image/jpeg', image_view: 'left_side', sheet_code: 'J01' },
  { sample_id: '98_20171023_1591', taxon_code: 1, asset_kind: 'representative_species_image', original_file_name: '98_20171023_1591_J01_001_04_01_02.JPG', mime_type: 'image/jpeg', image_view: 'right_side', sheet_code: 'J01' },
  { sample_id: '98_20171023_1591', taxon_code: 45, asset_kind: 'representative_species_image', original_file_name: '98_20171023_1591_J01_045_04_01_01.JPG', mime_type: 'image/jpeg', image_view: 'left_side', sheet_code: 'J01' },
  { sample_id: '98_20171023_1591', taxon_code: 45, asset_kind: 'representative_species_image', original_file_name: '98_20171023_1591_J01_045_04_01_02.JPG', mime_type: 'image/jpeg', image_view: 'right_side', sheet_code: 'J01' },
  { sample_id: '98_20171023_1592', asset_kind: 'jar_label_image', original_file_name: '98_20171023_1592_J01.JPG', mime_type: 'image/jpeg', sheet_code: 'J01' },
  { sample_id: '98_20171023_1592', asset_kind: 'field_sheet_pdf', original_file_name: '98_20171023_1592_SC1.pdf', mime_type: 'application/pdf', sheet_code: 'SC1' },
  { sample_id: '98_20171023_1592', asset_kind: 'lab_sheet_pdf', original_file_name: '98_20171023_1592_LW1.pdf', mime_type: 'application/pdf', sheet_code: 'LW1' },
  { sample_id: '98_20171023_1592', taxon_code: 2, asset_kind: 'representative_species_image', original_file_name: '98_20171023_1592_J01_002_04_01_01.JPG', mime_type: 'image/jpeg', image_view: 'left_side', sheet_code: 'J01' },
  { sample_id: '98_20171023_1592', taxon_code: 2, asset_kind: 'representative_species_image', original_file_name: '98_20171023_1592_J01_002_04_01_02.JPG', mime_type: 'image/jpeg', image_view: 'right_side', sheet_code: 'J01' }
];

const DEMO_FALLBACK_ARCHIVE_ROWS = buildDemoFallbackArchiveRows();

function buildDemoFallbackArchiveRows() {
  const rows = [];
  DEMO_FALLBACK_SAMPLE_TAXA.forEach((taxonRow) => {
    const sample = DEMO_FALLBACK_SAMPLES[taxonRow.sample_id];
    if (!sample) return;

    DEMO_FALLBACK_ASSETS
      .filter((asset) => asset.sample_id === taxonRow.sample_id)
      .filter((asset) => !asset.taxon_code || Number(asset.taxon_code) === Number(taxonRow.taxon_code))
      .forEach((asset) => {
        rows.push({
          ...sample,
          ...taxonRow,
          scientific_name: null,
          storage_bucket: 'fjs-archive',
          storage_object_path: `samples/${asset.sample_id}/${asset.asset_kind}/${asset.original_file_name}`,
          original_file_name: asset.original_file_name,
          mime_type: asset.mime_type,
          file_size_bytes: null,
          image_view: asset.image_view || null,
          sheet_code: asset.sheet_code || null,
          asset_kind: asset.asset_kind,
          effective_access_level: 'public'
        });
      });
  });
  return rows;
}

const BIOLOGICAL_MONITORING_PROGRAMS = [
  'Long River Survey',
  'Fall Juvenile Survey',
  'Beach Seine Survey'
];

const HUDSON_BOUNDS = [
  [40.45, -74.35],
  [42.95, -73.35]
];

const DEFAULT_BASEMAP = 'street';
const MAP_BASEMAPS = {
  street: {
    label: 'Street Map',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }
  },
  light: {
    label: 'Light Reference',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    options: {
      maxZoom: 20,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }
  },
  topographic: {
    label: 'Topographic',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    options: {
      maxZoom: 17,
      attribution: '&copy; OpenStreetMap contributors, SRTM | OpenTopoMap'
    }
  },
  satellite: {
    label: 'Satellite Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri'
    }
  }
};

const HRBMP_REGIONS = [
  { number: 0, name: 'Battery', code: 'BT', river_mile_range: '0-11', min_river_mile: 0, max_river_mile: 11, latitude: 40.62, longitude: -74.03 },
  { number: 1, name: 'Yonkers', code: 'YK', river_mile_range: '12-23', min_river_mile: 12, max_river_mile: 23, latitude: 40.9, longitude: -73.9 },
  { number: 2, name: 'Tappan Zee', code: 'TZ', river_mile_range: '24-33', min_river_mile: 24, max_river_mile: 33, latitude: 41.06, longitude: -73.9 },
  { number: 3, name: 'Croton-Haverstraw', code: 'CH', river_mile_range: '34-38', min_river_mile: 34, max_river_mile: 38, latitude: 41.2, longitude: -73.91 },
  { number: 4, name: 'Indian Point', code: 'IP', river_mile_range: '39-46', min_river_mile: 39, max_river_mile: 46, latitude: 41.3, longitude: -73.95 },
  { number: 5, name: 'West Point', code: 'WP', river_mile_range: '47-55', min_river_mile: 47, max_river_mile: 55, latitude: 41.4, longitude: -73.96 },
  { number: 6, name: 'Cornwall', code: 'CW', river_mile_range: '56-61', min_river_mile: 56, max_river_mile: 61, latitude: 41.47, longitude: -74.0 },
  { number: 7, name: 'Poughkeepsie', code: 'PK', river_mile_range: '62-76', min_river_mile: 62, max_river_mile: 76, latitude: 41.67, longitude: -73.94 },
  { number: 8, name: 'Hyde Park', code: 'HP', river_mile_range: '77-85', min_river_mile: 77, max_river_mile: 85, latitude: 41.82, longitude: -73.95 },
  { number: 9, name: 'Kingston', code: 'KG', river_mile_range: '86-93', min_river_mile: 86, max_river_mile: 93, latitude: 41.93, longitude: -73.96 },
  { number: 10, name: 'Saugerties', code: 'SG', river_mile_range: '94-106', min_river_mile: 94, max_river_mile: 106, latitude: 42.07, longitude: -73.93 },
  { number: 11, name: 'Catskill', code: 'CS', river_mile_range: '107-124', min_river_mile: 107, max_river_mile: 124, latitude: 42.22, longitude: -73.86 },
  { number: 12, name: 'Albany', code: 'AL', river_mile_range: '125-152', min_river_mile: 125, max_river_mile: 152, latitude: 42.58, longitude: -73.75 }
];

const HRBMP_REGIONS_BY_NAME = new Map(HRBMP_REGIONS.map((region) => [region.name.toLowerCase(), region]));

const FALLBACK_METADATA = {
  datasets: [
    {
      dataset_name: 'Biological Records',
      source_database: 'HRBMP database',
      default_access_level: 'public_summary',
      api_endpoint: '/api/biological-records'
    },
    {
      dataset_name: 'Environmental Records',
      source_database: 'HRBMP database',
      default_access_level: 'public_summary',
      api_endpoint: '/api/environmental-records'
    },
    {
      dataset_name: 'Metadata Catalog',
      source_database: 'HRBMP database',
      default_access_level: 'public',
      api_endpoint: '/api/metadata'
    }
  ],
  variables: [
    { display_name: 'Common Name', source_database: 'HRBMP database', unit: '', value_type: 'text' },
    { display_name: 'Scientific Name', source_database: 'HRBMP database', unit: '', value_type: 'text' },
    { display_name: 'Life Stage', source_database: 'HRBMP database', unit: '', value_type: 'category' },
    { display_name: 'Count', source_database: 'HRBMP database', unit: 'individuals', value_type: 'integer' },
    { display_name: 'Water Temperature', source_database: 'HRBMP database', unit: 'deg C', value_type: 'numeric' },
    { display_name: 'Dissolved Oxygen', source_database: 'HRBMP database', unit: 'mg/L', value_type: 'numeric' },
    { display_name: 'Discharge', source_database: 'USGS database', unit: 'ft3/s', value_type: 'numeric' },
    { display_name: 'pH', source_database: 'EPA database', unit: 'standard units', value_type: 'numeric' },
    { display_name: 'Water Level', source_database: 'NOAA database', unit: 'm', value_type: 'numeric' }
  ],
  access_levels: [
    {
      access_level_id: 'public',
      display_name: 'Public',
      login_required: 0,
      manual_approval_required: 0,
      description: 'Published metadata, maps, summaries, and public CSV exports that do not require login.'
    },
    {
      access_level_id: 'registered',
      display_name: 'Registered External User',
      login_required: 1,
      manual_approval_required: 0,
      description: 'Approved public-use datasets and higher-resolution non-sensitive downloads.'
    },
    {
      access_level_id: 'approved_research',
      display_name: 'Approved Research User',
      login_required: 1,
      manual_approval_required: 1,
      description: 'Restricted datasets released after manual review or data-use agreement.'
    },
    {
      access_level_id: 'internal',
      display_name: 'Data Manager',
      login_required: 1,
      manual_approval_required: 1,
      description: 'Internal QA/QC, metadata editing, data request review, and release preparation.'
    },
    {
      access_level_id: 'admin',
      display_name: 'Admin',
      login_required: 1,
      manual_approval_required: 1,
      description: 'User management, full database operations, and system administration.'
    }
  ],
  roles: [
    { role_id: 'public', display_name: 'Public', role_rank: 0, login_required: 0 },
    { role_id: 'registered_external', display_name: 'Registered External User', role_rank: 10, login_required: 1 },
    { role_id: 'approved_research', display_name: 'Approved Research User', role_rank: 20, login_required: 1 },
    { role_id: 'data_manager', display_name: 'Data Manager', role_rank: 30, login_required: 1 },
    { role_id: 'admin', display_name: 'Admin', role_rank: 40, login_required: 1 }
  ],
  dataset_access_policy: [
    { dataset_id: 'metadata-catalog', dataset_name: 'Metadata Catalog', access_level_name: 'Public', release_status: 'published', contains_sensitive_data: 0 },
    { dataset_id: 'biological-records', dataset_name: 'Biological Records', access_level_name: 'Public', release_status: 'published', contains_sensitive_data: 0 },
    { dataset_id: 'environmental-records', dataset_name: 'Environmental Records', access_level_name: 'Public', release_status: 'published', contains_sensitive_data: 0 },
    { dataset_id: 'sampling-image-catalog', dataset_name: 'Sampling Image Catalog', access_level_name: 'Registered External User', release_status: 'qa_qc', contains_sensitive_data: 0 }
  ],
  dataset_role_permissions: [],
  programs: BIOLOGICAL_MONITORING_PROGRAMS.map((program) => ({ program_name: program })),
  regions: HRBMP_REGIONS.map((region) => ({
    region_code: region.code,
    region_number: region.number,
    region_name: region.name,
    river_mile_start: region.min_river_mile,
    river_mile_end: region.max_river_mile
  })),
  sources: []
};

const HUDSON_CENTERLINE = [
  { river_mile: 0, latitude: 40.55, longitude: -74.03 },
  { river_mile: 11, latitude: 40.72, longitude: -74.00 },
  { river_mile: 23, latitude: 40.94, longitude: -73.90 },
  { river_mile: 33, latitude: 41.10, longitude: -73.87 },
  { river_mile: 38, latitude: 41.20, longitude: -73.91 },
  { river_mile: 46, latitude: 41.31, longitude: -73.95 },
  { river_mile: 55, latitude: 41.41, longitude: -73.96 },
  { river_mile: 61, latitude: 41.47, longitude: -74.01 },
  { river_mile: 76, latitude: 41.70, longitude: -73.94 },
  { river_mile: 85, latitude: 41.84, longitude: -73.95 },
  { river_mile: 93, latitude: 41.93, longitude: -73.96 },
  { river_mile: 106, latitude: 42.08, longitude: -73.93 },
  { river_mile: 124, latitude: 42.26, longitude: -73.80 },
  { river_mile: 152, latitude: 42.65, longitude: -73.75 }
];

const BIOLOGICAL_DEMO_REGION_COUNTS = {
  BT: 3,
  YK: 14,
  TZ: 5,
  CH: 11,
  IP: 2,
  WP: 9,
  CW: 6,
  PK: 17,
  HP: 4,
  KG: 8,
  SG: 12,
  CS: 1,
  AL: 8
};

const ENVIRONMENTAL_DEMO_REGION_COUNTS = { ...BIOLOGICAL_DEMO_REGION_COUNTS };

const BIOLOGICAL_DEMO_SPECIES = [
  ['Atlantic Tomcod', 'Microgadus tomcod'],
  ['American Shad', 'Alosa sapidissima'],
  ['Striped Bass', 'Morone saxatilis'],
  ['White Perch', 'Morone americana'],
  ['Bay Anchovy', 'Anchoa mitchilli'],
  ['Alewife', 'Alosa pseudoharengus'],
  ['Blueback Herring', 'Alosa aestivalis'],
  ['Rainbow Smelt', 'Osmerus mordax'],
  ['Yellow Perch', 'Perca flavescens'],
  ['Spottail Shiner', 'Notropis hudsonius'],
  ['Bluefish', 'Pomatomus saltatrix'],
  ['Hogchoker', 'Trinectes maculatus'],
  ['Atlantic Menhaden', 'Brevoortia tyrannus']
];

const ENV_SOURCES = {
  hrbmp: {
    label: 'HRBMP Database',
    variables: [
      'mean_temperature_c',
      'mean_dissolved_oxygen_mg_l',
      'mean_conductivity_us_cm',
      'sampling_depth_m',
      'mean_salinity_psu'
    ]
  },
  usgs: {
    label: 'USGS Database',
    variables: [
      'usgs_discharge_cfs',
      'usgs_tide_stage_m',
      'usgs_gage_height_ft',
      'usgs_salt_front_river_mile',
      'usgs_specific_conductance_us_cm',
      'usgs_freshwater_inflow_cfs'
    ]
  },
  epa: {
    label: 'EPA Database',
    variables: [
      'epa_nutrients_index',
      'epa_ph',
      'epa_turbidity_ntu',
      'epa_bacteria_cfu_100ml',
      'epa_metals_index',
      'epa_pcb_pfas_index',
      'epa_contaminants_index'
    ]
  },
  noaa: {
    label: 'NOAA Database',
    variables: [
      'noaa_water_level_m',
      'noaa_tide_stage_m',
      'noaa_current_speed_ms',
      'noaa_wind_speed_ms',
      'noaa_air_temperature_c',
      'noaa_water_temperature_c',
      'noaa_salinity_psu',
      'noaa_conductivity_us_cm',
      'noaa_air_pressure_hpa'
    ]
  }
};

const ENV_VARIABLES = {
  mean_temperature_c: {
    source: 'hrbmp',
    label: 'Water Temperature',
    unit: 'deg C',
    colors: ['#2f6f9f', '#1e8f84', '#bd7a1e']
  },
  mean_dissolved_oxygen_mg_l: {
    source: 'hrbmp',
    label: 'Dissolved Oxygen',
    unit: 'mg/L',
    colors: ['#c85b4f', '#bd7a1e', '#1e8f84']
  },
  mean_conductivity_us_cm: {
    source: 'hrbmp',
    label: 'Conductivity',
    unit: 'uS/cm',
    colors: ['#1e8f84', '#2f6f9f', '#6f61a8']
  },
  sampling_depth_m: {
    source: 'hrbmp',
    label: 'Sampling Depth',
    unit: 'm',
    colors: ['#bd7a1e', '#2f6f9f', '#173330']
  },
  mean_salinity_psu: {
    source: 'hrbmp',
    label: 'Salinity',
    unit: 'PSU',
    colors: ['#1e8f84', '#2f6f9f', '#6f61a8']
  },
  usgs_discharge_cfs: {
    source: 'usgs',
    label: 'Discharge',
    unit: 'cfs',
    colors: ['#2f6f9f', '#1e8f84', '#173330']
  },
  usgs_tide_stage_m: {
    source: 'usgs',
    label: 'Tide Stage',
    unit: 'm',
    colors: ['#6f61a8', '#2f6f9f', '#1e8f84']
  },
  usgs_gage_height_ft: {
    source: 'usgs',
    label: 'Gage Height',
    unit: 'ft',
    colors: ['#2f6f9f', '#bd7a1e', '#c85b4f']
  },
  usgs_salt_front_river_mile: {
    source: 'usgs',
    label: 'Salt-Front Position',
    unit: 'river mile',
    colors: ['#1e8f84', '#bd7a1e', '#c85b4f']
  },
  usgs_specific_conductance_us_cm: {
    source: 'usgs',
    label: 'Specific Conductance',
    unit: 'uS/cm',
    colors: ['#1e8f84', '#2f6f9f', '#6f61a8']
  },
  usgs_freshwater_inflow_cfs: {
    source: 'usgs',
    label: 'Freshwater Inflow',
    unit: 'cfs',
    colors: ['#2f6f9f', '#1e8f84', '#173330']
  },
  epa_nutrients_index: {
    source: 'epa',
    label: 'Nutrients',
    unit: 'index',
    colors: ['#1e8f84', '#bd7a1e', '#c85b4f']
  },
  epa_ph: {
    source: 'epa',
    label: 'pH',
    unit: 'pH',
    colors: ['#2f6f9f', '#1e8f84', '#bd7a1e']
  },
  epa_turbidity_ntu: {
    source: 'epa',
    label: 'Turbidity',
    unit: 'NTU',
    colors: ['#1e8f84', '#bd7a1e', '#c85b4f']
  },
  epa_bacteria_cfu_100ml: {
    source: 'epa',
    label: 'Bacteria',
    unit: 'CFU/100 mL',
    colors: ['#1e8f84', '#bd7a1e', '#c85b4f']
  },
  epa_metals_index: {
    source: 'epa',
    label: 'Metals',
    unit: 'index',
    colors: ['#1e8f84', '#bd7a1e', '#c85b4f']
  },
  epa_pcb_pfas_index: {
    source: 'epa',
    label: 'PCBs / PFAS',
    unit: 'index',
    colors: ['#1e8f84', '#bd7a1e', '#c85b4f']
  },
  epa_contaminants_index: {
    source: 'epa',
    label: 'Other Contaminants',
    unit: 'index',
    colors: ['#1e8f84', '#bd7a1e', '#c85b4f']
  },
  noaa_water_level_m: {
    source: 'noaa',
    label: 'Water Level',
    unit: 'm',
    colors: ['#2f6f9f', '#1e8f84', '#173330']
  },
  noaa_tide_stage_m: {
    source: 'noaa',
    label: 'Tides',
    unit: 'm',
    colors: ['#6f61a8', '#2f6f9f', '#1e8f84']
  },
  noaa_current_speed_ms: {
    source: 'noaa',
    label: 'Currents',
    unit: 'm/s',
    colors: ['#2f6f9f', '#1e8f84', '#bd7a1e']
  },
  noaa_wind_speed_ms: {
    source: 'noaa',
    label: 'Winds',
    unit: 'm/s',
    colors: ['#1e8f84', '#bd7a1e', '#c85b4f']
  },
  noaa_air_temperature_c: {
    source: 'noaa',
    label: 'Air Temperature',
    unit: 'deg C',
    colors: ['#2f6f9f', '#1e8f84', '#bd7a1e']
  },
  noaa_water_temperature_c: {
    source: 'noaa',
    label: 'Water Temperature',
    unit: 'deg C',
    colors: ['#2f6f9f', '#1e8f84', '#bd7a1e']
  },
  noaa_salinity_psu: {
    source: 'noaa',
    label: 'Salinity',
    unit: 'PSU',
    colors: ['#1e8f84', '#2f6f9f', '#6f61a8']
  },
  noaa_conductivity_us_cm: {
    source: 'noaa',
    label: 'Conductivity',
    unit: 'uS/cm',
    colors: ['#1e8f84', '#2f6f9f', '#6f61a8']
  },
  noaa_air_pressure_hpa: {
    source: 'noaa',
    label: 'Atmospheric Pressure',
    unit: 'hPa',
    colors: ['#6f61a8', '#2f6f9f', '#1e8f84']
  },
};

const KEY_SPECIES_NAMES = [
  'Atlantic tomcod',
  'American shad',
  'Striped bass',
  'White perch',
  'Bay anchovy',
  'Alewife',
  'Blueback herring',
  'Rainbow smelt',
  'Yellow perch',
  'Spottail shiner',
  'Bluefish',
  'Hogchoker',
  'Atlantic menhaden'
];

const HIGHLIGHT_SPECIES_ORDER = KEY_SPECIES_NAMES;

const ALL_SPECIES_NAMES = [
  'Silver lamprey',
  'American brook lamprey',
  'Sea lamprey',
  'Smooth dogfish',
  'Spiny dogfish',
  'Little skate',
  'Barndoor skate',
  'Bluntnose stingray',
  'Shortnose sturgeon',
  'Lake sturgeon',
  'Atlantic sturgeon',
  'Longnose gar',
  'Bowfin',
  'American eel',
  'Blueback herring',
  'Hickory shad',
  'Alewife',
  'American shad',
  'Atlantic menhaden',
  'Atlantic herring',
  'Gizzard shad',
  'Bay anchovy',
  'Central stoneroller',
  'Goldfish',
  'Redside dace',
  'Grass carp',
  'Satinfin shiner',
  'Spotfin shiner',
  'Common carp',
  'Cutlips minnow',
  'Brassy minnow',
  'Eastern silvery minnow',
  'Bridle shiner',
  'Ironcolor shiner',
  'Common shiner',
  'Pearl dace',
  'Hornyhead chub',
  'Golden shiner',
  'Emerald shiner',
  'Blackchin shiner',
  'Blacknose shiner',
  'Spottail shiner',
  'Bluntnose minnow',
  'Fathead minnow',
  'Longnose dace',
  'Creek chub',
  'Fallfish',
  'White sucker',
  'Northern hog sucker',
  'Shorthead redhorse',
  'White catfish',
  'Yellow bullhead',
  'Brown bullhead',
  'Channel catfish',
  'Stonecat',
  'Tadpole madtom',
  'Margined madtom',
  'Redfin pickerel',
  'Northern pike',
  'Chain pickerel',
  'Eastern mudminnow',
  'Rainbow smelt',
  'Lake whitefish',
  'Rainbow trout',
  'Atlantic salmon',
  'Brown trout',
  'Brook trout',
  'Lake trout',
  'Trout-perch',
  'Atlantic tomcod',
  'Oyster toadfish',
  'Atlantic needlefish',
  'Banded killifish',
  'Mummichog',
  'Striped killifish',
  'Brook silverside',
  'Atlantic silverside',
  'Fourspine stickleback',
  'Threespine stickleback',
  'Lined seahorse',
  'Northern pipefish',
  'Northern sea robin',
  'Striped sea robin',
  'Longhorn sculpin',
  'White perch',
  'Striped bass',
  'Black sea bass',
  'Mud sunfish',
  'Rock bass',
  'Redbreast sunfish',
  'Pumpkinseed',
  'Bluegill',
  'Smallmouth bass',
  'Largemouth bass',
  'Black crappie',
  'Tessellated darter',
  'Yellow perch',
  'Walleye',
  'Bluefish',
  'Weakfish',
  'Spot',
  'Atlantic croaker',
  'Black drum',
  'Striped mullet',
  'Tautog',
  'Cunner',
  'Naked goby',
  'Atlantic mackerel',
  'Butterfish',
  'Summer flounder',
  'Winter flounder',
  'Windowpane',
  'Hogchoker',
  'Northern puffer'
];

const SCIENTIFIC_NAME_LOOKUP = {
  'Atlantic tomcod': 'Microgadus tomcod',
  'American shad': 'Alosa sapidissima',
  'Striped bass': 'Morone saxatilis',
  'White perch': 'Morone americana',
  'Bay anchovy': 'Anchoa mitchilli',
  Alewife: 'Alosa pseudoharengus',
  'Blueback herring': 'Alosa aestivalis',
  'Rainbow smelt': 'Osmerus mordax',
  'Yellow perch': 'Perca flavescens',
  'Spottail shiner': 'Notropis hudsonius',
  Bluefish: 'Pomatomus saltatrix',
  Hogchoker: 'Trinectes maculatus',
  'Atlantic menhaden': 'Brevoortia tyrannus',
  'Atlantic sturgeon': 'Acipenser oxyrinchus oxyrinchus',
  'American eel': 'Anguilla rostrata'
};

const LEGACY_SPECIES_HIGHLIGHT_CATALOG = [
  {
    catalog_id: 'IMG-AE-2024-0610-01',
    highlight_rank: 1,
    species_common: 'American eel',
    species_scientific: 'Anguilla rostrata',
    image_type: 'Specimen photo',
    image_count: 1,
    life_stage: 'Juvenile',
    station_id: 'HRBMP-CH-04',
    station_name: 'Croton-Haverstraw Nearshore Prototype',
    region: 'Croton-Haverstraw',
    river_mile: 38.6,
    sample_date: '2024-06-10',
    year: 2024,
    month: 6,
    day: 10,
    gear_type: 'Beach seine',
    image_url: '',
    source_url: 'https://you.stonybrook.edu/hrbmp/database/species-highlights/',
    description: 'Pseudo specimen image metadata for a highlighted HRBMP species.'
  },
  {
    catalog_id: 'IMG-AE-2025-0722-02',
    highlight_rank: 1,
    species_common: 'American eel',
    species_scientific: 'Anguilla rostrata',
    image_type: 'Habitat photo',
    image_count: 1,
    life_stage: 'Glass eel / elver',
    station_id: 'HRBMP-TZ-02',
    station_name: 'Tappan Zee Tributary Mouth Prototype',
    region: 'Tappan Zee',
    river_mile: 25.4,
    sample_date: '2025-07-22',
    year: 2025,
    month: 7,
    day: 22,
    gear_type: 'Fyke net',
    image_url: '',
    source_url: 'https://you.stonybrook.edu/hrbmp/database/species-highlights/',
    description: 'Prototype habitat image record connected to eel sampling metadata.'
  },
  {
    catalog_id: 'IMG-AE-2026-0812-03',
    highlight_rank: 1,
    species_common: 'American eel',
    species_scientific: 'Anguilla rostrata',
    image_type: 'Voucher close-up',
    image_count: 1,
    life_stage: 'Adult',
    station_id: 'HRBMP-KG-03',
    station_name: 'Kingston Channel Prototype',
    region: 'Kingston',
    river_mile: 91.1,
    sample_date: '2026-08-12',
    year: 2026,
    month: 8,
    day: 12,
    gear_type: 'Trawl',
    image_url: '',
    source_url: 'https://you.stonybrook.edu/hrbmp/database/species-highlights/',
    description: 'Pseudo voucher image record for future verified specimen photos.'
  },
  {
    catalog_id: 'IMG-AS-2024-0508-01',
    highlight_rank: 2,
    species_common: 'Atlantic sturgeon',
    species_scientific: 'Acipenser oxyrinchus oxyrinchus',
    image_type: 'Specimen photo',
    image_count: 1,
    life_stage: 'Juvenile',
    station_id: 'HRBMP-WP-01',
    station_name: 'West Point Deepwater Prototype',
    region: 'West Point',
    river_mile: 52.8,
    sample_date: '2024-05-08',
    year: 2024,
    month: 5,
    day: 8,
    gear_type: 'Trawl',
    image_url: '',
    source_url: 'https://you.stonybrook.edu/hrbmp/database/species-highlights/',
    description: 'Pseudo protected-species image metadata for catalog layout testing.'
  },
  {
    catalog_id: 'IMG-AS-2025-0618-02',
    highlight_rank: 2,
    species_common: 'Atlantic sturgeon',
    species_scientific: 'Acipenser oxyrinchus oxyrinchus',
    image_type: 'Gear photo',
    image_count: 1,
    life_stage: 'Subadult',
    station_id: 'HRBMP-IP-02',
    station_name: 'Indian Point Mid-channel Prototype',
    region: 'Indian Point',
    river_mile: 42.7,
    sample_date: '2025-06-18',
    year: 2025,
    month: 6,
    day: 18,
    gear_type: 'Trawl',
    image_url: '',
    source_url: 'https://you.stonybrook.edu/hrbmp/database/species-highlights/',
    description: 'Prototype gear-context record for associating photos with survey events.'
  },
  {
    catalog_id: 'IMG-AS-2026-0924-03',
    highlight_rank: 2,
    species_common: 'Atlantic sturgeon',
    species_scientific: 'Acipenser oxyrinchus oxyrinchus',
    image_type: 'Voucher close-up',
    image_count: 1,
    life_stage: 'Juvenile',
    station_id: 'HRBMP-AL-01',
    station_name: 'Albany Reach Prototype',
    region: 'Albany',
    river_mile: 145.2,
    sample_date: '2026-09-24',
    year: 2026,
    month: 9,
    day: 24,
    gear_type: 'Trawl',
    image_url: '',
    source_url: 'https://you.stonybrook.edu/hrbmp/database/species-highlights/',
    description: 'Pseudo close-up record for future morphology or QA review images.'
  },
  {
    catalog_id: 'IMG-AT-2024-0118-01',
    highlight_rank: 3,
    species_common: 'Atlantic tomcod',
    species_scientific: 'Microgadus tomcod',
    image_type: 'Specimen photo',
    image_count: 1,
    life_stage: 'Adult',
    station_id: 'HRBMP-CS-02',
    station_name: 'Catskill Winter Survey Prototype',
    region: 'Catskill',
    river_mile: 113.6,
    sample_date: '2024-01-18',
    year: 2024,
    month: 1,
    day: 18,
    gear_type: 'Trawl',
    image_url: '',
    source_url: 'https://you.stonybrook.edu/hrbmp/database/species-highlights/',
    description: 'Pseudo winter specimen image metadata for a highlighted species.'
  },
  {
    catalog_id: 'IMG-AT-2025-0212-02',
    highlight_rank: 3,
    species_common: 'Atlantic tomcod',
    species_scientific: 'Microgadus tomcod',
    image_type: 'Habitat photo',
    image_count: 1,
    life_stage: 'Larval / Early Life Stage',
    station_id: 'HRBMP-SG-03',
    station_name: 'Saugerties Shoal Prototype',
    region: 'Saugerties',
    river_mile: 103.2,
    sample_date: '2025-02-12',
    year: 2025,
    month: 2,
    day: 12,
    gear_type: 'Plankton net',
    image_url: '',
    source_url: 'https://you.stonybrook.edu/hrbmp/database/species-highlights/',
    description: 'Prototype habitat record for linking photos to early-season sampling.'
  },
  {
    catalog_id: 'IMG-AT-2026-0315-03',
    highlight_rank: 3,
    species_common: 'Atlantic tomcod',
    species_scientific: 'Microgadus tomcod',
    image_type: 'Voucher close-up',
    image_count: 1,
    life_stage: 'Juvenile',
    station_id: 'HRBMP-PK-01',
    station_name: 'Poughkeepsie Channel Prototype',
    region: 'Poughkeepsie',
    river_mile: 76.9,
    sample_date: '2026-03-15',
    year: 2026,
    month: 3,
    day: 15,
    gear_type: 'Trawl',
    image_url: '',
    source_url: 'https://you.stonybrook.edu/hrbmp/database/species-highlights/',
    description: 'Pseudo close-up record for specimen image review workflows.'
  },
  {
    catalog_id: 'IMG-SB-2024-0524-01',
    highlight_rank: 4,
    species_common: 'Striped Bass',
    species_scientific: 'Morone saxatilis',
    image_type: 'Specimen photo',
    image_count: 1,
    life_stage: 'Young-of-year',
    station_id: 'HRBMP-YK-02',
    station_name: 'Yonkers Nearshore Prototype',
    region: 'Yonkers',
    river_mile: 18.7,
    sample_date: '2024-05-24',
    year: 2024,
    month: 5,
    day: 24,
    gear_type: 'Beach seine',
    image_url: '',
    source_url: 'https://you.stonybrook.edu/hrbmp/database/species-highlights/',
    description: 'Pseudo specimen image metadata for a focal HRBMP fish species.'
  },
  {
    catalog_id: 'IMG-SB-2025-0710-02',
    highlight_rank: 4,
    species_common: 'Striped Bass',
    species_scientific: 'Morone saxatilis',
    image_type: 'Gear photo',
    image_count: 1,
    life_stage: 'Adult',
    station_id: 'HRBMP-BT-01',
    station_name: 'Battery Reach Prototype',
    region: 'Battery',
    river_mile: 2.4,
    sample_date: '2025-07-10',
    year: 2025,
    month: 7,
    day: 10,
    gear_type: 'Trawl',
    image_url: '',
    source_url: 'https://you.stonybrook.edu/hrbmp/database/species-highlights/',
    description: 'Prototype gear image record for event-linked catalog testing.'
  },
  {
    catalog_id: 'IMG-SB-2026-0830-03',
    highlight_rank: 4,
    species_common: 'Striped Bass',
    species_scientific: 'Morone saxatilis',
    image_type: 'Voucher close-up',
    image_count: 1,
    life_stage: 'Juvenile',
    station_id: 'HRBMP-CH-02',
    station_name: 'Croton-Haverstraw Shoreline Prototype',
    region: 'Croton-Haverstraw',
    river_mile: 36.1,
    sample_date: '2026-08-30',
    year: 2026,
    month: 8,
    day: 30,
    gear_type: 'Beach seine',
    image_url: '',
    source_url: 'https://you.stonybrook.edu/hrbmp/database/species-highlights/',
    description: 'Pseudo close-up metadata for future specimen image QA.'
  },
  {
    catalog_id: 'IMG-WP-2024-0616-01',
    highlight_rank: 5,
    species_common: 'White Perch',
    species_scientific: 'Morone americana',
    image_type: 'Specimen photo',
    image_count: 1,
    life_stage: 'Adult',
    station_id: 'HRBMP-TZ-03',
    station_name: 'Tappan Zee Open-water Prototype',
    region: 'Tappan Zee',
    river_mile: 27.8,
    sample_date: '2024-06-16',
    year: 2024,
    month: 6,
    day: 16,
    gear_type: 'Trawl',
    image_url: '',
    source_url: 'https://you.stonybrook.edu/hrbmp/database/species-highlights/',
    description: 'Pseudo specimen image record for a common estuarine species.'
  },
  {
    catalog_id: 'IMG-WP-2025-0826-02',
    highlight_rank: 5,
    species_common: 'White Perch',
    species_scientific: 'Morone americana',
    image_type: 'Habitat photo',
    image_count: 1,
    life_stage: 'Juvenile',
    station_id: 'HRBMP-HP-01',
    station_name: 'Hyde Park Nearshore Prototype',
    region: 'Hyde Park',
    river_mile: 82.4,
    sample_date: '2025-08-26',
    year: 2025,
    month: 8,
    day: 26,
    gear_type: 'Beach seine',
    image_url: '',
    source_url: 'https://you.stonybrook.edu/hrbmp/database/species-highlights/',
    description: 'Prototype habitat image record for station-linked catalog browsing.'
  },
  {
    catalog_id: 'IMG-WP-2026-0918-03',
    highlight_rank: 5,
    species_common: 'White Perch',
    species_scientific: 'Morone americana',
    image_type: 'Voucher close-up',
    image_count: 1,
    life_stage: 'Young-of-year',
    station_id: 'HRBMP-CW-02',
    station_name: 'Cornwall Backwater Prototype',
    region: 'Cornwall',
    river_mile: 58.3,
    sample_date: '2026-09-18',
    year: 2026,
    month: 9,
    day: 18,
    gear_type: 'Beach seine',
    image_url: '',
    source_url: 'https://you.stonybrook.edu/hrbmp/database/species-highlights/',
    description: 'Pseudo close-up record for future verified catalog images.'
  }
];

const HIGHLIGHT_SPECIES = ALL_SPECIES_NAMES.map((speciesName, index) => {
  const rank = highlightRank(speciesName);
  return {
    prefix: speciesCode(speciesName),
    highlight_rank: rank === 999 ? 1000 + index : rank,
    is_key_species: rank !== 999,
    species_common: speciesName,
    species_scientific: SCIENTIFIC_NAME_LOOKUP[speciesName] || 'Scientific name pending'
  };
});

const CATALOG_LIFE_STAGE_DISTRIBUTION = [
  {
    stage_code: 'EGG',
    life_stage: 'Egg',
    image_type: 'Egg Image',
    station_id: 'HRBMP-AL-01',
    station_name: 'Albany Spawning Reach Prototype',
    region: 'Albany',
    river_mile: 145.2,
    sample_date: '2026-04-28',
    year: 2026,
    month: 4,
    day: 28,
    gear_type: 'Ichthyoplankton net'
  },
  {
    stage_code: 'YSL',
    life_stage: 'Yolk-Sac Larvae',
    image_type: 'Yolk-Sac Larvae Image',
    station_id: 'HRBMP-CS-02',
    station_name: 'Catskill Larval Drift Prototype',
    region: 'Catskill',
    river_mile: 113.6,
    sample_date: '2026-05-12',
    year: 2026,
    month: 5,
    day: 12,
    gear_type: 'Ichthyoplankton net'
  },
  {
    stage_code: 'PYSL',
    life_stage: 'Post-Yolk-Sac Larvae',
    image_type: 'Post-Yolk-Sac Larvae Image',
    station_id: 'HRBMP-PK-01',
    station_name: 'Poughkeepsie Nursery Drift Prototype',
    region: 'Poughkeepsie',
    river_mile: 76.9,
    sample_date: '2026-06-02',
    year: 2026,
    month: 6,
    day: 2,
    gear_type: 'Ichthyoplankton net'
  },
  {
    stage_code: 'YOY',
    life_stage: 'Young Of The Year',
    image_type: 'Young-Of-The-Year Image',
    station_id: 'HRBMP-CH-02',
    station_name: 'Croton-Haverstraw Nearshore Nursery Prototype',
    region: 'Croton-Haverstraw',
    river_mile: 36.1,
    sample_date: '2026-07-21',
    year: 2026,
    month: 7,
    day: 21,
    gear_type: 'Beach seine'
  },
  {
    stage_code: 'YRL',
    life_stage: 'Yearling',
    image_type: 'Yearling Image',
    station_id: 'HRBMP-TZ-03',
    station_name: 'Tappan Zee Open-water Yearling Prototype',
    region: 'Tappan Zee',
    river_mile: 27.8,
    sample_date: '2026-09-18',
    year: 2026,
    month: 9,
    day: 18,
    gear_type: 'Trawl'
  },
  {
    stage_code: 'ADULT',
    life_stage: 'Adult',
    image_type: 'Adult Image',
    station_id: 'HRBMP-BT-01',
    station_name: 'Battery Adult Survey Prototype',
    region: 'Battery',
    river_mile: 2.4,
    sample_date: '2026-10-06',
    year: 2026,
    month: 10,
    day: 6,
    gear_type: 'Trawl'
  }
];

const SPECIES_HIGHLIGHT_CATALOG = HIGHLIGHT_SPECIES.flatMap((species) =>
  CATALOG_LIFE_STAGE_DISTRIBUTION.map((stage, index) => ({
    catalog_id: `IMG-${species.prefix}-${stage.stage_code}-2026-${String(index + 1).padStart(2, '0')}`,
    highlight_rank: species.highlight_rank,
    species_common: species.species_common,
    species_scientific: species.species_scientific,
    is_key_species: species.is_key_species,
    image_type: stage.image_type,
    image_count: 1,
    life_stage: stage.life_stage,
    station_id: stage.station_id,
    station_name: stage.station_name,
    region: stage.region,
    river_mile: stage.river_mile,
    sample_date: stage.sample_date,
    year: stage.year,
    month: stage.month,
    day: stage.day,
    gear_type: stage.gear_type,
    image_url: '',
    source_url: 'https://you.stonybrook.edu/hrbmp/database/species-highlights/',
    description: `${stage.life_stage} placeholder image metadata and prototype distribution point for ${species.species_common}.`
  }))
);

const FIELD_SAMPLING_PHOTO_GROUPS = [
  {
    key: 'people',
    heading: 'People With Fish',
    patterns: [
      /holding/i,
      /with channel catfish/i,
      /recording (?:surgeon|sturgeon) data/i,
      /counting hogchoker/i
    ]
  },
  {
    key: 'fish',
    heading: 'Fish',
    patterns: [
      /alewife|anchov|bass|butterfish|catfish|crab|eel|fish|flounder|goby|hake|hogchoker|img 3914|moonfish|perch|sturgeon|sucker|toadfish|tomcod|weakfish/i
    ]
  },
  {
    key: 'cruise',
    heading: 'Cruise And Vessel Photos',
    patterns: [
      /deckhand|nyc|stern|stormy|sunset|waterquality|woody/i
    ]
  }
];

const LAB_SAMPLE_PROCESSING_PHOTO_GROUPS = [
  {
    key: 'sample-processing',
    heading: 'Sample Processing',
    patterns: [
      /doing lab work|processing [12]|rinsing fish/i
    ]
  },
  {
    key: 'digital-archive',
    heading: 'Digital Archive',
    patterns: [
      /fish photography|focusing|high resolution|specimen/i
    ]
  },
  {
    key: 'sample-handling',
    heading: 'Sample Handling And Safety',
    patterns: [
      /exposure|formalin|labels|warehouse/i
    ]
  }
];

const state = {
  ready: false,
  data: null,
  metadata: FALLBACK_METADATA,
  biologicalRows: [],
  environmentalRows: [],
  maps: {
    biological: null,
    environmental: null
  },
  layers: {
    biological: [],
    environmental: []
  },
  baseLayers: {
    biological: null,
    environmental: null
  },
  legends: {
    biological: null,
    environmental: null
  },
  selectedEnvSource: 'hrbmp',
  selectedCatalogSpecies: null,
  selectedCatalogLifeStage: null,
  demoRows: DEMO_FALLBACK_ARCHIVE_ROWS.map(normalizeDemoArchiveRow),
  demoRowsSource: 'fallback',
  demoLastFilteredRows: [],
  demoApiLoaded: false,
  adminClient: null,
  adminClientKey: '',
  adminRequests: [],
  adminRequestView: 'submitted',
  adminDeliveryInFlight: new Set(),
  adminReviewedRequestIds: new Set(),
  adminSessionEmail: ''
};

document.addEventListener('DOMContentLoaded', () => {
  organizeFieldSamplingGallery();
  organizeLabSampleProcessingGallery();
  initTabs();

  Promise.all([
    loadJson(`./data/example_summary.json?v=${DATA_REQUEST_VERSION}`, FALLBACK_DATA),
    loadJson(`./data/biological_availability.geojson?v=${DATA_REQUEST_VERSION}`, null),
    loadJson(`./data/environmental_availability.geojson?v=${DATA_REQUEST_VERSION}`, null),
    loadJson(apiUrl('/metadata'), FALLBACK_METADATA)
  ])
    .then(([summary, biologicalGeoJson, environmentalGeoJson, metadata]) => {
      state.data = hydrateData(summary, biologicalGeoJson, environmentalGeoJson);
      state.metadata = hydrateMetadata(metadata);
      state.biologicalRows = state.data.biological_availability;
      state.environmentalRows = state.data.environmental_availability;
      state.ready = true;
      renderAll();
      bindControls();
      refreshActiveMap();
    })
    .catch((error) => {
      console.error(error);
      state.data = hydrateData({ ...FALLBACK_DATA, using_fallback: true }, null, null);
      state.metadata = hydrateMetadata({ ...FALLBACK_METADATA, using_fallback: true });
      state.biologicalRows = state.data.biological_availability;
      state.environmentalRows = state.data.environmental_availability;
      state.ready = true;
      renderAll();
      bindControls();
      refreshActiveMap();
    });
});

async function loadJson(path, fallback) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to load ${path}`);
    return response.json();
  } catch (error) {
    if (fallback === null) return null;
    console.warn(`Using fallback data for ${path}:`, error);
    return {
      ...fallback,
      using_fallback: true,
      note: ''
    };
  }
}

function initTabs() {
  const links = document.querySelectorAll('[data-tab-link]');
  const pages = document.querySelectorAll('[data-tab-page]');
  const pageIds = new Set(Array.from(pages).map((page) => page.dataset.tabPage));
  const parentByTab = new Map();

  document.querySelectorAll('.nav-dropdown').forEach((dropdown) => {
    const parentLink = Array.from(dropdown.children).find((child) => child.matches('[data-tab-link]'));
    if (!parentLink) return;
    dropdown.querySelectorAll('.nav-submenu [data-tab-link]').forEach((childLink) => {
      parentByTab.set(childLink.dataset.tabLink, parentLink.dataset.tabLink);
    });
  });

  function showTab(tabId, updateHash = true) {
    const nextId = pageIds.has(tabId) ? tabId : 'home';
    const parentId = parentByTab.get(nextId);

    pages.forEach((page) => {
      page.classList.toggle('active', page.dataset.tabPage === nextId);
    });

    links.forEach((link) => {
      link.classList.toggle('active', link.dataset.tabLink === nextId || link.dataset.tabLink === parentId);
    });

    if (updateHash && window.location.hash !== `#${nextId}`) {
      window.history.pushState(null, '', `#${nextId}`);
    }

    window.dispatchEvent(new CustomEvent('hrbmp-tab-change', { detail: { tabId: nextId } }));
  }

  const siteSearchForm = document.getElementById('site-search-form');
  const siteSearchInput = document.getElementById('site-search-input');
  const siteSearchOptions = document.getElementById('site-search-options');
  const siteSearchItems = [];
  const siteSearchSeen = new Set();

  function normalizeSiteSearchText(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function navSearchLabel(link) {
    const label = link.textContent.trim().replace(/\s+/g, ' ');
    const nestedParent = link.closest('.nav-nested-submenu')
      ?.closest('.nav-subitem')
      ?.querySelector(':scope > a');
    const dropdownParent = link.closest('.nav-submenu')
      ?.closest('.nav-dropdown')
      ?.querySelector(':scope > a');
    const parentLabel = nestedParent && nestedParent !== link
      ? nestedParent.textContent.trim().replace(/\s+/g, ' ')
      : dropdownParent && dropdownParent !== link
        ? dropdownParent.textContent.trim().replace(/\s+/g, ' ')
        : '';

    return parentLabel && parentLabel !== label ? `${parentLabel} - ${label}` : label;
  }

  function addSiteSearchItem(label, action, keywords = '') {
    const cleanLabel = String(label || '').trim().replace(/\s+/g, ' ');
    if (!cleanLabel) return;

    const searchText = normalizeSiteSearchText(`${cleanLabel} ${keywords}`);
    const key = `${cleanLabel.toLowerCase()}|${searchText}`;
    if (siteSearchSeen.has(key)) return;

    siteSearchSeen.add(key);
    siteSearchItems.push({
      label: cleanLabel,
      normalizedLabel: normalizeSiteSearchText(cleanLabel),
      searchText,
      action
    });

    if (siteSearchOptions) {
      const option = document.createElement('option');
      option.value = cleanLabel;
      siteSearchOptions.append(option);
    }
  }

  function navigateSiteSearchItem(item) {
    item.action();
    if (siteSearchInput) {
      siteSearchInput.value = item.label;
      siteSearchInput.setCustomValidity('');
      siteSearchInput.blur();
    }
  }

  function runSiteSearch(query) {
    const normalizedQuery = normalizeSiteSearchText(query);
    if (!normalizedQuery) return;

    const queryTokens = normalizedQuery.split(' ').filter(Boolean);
    const match = siteSearchItems.find((item) => item.normalizedLabel === normalizedQuery)
      || siteSearchItems.find((item) => item.searchText.startsWith(normalizedQuery))
      || siteSearchItems.find((item) => item.searchText.includes(normalizedQuery))
      || siteSearchItems.find((item) => queryTokens.every((token) => item.searchText.includes(token)));

    if (match) {
      navigateSiteSearchItem(match);
      return;
    }

    if (siteSearchInput) {
      siteSearchInput.setCustomValidity('No matching portal section found.');
      siteSearchInput.reportValidity();
      window.setTimeout(() => siteSearchInput.setCustomValidity(''), 1800);
    }
  }

  if (siteSearchOptions) {
    siteSearchOptions.innerHTML = '';
  }

  document.querySelectorAll('.site-nav [data-tab-link]').forEach((link) => {
    const tabId = link.dataset.tabLink;
    addSiteSearchItem(
      navSearchLabel(link),
      () => showTab(tabId),
      `${tabId.replace(/-/g, ' ')} ${link.textContent}`
    );
  });

  [
    ['Data Sharing Policy - Biological Request', 'biological-data-request', 'biological-data-sharing-policy', 'biological data request must read consent'],
    ['Data Sharing Policy - Environmental Request', 'environmental-data-request', 'environmental-data-sharing-policy', 'environmental data request must read consent'],
    ['Data Sharing Policy - Demo Request', 'demo', 'demo-data-sharing-policy', 'demo data request archive must read consent']
  ].forEach(([label, pageId, targetId, keywords]) => {
    addSiteSearchItem(label, () => {
      showTab(pageId);
      const target = document.getElementById(targetId);
      if (!target) return;

      window.requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.focus({ preventScroll: true });
      });
    }, keywords);
  });

  [
    {
      selector: '[data-curriculum-focus]',
      pageId: 'education-k12-curriculum',
      datasetKey: 'curriculumFocus',
      keywords: 'k 12 curriculum education classroom',
      focus: (sectionId) => focusCurriculumSection(sectionId)
    },
    {
      selector: '[data-fish-tale-focus]',
      pageId: 'education-fish-tales',
      datasetKey: 'fishTaleFocus',
      keywords: 'fish tales species key species',
      focus: (sectionId) => focusEducationTopic('education-fish-tales', 'fish-tale', sectionId)
    },
    {
      selector: '[data-history-focus]',
      pageId: 'education-history',
      datasetKey: 'historyFocus',
      keywords: 'history hrbmp storymap',
      focus: (sectionId) => focusHistorySection(sectionId)
    },
    {
      selector: '[data-interview-focus]',
      pageId: 'education-interviews',
      datasetKey: 'interviewFocus',
      keywords: 'oral interviews video watch',
      focus: (sectionId) => focusInterviewSection(sectionId)
    },
    {
      selector: '[data-classroom-focus]',
      pageId: 'education-classroom',
      datasetKey: 'classroomFocus',
      keywords: 'classroom materials lessons worksheets slides',
      focus: (sectionId) => focusEducationTopic('education-classroom', 'classroom', sectionId)
    },
    {
      selector: '[data-outreach-focus]',
      pageId: 'education-outreach',
      datasetKey: 'outreachFocus',
      keywords: 'outreach activities public community',
      focus: (sectionId) => focusEducationTopic('education-outreach', 'outreach', sectionId)
    }
  ].forEach((config) => {
    document.querySelectorAll(`.site-nav ${config.selector}`).forEach((link) => {
      const sectionId = link.dataset[config.datasetKey] || '';
      addSiteSearchItem(
        navSearchLabel(link),
        () => {
          showTab(config.pageId);
          config.focus(sectionId);
        },
        `${sectionId.replace(/-/g, ' ')} ${config.keywords} ${link.textContent}`
      );
    });
  });

  if (siteSearchForm && siteSearchInput) {
    siteSearchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      runSiteSearch(siteSearchInput.value);
    });

    siteSearchInput.addEventListener('change', () => {
      const selected = siteSearchItems.find((item) => item.label === siteSearchInput.value);
      if (selected) navigateSiteSearchItem(selected);
    });
  }

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showTab(link.dataset.tabLink);
    });
  });

  document.querySelectorAll('[data-curriculum-focus]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showTab('education-k12-curriculum');
      focusCurriculumSection(link.dataset.curriculumFocus);
    });
  });

  document.querySelectorAll('[data-fish-tale-focus]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showTab('education-fish-tales');
      focusEducationTopic('education-fish-tales', 'fish-tale', link.dataset.fishTaleFocus);
    });
  });

  document.querySelectorAll('[data-history-focus]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showTab('education-history');
      focusHistorySection(link.dataset.historyFocus);
    });
  });

  document.querySelectorAll('[data-interview-focus]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showTab('education-interviews');
      focusInterviewSection(link.dataset.interviewFocus);
    });
  });

  document.querySelectorAll('[data-classroom-focus]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showTab('education-classroom');
      focusEducationTopic('education-classroom', 'classroom', link.dataset.classroomFocus);
    });
  });

  document.querySelectorAll('[data-outreach-focus]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showTab('education-outreach');
      focusEducationTopic('education-outreach', 'outreach', link.dataset.outreachFocus);
    });
  });

  window.addEventListener('hashchange', () => {
    showTab(window.location.hash.replace('#', ''), false);
  });

  window.addEventListener('hrbmp-tab-change', () => {
    refreshActiveMap();
  });

  showTab(window.location.hash.replace('#', '') || 'home', false);
}

function focusCurriculumSection(sectionId) {
  const sections = document.querySelectorAll('#education-k12-curriculum [data-curriculum-section]');
  const target = document.querySelector(`#education-k12-curriculum [data-curriculum-section="${sectionId}"]`);
  if (!target) return;

  sections.forEach((section) => {
    section.open = section === target;
  });

  window.requestAnimationFrame(() => {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function focusHistorySection(sectionId) {
  const cards = document.querySelectorAll('#education-history [data-history-section]');
  const target = document.querySelector(`#education-history [data-history-section="${sectionId}"]`);
  if (!target) return;

  cards.forEach((card) => {
    card.classList.toggle('is-focused', card === target);
  });

  window.requestAnimationFrame(() => {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

function focusEducationTopic(pageId, topicType, sectionId) {
  const cards = document.querySelectorAll(`#${pageId} [data-${topicType}-section]`);
  const target = document.querySelector(`#${pageId} [data-${topicType}-section="${sectionId}"]`);
  if (!target) return;

  cards.forEach((card) => {
    card.classList.toggle('is-focused', card === target);
  });

  window.requestAnimationFrame(() => {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

function focusInterviewSection(sectionId) {
  const cards = document.querySelectorAll('#education-interviews [data-interview-section]');
  const target = document.querySelector(`#education-interviews [data-interview-section="${sectionId}"]`);
  if (!target) return;

  cards.forEach((card) => {
    card.classList.toggle('is-focused', card === target);
  });

  window.requestAnimationFrame(() => {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

function organizeFieldSamplingGallery() {
  organizePhotoGallery('field-sampling-gallery', FIELD_SAMPLING_PHOTO_GROUPS, 'fish');
}

function organizeLabSampleProcessingGallery() {
  organizePhotoGallery('lab-sample-processing-gallery', LAB_SAMPLE_PROCESSING_PHOTO_GROUPS, 'sample-processing');
}

function organizePhotoGallery(containerId, photoGroups, defaultGroupKey) {
  const container = document.getElementById(containerId);
  if (!container || container.dataset.organized === 'true') return;

  const cards = Array.from(container.querySelectorAll('.gallery-card'));
  if (!cards.length) return;

  const groups = photoGroups.map((group) => ({
    ...group,
    cards: []
  }));
  const defaultGroup = groups.find((group) => group.key === defaultGroupKey) || groups[0];
  const headingPrefix = containerId.replace(/-gallery$/, '');

  cards.forEach((card) => {
    const title = card.querySelector('.gallery-copy h2')?.textContent || card.querySelector('img')?.alt || '';
    const group = groups.find((candidate) => candidate.patterns.some((pattern) => pattern.test(title))) || defaultGroup;
    group.cards.push(card);
  });

  container.dataset.organized = 'true';
  container.className = 'field-gallery';
  container.replaceChildren();

  groups
    .filter((group) => group.cards.length > 0)
    .forEach((group) => {
      const section = document.createElement('section');
      section.className = 'field-gallery-section';
      section.setAttribute('aria-labelledby', `${headingPrefix}-${group.key}`);

      const header = document.createElement('div');
      header.className = 'gallery-section-header';

      const heading = document.createElement('h2');
      heading.id = `${headingPrefix}-${group.key}`;
      heading.textContent = group.heading;

      const count = document.createElement('span');
      count.textContent = `${group.cards.length} photo${group.cards.length === 1 ? '' : 's'}`;

      const grid = document.createElement('div');
      grid.className = 'field-gallery-grid';
      group.cards.forEach((card) => grid.appendChild(card));

      header.append(heading, count);
      section.append(header, grid);
      container.appendChild(section);
    });
}

function hydrateData(data, biologicalGeoJson, environmentalGeoJson) {
  const usingFallback = Boolean(data.using_fallback);
  const next = {
    ...FALLBACK_DATA,
    ...data,
    counts: {
      ...FALLBACK_DATA.counts,
      ...(data.counts || {})
    },
    stations: Array.isArray(data.stations) ? data.stations : [],
    sampling_events: Array.isArray(data.sampling_events) ? data.sampling_events : [],
    annual_total_abundance: Array.isArray(data.annual_total_abundance) ? data.annual_total_abundance : [],
    taxa_totals: Array.isArray(data.taxa_totals) ? data.taxa_totals : [],
    environmental_summary: Array.isArray(data.environmental_summary) ? data.environmental_summary : [],
    biological_availability: Array.isArray(data.biological_availability) ? data.biological_availability : [],
    environmental_availability: Array.isArray(data.environmental_availability) ? data.environmental_availability : [],
    sampling_image_catalog: Array.isArray(data.sampling_image_catalog) ? data.sampling_image_catalog : []
  };

  if (biologicalGeoJson) {
    next.biological_availability = rowsFromGeoJson(biologicalGeoJson);
  }

  if (environmentalGeoJson) {
    next.environmental_availability = rowsFromGeoJson(environmentalGeoJson);
  }

  if (next.stations.length === 0 && usingFallback) {
    next.stations = FALLBACK_DATA.stations;
  }

  if (next.biological_availability.length === 0 && next.sampling_events.length > 0) {
    next.biological_availability = deriveAvailabilityFromEvents(next);
  }

  if (next.biological_availability.length === 0 && usingFallback) {
    next.biological_availability = FALLBACK_DATA.biological_availability;
  }

  if (next.environmental_availability.length === 0 && usingFallback) {
    next.environmental_availability = FALLBACK_DATA.environmental_availability;
  }

  if (next.sampling_image_catalog.length === 0) {
    next.sampling_image_catalog = SPECIES_HIGHLIGHT_CATALOG;
  }

  next.biological_availability = next.biological_availability.map(normalizeAvailabilityRow);
  next.biological_availability = ensureMinimumBiologicalRows(next.biological_availability, MIN_BIOLOGICAL_DEMO_ROWS);
  next.biological_availability = ensureDistributedBiologicalDemoRows(next.biological_availability);
  next.environmental_availability = next.environmental_availability.map(normalizeEnvironmentalRow);
  next.environmental_availability = ensureDistributedEnvironmentalDemoRows(next.environmental_availability);
  next.sampling_events = next.sampling_events.map(normalizeEventRow);
  next.sampling_image_catalog = next.sampling_image_catalog.map(normalizeCatalogRecord);

  return next;
}

function hydrateMetadata(metadata) {
  const next = {
    ...FALLBACK_METADATA,
    ...metadata,
    datasets: Array.isArray(metadata.datasets) ? metadata.datasets : FALLBACK_METADATA.datasets,
    variables: Array.isArray(metadata.variables) ? metadata.variables : FALLBACK_METADATA.variables,
    programs: Array.isArray(metadata.programs) ? metadata.programs : FALLBACK_METADATA.programs,
    regions: Array.isArray(metadata.regions) ? metadata.regions : FALLBACK_METADATA.regions,
    sources: Array.isArray(metadata.sources) ? metadata.sources : FALLBACK_METADATA.sources,
    access_levels: Array.isArray(metadata.access_levels) ? metadata.access_levels : FALLBACK_METADATA.access_levels,
    roles: Array.isArray(metadata.roles) ? metadata.roles : FALLBACK_METADATA.roles,
    dataset_access_policy: Array.isArray(metadata.dataset_access_policy) ? metadata.dataset_access_policy : FALLBACK_METADATA.dataset_access_policy,
    dataset_role_permissions: Array.isArray(metadata.dataset_role_permissions) ? metadata.dataset_role_permissions : FALLBACK_METADATA.dataset_role_permissions,
    using_fallback: Boolean(metadata.using_fallback)
  };
  return next;
}

function renderAll() {
  fillCounts();
  renderMetadata();
  populateFilters();
  renderBiologicalRegionReference();
  renderBiologicalMap();
  updateDataRequestSummary();
  renderDemo();
  renderEnvironmental();
  renderCatalog();
  renderAccessControl();
  updateMetadataApiLinks();
}

function bindControls() {
  bindPolicyAcknowledgments();

  [
    'bio-species',
    'bio-life-stage',
    'bio-program',
    'bio-year-start',
    'bio-year-end',
    'bio-month-start',
    'bio-month-end',
    'bio-day-start',
    'bio-day-end',
    'bio-basemap',
    'layer-records',
    'layer-regional-totals',
    'layer-region-reference',
    'layer-river-centerline'
  ].forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;
    const eventName = element.tagName === 'INPUT' && element.type === 'search' ? 'input' : 'change';
    element.addEventListener(eventName, () => {
      if (id === 'bio-basemap') applyBasemap('biological', valueOf('bio-basemap'));
      renderBiologicalMap();
      updateDataRequestSummary();
    });
  });

  [
    'env-year-start',
    'env-year-end',
    'env-month-start',
    'env-month-end',
    'env-day-start',
    'env-day-end',
    'env-variable',
    'env-basemap',
    'env-layer-values',
    'env-layer-regional-totals',
    'env-layer-region-reference',
    'env-layer-river-centerline'
  ].forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.addEventListener('change', () => {
      if (id === 'env-variable') renderEnvironmentalSourcePanel();
      if (id === 'env-basemap') applyBasemap('environmental', valueOf('env-basemap'));
      renderEnvironmentalMap();
    });
  });

  [
    'catalog-species',
    'catalog-type'
  ].forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.addEventListener('change', () => {
      if (id === 'catalog-species') {
        state.selectedCatalogSpecies = element.value === 'all' ? null : element.value;
        state.selectedCatalogLifeStage = null;
      }
      if (id === 'catalog-type') {
        state.selectedCatalogLifeStage = null;
      }
      renderCatalog();
    });
  });

  [
    'demo-program',
    'demo-species',
    'demo-year-start',
    'demo-year-end',
    'demo-region',
    'demo-sample',
    'demo-type-counts',
    'demo-type-images',
    'demo-type-documents'
  ].forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.addEventListener('change', () => renderDemoResults());
  });

  const demoKeyInput = document.getElementById('demo-supabase-key');
  if (demoKeyInput) {
    demoKeyInput.value = demoSupabaseKey() ? 'saved in this browser' : '';
  }

  const demoSaveKey = document.getElementById('demo-save-key');
  if (demoSaveKey) {
    demoSaveKey.addEventListener('click', () => {
      const rawKey = document.getElementById('demo-supabase-key')?.value || '';
      if (!rawKey || rawKey === 'saved in this browser') {
        setDemoStatus('Paste the Supabase publishable key before saving.', 'warning');
        return;
      }
      saveDemoSupabaseKey(rawKey);
      const keyInput = document.getElementById('demo-supabase-key');
      if (keyInput) keyInput.value = 'saved in this browser';
      refreshDemoArchive();
    });
  }

  const demoRefresh = document.getElementById('demo-refresh-results');
  if (demoRefresh) {
    demoRefresh.addEventListener('click', () => refreshDemoArchive());
  }

  const demoClearFilters = document.getElementById('demo-clear-filters');
  if (demoClearFilters) {
    demoClearFilters.addEventListener('click', () => {
      [
        'demo-program',
        'demo-species',
        'demo-year-start',
        'demo-year-end',
        'demo-region',
        'demo-sample'
      ].forEach((id) => {
        const element = document.getElementById(id);
        if (element) element.value = 'all';
      });
      ['demo-type-counts', 'demo-type-images'].forEach((id) => {
        const element = document.getElementById(id);
        if (element) element.checked = true;
      });
      const documentTypes = document.getElementById('demo-type-documents');
      if (documentTypes) documentTypes.checked = false;
      renderDemoResults();
    });
  }

  const demoSubmit = document.getElementById('demo-data-request-submit');
  if (demoSubmit) {
    demoSubmit.addEventListener('click', () => submitDemoDataRequest());
  }

  bindAdminLoginControls();

  window.addEventListener('hrbmp-tab-change', (event) => {
    if (event.detail?.tabId === 'demo' && !state.demoApiLoaded && demoSupabaseKey()) {
      refreshDemoArchive();
    }
    if (event.detail?.tabId === 'user-login') {
      refreshAdminSession();
    }
  });
}

function bindPolicyAcknowledgments() {
  [
    ['data-request-policy-acknowledgment', 'data-request-submit'],
    ['env-data-request-policy-acknowledgment', 'env-data-request-submit'],
    ['demo-data-request-policy-acknowledgment', 'demo-data-request-submit']
  ].forEach(([checkboxId, buttonId]) => {
    const checkbox = document.getElementById(checkboxId);
    const button = document.getElementById(buttonId);
    if (!checkbox || !button) return;

    const updateButtonState = () => {
      button.disabled = !checkbox.checked;
      button.setAttribute('aria-disabled', String(!checkbox.checked));
    };

    checkbox.addEventListener('change', updateButtonState);
    updateButtonState();
  });
}

function fillCounts() {
  const counts = HOME_SNAPSHOT_COUNTS;
  setText('count-stations', formatNumber(counts.stations));
  setText('count-events', formatNumber(counts.sampling_events));
  setText('count-taxa', formatNumber(counts.taxa));
  setText('count-observations', formatNumber(counts.observations));
  setText('snapshot-date', state.data.generated_at_utc || 'No export timestamp found');
}

function populateFilters() {
  const bioYears = uniqueSorted(state.biologicalRows.map((row) => row.year), true);
  const bioMonths = uniqueSorted(state.biologicalRows.map((row) => row.month), true);
  const bioDays = uniqueSorted(state.biologicalRows.map((row) => row.day), true);
  const bioSpecies = biologicalSpeciesOptions(state.biologicalRows);
  const bioLifeStages = sortLifeStages(CATALOG_LIFE_STAGE_DISTRIBUTION.map((stage) => stage.life_stage));
  const envYears = uniqueSorted(state.environmentalRows.map((row) => row.year), true);
  const envMonths = uniqueSorted(state.environmentalRows.map((row) => row.month), true);
  const envDays = uniqueSorted(state.environmentalRows.map((row) => row.day), true);
  const envSource = state.selectedEnvSource || 'hrbmp';
  const envVariableOptions = variablesForSource(envSource).map((key) => ({
    value: key,
    label: ENV_VARIABLES[key].label
  }));
  const catalogRows = state.data.sampling_image_catalog || [];
  const catalogSpecies = sortHighlightSpecies(uniqueSorted(catalogRows.map((row) => row.species_common)));
  const catalogTypes = uniqueSorted(catalogRows.map((row) => row.image_type));

  populateSelect('bio-species', bioSpecies, 'All Species');
  populateSelect('bio-life-stage', bioLifeStages, 'All Life Stages');
  populateSelect('bio-program', BIOLOGICAL_MONITORING_PROGRAMS, 'All Programs');
  populateSelect('bio-year-start', bioYears, 'Any Start');
  populateSelect('bio-year-end', bioYears, 'Any End');
  populateSelect('bio-month-start', bioMonths.map(monthOption), 'Any Start');
  populateSelect('bio-month-end', bioMonths.map(monthOption), 'Any End');
  populateSelect('bio-day-start', bioDays, 'Any Start');
  populateSelect('bio-day-end', bioDays, 'Any End');
  populateSelect('env-year-start', envYears, 'Any Start');
  populateSelect('env-year-end', envYears, 'Any End');
  populateSelect('env-month-start', envMonths.map(monthOption), 'Any Start');
  populateSelect('env-month-end', envMonths.map(monthOption), 'Any End');
  populateSelect('env-day-start', envDays, 'Any Start');
  populateSelect('env-day-end', envDays, 'Any End');
  populateSelect('env-variable', envVariableOptions, 'Select Covariate');
  populateSelect('catalog-species', catalogSpecies, 'All Species');
  populateSelect('catalog-type', catalogTypes, 'All Image Types');

  const variableSelect = document.getElementById('env-variable');
  if (variableSelect && variableSelect.value === 'all' && envVariableOptions.length > 0) {
    variableSelect.value = envVariableOptions[0].value;
  }
}

function populateSelect(id, options, allLabel) {
  const select = document.getElementById(id);
  if (!select) return;

  const currentValue = select.value;
  select.replaceChildren();
  select.appendChild(new Option(allLabel, 'all'));

  options.forEach((option) => {
    if (typeof option === 'object') {
      select.appendChild(new Option(option.label, option.value));
    } else {
      select.appendChild(new Option(String(option), String(option)));
    }
  });

  if (Array.from(select.options).some((option) => option.value === currentValue)) {
    select.value = currentValue;
  }
}

function biologicalSpeciesOptions(rows) {
  const names = [];
  const seen = new Set();

  function addName(name) {
    const label = String(name || '').trim();
    const key = label.toLowerCase();
    if (!label || seen.has(key) || label === 'Unspecified') return;
    seen.add(key);
    names.push(label);
  }

  KEY_SPECIES_NAMES.forEach(addName);
  ALL_SPECIES_NAMES.forEach(addName);
  uniqueSorted(rows.map((row) => row.common_name || row.scientific_name)).forEach(addName);
  return names;
}

function renderBiologicalMap() {
  const rows = filterRows(state.biologicalRows, {
    species: valueOf('bio-species'),
    lifeStage: valueOf('bio-life-stage'),
    program: valueOf('bio-program'),
    yearStart: valueOf('bio-year-start'),
    yearEnd: valueOf('bio-year-end'),
    monthStart: valueOf('bio-month-start'),
    monthEnd: valueOf('bio-month-end'),
    dayStart: valueOf('bio-day-start'),
    dayEnd: valueOf('bio-day-end')
  }).filter(hasCoordinates);

  renderMapStats('bio-map-stats', [
    ['Biological Records', sumRecordCounts(rows, 'biological')],
    ['Species Shown', valueOf('bio-species') === 'all' ? 'All Species' : valueOf('bio-species')],
    ['Life Stage', valueOf('bio-life-stage') === 'all' ? 'All Stages' : valueOf('bio-life-stage')],
    ['Program', valueOf('bio-program') === 'all' ? 'All Programs' : valueOf('bio-program')]
  ]);
  updateDataRequestSummary(rows);

  if (!isActiveTab('biological-database')) return;

  const map = ensureLeafletMap('bio-map', 'biological');
  if (!map) return;

  clearMapLayers('biological');

  if (checked('layer-region-reference')) {
    addRegionReferenceLayer(map, 'biological', rows);
  }

  if (checked('layer-river-centerline')) {
    addHudsonCenterlineLayer(map, 'biological');
  }

  if (checked('layer-records')) {
    addBiologicalRecordDotLayer(map, rows);
  }

  if (checked('layer-regional-totals')) {
    addRegionTotalCircleLayer(map, 'biological', rows);
  }

  setText('bio-selected', rows.length ? 'Use the map to inspect biological record availability by HRBMP region.' : 'No records match the selected filters.');
  updateLegend('biological', legendHtml('Biological Map', [
    checked('layer-records') && { color: '#1e8f84', label: 'Biological Records' },
    checked('layer-regional-totals') && { color: '#1b8d86', label: 'Regional Totals' },
    checked('layer-region-reference') && { color: '#755d2a', label: 'HRBMP Region Boundaries' },
    checked('layer-river-centerline') && { color: '#176b78', label: 'Hudson River Centerline' }
  ].filter(Boolean)));
  fitRows(map, rows);
}

function currentBiologicalFilterSummary(rows = null) {
  const filteredRows = rows || filterRows(state.biologicalRows, {
    species: valueOf('bio-species'),
    lifeStage: valueOf('bio-life-stage'),
    program: valueOf('bio-program'),
    yearStart: valueOf('bio-year-start'),
    yearEnd: valueOf('bio-year-end'),
    monthStart: valueOf('bio-month-start'),
    monthEnd: valueOf('bio-month-end'),
    dayStart: valueOf('bio-day-start'),
    dayEnd: valueOf('bio-day-end')
  }).filter(hasCoordinates);

  const lines = [
    `Species: ${valueOf('bio-species') === 'all' ? 'All Species' : valueOf('bio-species')}`,
    `Life Stage: ${valueOf('bio-life-stage') === 'all' ? 'All Stages' : valueOf('bio-life-stage')}`,
    `Monitoring Program: ${valueOf('bio-program') === 'all' ? 'All Programs' : valueOf('bio-program')}`,
    `Year Range: ${valueOf('bio-year-start') === 'all' ? 'Any Start' : valueOf('bio-year-start')} to ${valueOf('bio-year-end') === 'all' ? 'Any End' : valueOf('bio-year-end')}`,
    `Month Range: ${valueOf('bio-month-start') === 'all' ? 'Any Start' : valueOf('bio-month-start')} to ${valueOf('bio-month-end') === 'all' ? 'Any End' : valueOf('bio-month-end')}`,
    `Day Range: ${valueOf('bio-day-start') === 'all' ? 'Any Start' : valueOf('bio-day-start')} to ${valueOf('bio-day-end') === 'all' ? 'Any End' : valueOf('bio-day-end')}`,
    `Matching Rows: ${formatNumber(filteredRows.length)}`
  ];

  return lines.join('\n');
}

function updateDataRequestSummary(rows = null) {
  const summary = document.getElementById('data-request-summary');
  if (!summary || !state.ready) return;
  summary.value = currentBiologicalFilterSummary(rows);
}

function renderDemo() {
  populateDemoFilters();
  renderDemoResults();

  const keyInput = document.getElementById('demo-supabase-key');
  if (keyInput && demoSupabaseKey() && !keyInput.value) {
    keyInput.value = 'saved in this browser';
  }

  if (state.demoRowsSource === 'fallback') {
    setDemoStatus('Showing built-in demo rows. Save the Supabase publishable key here to test the live API.', 'warning');
  } else {
    setDemoStatus(`Loaded ${formatNumber(state.demoRows.length)} public archive row(s) from Supabase.`, 'success');
  }
}

function demoSupabaseKey() {
  if (window.HRBMP_SUPABASE_PUBLISHABLE_KEY) return String(window.HRBMP_SUPABASE_PUBLISHABLE_KEY).trim();
  try {
    return window.localStorage.getItem(DEMO_SUPABASE_KEY_STORAGE) || '';
  } catch (error) {
    return '';
  }
}

function saveDemoSupabaseKey(key) {
  const cleanKey = String(key || '').trim();
  if (!cleanKey || cleanKey === 'saved in this browser') return;
  try {
    window.localStorage.setItem(DEMO_SUPABASE_KEY_STORAGE, cleanKey);
  } catch (error) {
    setDemoStatus('Browser storage is unavailable. The key can still be used for this page session.', 'warning');
    window.HRBMP_SUPABASE_PUBLISHABLE_KEY = cleanKey;
  }
}

function createHrbmpSupabaseClient() {
  const key = demoSupabaseKey();
  if (!key) return null;
  if (!window.supabase || typeof window.supabase.createClient !== 'function') return null;
  if (state.adminClient && state.adminClientKey === key) return state.adminClient;

  state.adminClient = window.supabase.createClient(DEMO_SUPABASE_URL, key);
  state.adminClientKey = key;
  return state.adminClient;
}

function bindAdminLoginControls() {
  const keyInput = document.getElementById('login-supabase-key');
  if (keyInput) keyInput.value = demoSupabaseKey() ? 'saved in this browser' : '';

  const loginButton = document.getElementById('login-submit');
  if (loginButton) {
    loginButton.addEventListener('click', () => signInAdminUser());
  }

  const signOutButton = document.getElementById('login-signout');
  if (signOutButton) {
    signOutButton.addEventListener('click', () => signOutAdminUser());
  }

  const refreshButton = document.getElementById('admin-refresh-requests');
  if (refreshButton) {
    refreshButton.addEventListener('click', () => loadAdminRequests());
  }

  document.querySelectorAll('[data-admin-request-view]').forEach((button) => {
    button.addEventListener('click', () => {
      state.adminRequestView = button.dataset.adminRequestView || 'submitted';
      renderAdminRequestRows(state.adminRequests);
    });
  });

  refreshAdminSession();
}

async function refreshAdminSession() {
  const keyInput = document.getElementById('login-supabase-key');
  if (keyInput && demoSupabaseKey()) keyInput.value = 'saved in this browser';

  const client = createHrbmpSupabaseClient();
  if (!client) {
    setLoginStatus('Save the Supabase publishable key first, then sign in.', 'warning');
    renderAdminRequestRows([]);
    return;
  }

  try {
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    const email = data.session?.user?.email || '';
    state.adminSessionEmail = email;
    if (email) {
      setLoginStatus(`Signed in as ${email}.`, 'success');
      loadAdminRequests();
    }
  } catch (error) {
    console.error(error);
    setLoginStatus(`Could not check login session: ${error.message}`, 'error');
  }
}

async function signInAdminUser() {
  const rawKey = document.getElementById('login-supabase-key')?.value || '';
  if (rawKey && rawKey !== 'saved in this browser') {
    saveDemoSupabaseKey(rawKey);
    const demoKeyInput = document.getElementById('demo-supabase-key');
    if (demoKeyInput) demoKeyInput.value = 'saved in this browser';
  }

  const client = createHrbmpSupabaseClient();
  if (!client) {
    setLoginStatus('Paste and save the Supabase publishable key before signing in.', 'warning');
    return;
  }

  const email = document.getElementById('login-username')?.value.trim() || '';
  const password = document.getElementById('login-password')?.value || '';
  if (!email || !password) {
    setLoginStatus('Enter your Supabase Auth email and password.', 'warning');
    return;
  }

  setLoginStatus('Signing in...', 'warning');
  try {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    state.adminSessionEmail = data.user?.email || email;
    setLoginStatus(`Signed in as ${state.adminSessionEmail}. Loading request queue...`, 'success');
    await loadAdminRequests();
  } catch (error) {
    console.error(error);
    setLoginStatus(`Login failed: ${error.message}`, 'error');
  }
}

async function signOutAdminUser() {
  const client = createHrbmpSupabaseClient();
  if (!client) return;

  try {
    await client.auth.signOut();
  } catch (error) {
    console.error(error);
  }

  state.adminSessionEmail = '';
  state.adminRequests = [];
  state.adminReviewedRequestIds.clear();
  resetAdminRequestReport();
  renderAdminRequestRows([]);
  setLoginStatus('Signed out. Sign in to review requests.', 'warning');
}

async function loadAdminRequests() {
  const client = createHrbmpSupabaseClient();
  if (!client) {
    setLoginStatus('Save the Supabase publishable key first.', 'warning');
    return;
  }

  setLoginStatus('Loading request queue...', 'warning');
  try {
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError) throw sessionError;
    if (!sessionData.session) {
      renderAdminRequestRows([]);
      setLoginStatus('Sign in with your Supabase admin account to load requests.', 'warning');
      return;
    }

    const { data, error } = await client
      .from('hrbmp_data_requests')
      .select(ADMIN_REQUEST_SELECT)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;

    state.adminRequests = data || [];
    renderAdminRequestRows(state.adminRequests);
    setLoginStatus(`Loaded ${formatNumber(state.adminRequests.length)} request(s).`, 'success');
  } catch (error) {
    console.error(error);
    renderAdminRequestRows([]);
    setLoginStatus(`Could not load requests: ${error.message}`, 'error');
  }
}

function renderAdminRequestRows(rows) {
  const body = document.getElementById('admin-request-rows');
  if (!body) return;
  body.replaceChildren();

  const allRows = Array.isArray(rows) ? rows : [];
  updateAdminRequestTabs(allRows);
  const visibleRows = allRows.filter((row) => adminRequestViewForStatus(row.request_status) === state.adminRequestView);

  if (!visibleRows.length) {
    const tr = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 6;
    cell.textContent = state.adminSessionEmail
      ? `No ${adminRequestViewLabel(state.adminRequestView).toLowerCase()} are visible for this login.`
      : 'Sign in to load submitted requests.';
    tr.appendChild(cell);
    body.appendChild(tr);
    return;
  }

  visibleRows.forEach((row) => {
    const tr = document.createElement('tr');
    appendCell(tr, formatTimestamp(row.created_at));
    appendCell(tr, formatAccessLevel(row.request_status));
    appendCell(tr, `${row.requester_name || 'Name pending'}\n${row.requester_email || ''}`);
    appendCell(tr, row.request_notes || row.intended_use || 'No notes');
    appendCell(tr, adminRequestDeliveryStatus(row));

    const actions = document.createElement('td');
    actions.className = 'admin-request-actions';
    [
      adminReviewReportButton(row),
      adminStatusButton(row, 'reviewing', 'Reviewing'),
      adminStatusButton(row, 'approved', 'Approve & Email'),
      adminStatusButton(row, 'declined', 'Decline'),
      adminEmailButton(row)
    ].filter(Boolean).forEach((button) => actions.appendChild(button));
    tr.appendChild(actions);
    body.appendChild(tr);
  });
}

function updateAdminRequestTabs(rows) {
  const counts = {
    submitted: 0,
    in_progress: 0,
    approved: 0,
    declined: 0
  };

  rows.forEach((row) => {
    const view = adminRequestViewForStatus(row.request_status);
    if (Object.prototype.hasOwnProperty.call(counts, view)) counts[view] += 1;
  });

  document.querySelectorAll('[data-admin-request-view]').forEach((button) => {
    const view = button.dataset.adminRequestView || 'submitted';
    button.classList.toggle('active', view === state.adminRequestView);
    const count = button.querySelector('span');
    if (count) count.textContent = formatNumber(counts[view] || 0);
  });

  const summary = document.getElementById('admin-request-view-summary');
  if (summary) summary.textContent = adminRequestViewDescription(state.adminRequestView);
}

function adminRequestViewForStatus(status) {
  switch (status) {
    case 'submitted':
      return 'submitted';
    case 'reviewing':
    case 'packaging':
      return 'in_progress';
    case 'approved':
    case 'delivered':
      return 'approved';
    case 'declined':
      return 'declined';
    default:
      return 'in_progress';
  }
}

function adminRequestViewLabel(view) {
  switch (view) {
    case 'submitted':
      return 'new requests';
    case 'in_progress':
      return 'in-review requests';
    case 'approved':
      return 'approved and sent requests';
    case 'declined':
      return 'declined requests';
    default:
      return 'requests';
  }
}

function adminRequestViewDescription(view) {
  switch (view) {
    case 'submitted':
      return 'New Requests shows rows waiting for admin review.';
    case 'in_progress':
      return 'In Review shows requests being checked or packaged.';
    case 'approved':
      return 'Approved & Sent keeps approved and delivered request history.';
    case 'declined':
      return 'Declined keeps requests that were not approved for release.';
    default:
      return 'Choose a request status tab to review the queue.';
  }
}

function adminStatusButton(row, status, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = status === 'approved' ? 'primary-button compact-button' : 'secondary-button compact-button';
  button.textContent = label;
  const needsReportReview = ['approved', 'declined'].includes(status)
    && !state.adminReviewedRequestIds.has(row.request_id)
    && !adminRequestActionsLocked(row);
  button.disabled = adminRequestActionsLocked(row) || row.request_status === status || needsReportReview;
  if (needsReportReview) {
    button.title = 'Open and review the request report first.';
  } else if (button.disabled && adminRequestActionsLocked(row)) {
    button.title = 'This request has already been completed.';
  }
  button.addEventListener('click', () => updateAdminRequestStatus(row.request_id, status));
  return button;
}

function adminReviewReportButton(row) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'secondary-button compact-button';
  button.textContent = state.adminReviewedRequestIds.has(row.request_id) ? 'Report Reviewed' : 'Review Report';
  button.addEventListener('click', () => showAdminRequestReport(row.request_id));
  return button;
}

function adminEmailButton(row) {
  if (row.request_status !== 'approved') return null;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'primary-button compact-button';
  const isSending = state.adminDeliveryInFlight.has(row.request_id);
  button.textContent = isSending ? 'Sending...' : adminRequestDeliveryError(row) ? 'Retry Email' : 'Send Email';
  button.disabled = isSending;
  button.addEventListener('click', () => deliverApprovedAdminRequest(row.request_id));
  return button;
}

function adminRequestActionsLocked(row) {
  return ['approved', 'delivered', 'declined', 'packaging'].includes(row.request_status);
}

function adminRequestDeliveryStatus(row) {
  if (state.adminDeliveryInFlight.has(row.request_id)) {
    return 'Sending email...\nWaiting for Supabase Edge Function response.';
  }

  const payload = adminRequestPayload(row);
  const delivery = payload.delivery;
  const deliveryError = payload.delivery_error;

  if (row.request_status === 'delivered' && delivery) {
    const deliveredAt = delivery.delivered_at ? formatTimestamp(delivery.delivered_at) : 'time pending';
    const links = formatNumber(delivery.asset_link_count || 0);
    const counts = formatNumber(delivery.count_row_count || 0);
    return `Email sent\n${deliveredAt}\n${links} file link(s), ${counts} count row(s)`;
  }

  if (deliveryError) {
    return `Email failed\n${deliveryError.error || 'Check Edge Function logs.'}`;
  }

  if (row.request_status === 'approved') return 'Approved; email not delivered yet.';
  if (row.request_status === 'packaging') return 'Preparing email and download links...';
  if (row.request_status === 'declined') return 'No email delivery.';
  return 'Pending approval.';
}

function adminRequestDeliveryError(row) {
  return Boolean(adminRequestPayload(row).delivery_error);
}

function adminRequestPayload(row) {
  if (!row?.request_payload) return {};
  if (typeof row.request_payload === 'object') return row.request_payload;
  try {
    return JSON.parse(row.request_payload);
  } catch {
    return {};
  }
}

function showAdminRequestReport(requestId) {
  const row = state.adminRequests.find((request) => request.request_id === requestId);
  const report = document.getElementById('admin-request-report');
  if (!row || !report) return;

  state.adminReviewedRequestIds.add(requestId);
  renderAdminRequestRows(state.adminRequests);

  const payload = adminRequestPayload(row);
  const form = payload.request_form || {};
  const filterRows = [
    ['Survey Program', row.selected_program || 'All Programs'],
    ['Species', row.selected_species || 'All Species'],
    ['HRBMP Region', row.selected_region || 'All Regions'],
    ['Sample', row.selected_sample_id || 'All Samples'],
    ['Year Range', row.year_start || row.year_end ? `${row.year_start || 'Any Start'} to ${row.year_end || 'Any End'}` : 'All Years'],
    ['Data Types', Array.isArray(row.requested_data_types) && row.requested_data_types.length ? row.requested_data_types.map(formatAccessLevel).join(', ') : 'All Data Types'],
    ['Matching Request Items', formatNumber(row.matching_row_count || 0)],
    ['Public Request Items', formatNumber(row.public_row_count || 0)]
  ];
  const requesterRows = [
    ['Name', row.requester_name || 'Name pending'],
    ['Title', form.requester_title || 'Not provided'],
    ['Email', row.requester_email || 'Email pending'],
    ['Phone', form.requester_phone || 'Not provided'],
    ['Affiliation', row.requester_affiliation || 'Not provided'],
    ['Intended Use', row.intended_use || 'Not provided']
  ];
  const narrativeRows = [
    ['Project Abstract', form.project_abstract || 'Not provided'],
    ['Specific Data Requested', form.specific_data_requested || row.request_notes || 'Not provided'],
    ['Data Use Plan', form.data_use_plan || 'Not provided'],
    ['Other Project Members With Data Access', form.collaborators_with_data_access || 'Not provided']
  ];

  report.hidden = false;
  report.innerHTML = `
    <div class="admin-request-report-header">
      <div>
        <h3>Request Review Report</h3>
        <p>${escapeHtml(row.request_id)} | ${escapeHtml(formatTimestamp(row.created_at))}</p>
      </div>
      <span>${escapeHtml(formatAccessLevel(row.request_status))}</span>
    </div>
    <div class="admin-request-report-grid">
      <section>
        <h4>Requester</h4>
        ${adminReportDefinitionList(requesterRows)}
      </section>
      <section>
        <h4>Selected Filters</h4>
        ${adminReportDefinitionList(filterRows)}
      </section>
    </div>
    <section class="admin-request-report-section">
      <h4>Requester Narrative</h4>
      ${adminReportDefinitionList(narrativeRows, true)}
    </section>
    <section class="admin-request-report-section">
      <h4>Current Screening Summary</h4>
      <pre>${escapeHtml(row.request_summary || adminRequestFilters(row))}</pre>
    </section>
  `;
  report.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function adminReportDefinitionList(rows, multiline = false) {
  return `
    <dl class="${multiline ? 'multiline' : ''}">
      ${rows.map(([label, value]) => `
        <div>
          <dt>${escapeHtml(label)}</dt>
          <dd>${escapeHtml(value)}</dd>
        </div>
      `).join('')}
    </dl>
  `;
}

function resetAdminRequestReport() {
  const report = document.getElementById('admin-request-report');
  if (!report) return;
  report.hidden = true;
  report.innerHTML = `
    <div class="admin-request-report-empty">
      Open a request report to review the full requester form and selected filters before approval.
    </div>
  `;
}

async function updateAdminRequestStatus(requestId, status) {
  const client = createHrbmpSupabaseClient();
  if (!client) {
    setLoginStatus('Save the Supabase publishable key first.', 'warning');
    return;
  }

  if (status === 'approved') {
    await approveAndDeliverAdminRequest(requestId);
    return;
  }

  setLoginStatus(`Updating request to ${formatAccessLevel(status)}...`, 'warning');
  try {
    const { error } = await client
      .from('hrbmp_data_requests')
      .update({ request_status: status })
      .eq('request_id', requestId);
    if (error) throw error;

    state.adminRequestView = adminRequestViewForStatus(status);
    setLoginStatus(`Request marked ${formatAccessLevel(status)}.`, 'success');
    await loadAdminRequests();
  } catch (error) {
    console.error(error);
    setLoginStatus(`Could not update request: ${error.message}`, 'error');
  }
}

async function approveAndDeliverAdminRequest(requestId) {
  const client = createHrbmpSupabaseClient();
  if (!client) {
    setLoginStatus('Save the Supabase publishable key first.', 'warning');
    return;
  }

  setLoginStatus('Approving request...', 'warning');
  try {
    const { error: approvalError } = await client
      .from('hrbmp_data_requests')
      .update({ request_status: 'approved' })
      .eq('request_id', requestId);
    if (approvalError) throw approvalError;

    state.adminRequests = state.adminRequests.map((row) =>
      row.request_id === requestId ? { ...row, request_status: 'approved' } : row
    );
    state.adminRequestView = 'approved';
    renderAdminRequestRows(state.adminRequests);
  } catch (error) {
    console.error(error);
    state.adminRequestView = 'approved';
    setLoginStatus(`Could not approve request: ${error.message}`, 'error');
    await loadAdminRequests();
    return;
  }

  await deliverApprovedAdminRequest(requestId);
}

async function deliverApprovedAdminRequest(requestId) {
  const client = createHrbmpSupabaseClient();
  if (!client) {
    setLoginStatus('Save the Supabase publishable key first.', 'warning');
    return;
  }

  setLoginStatus('Preparing download links and sending email...', 'warning');
  state.adminDeliveryInFlight.add(requestId);
  renderAdminRequestRows(state.adminRequests);

  try {
    const { data, error } = await invokeAdminDeliveryFunction(client, requestId);

    if (error) {
      const detail = await functionErrorDetail(error);
      throw new Error(detail);
    }
    if (data?.error) throw new Error(data.error);
    if (data?.status !== 'delivered' && !data?.already_delivered) {
      throw new Error(`Supabase Edge Function returned without delivering email: ${JSON.stringify(data || {})}`);
    }

    state.adminRequestView = 'approved';
    state.adminDeliveryInFlight.delete(requestId);
    setLoginStatus(
      `Request delivered. Email sent to ${data?.requester_email || 'the requester'} with ${formatNumber(data?.asset_link_count || 0)} archive file link(s) and ${formatNumber(data?.count_row_count || 0)} count row(s).`,
      'success'
    );
    await loadAdminRequests();
  } catch (error) {
    console.error(error);
    state.adminRequestView = 'approved';
    state.adminDeliveryInFlight.delete(requestId);
    await recordAdminDeliveryFailure(client, requestId, error.message);
    setLoginStatus(`Could not deliver request: ${error.message}`, 'error');
    await loadAdminRequests();
  } finally {
    state.adminDeliveryInFlight.delete(requestId);
  }
}

function invokeAdminDeliveryFunction(client, requestId) {
  return Promise.race([
    client.functions.invoke('deliver-approved-request', {
      body: { request_id: requestId }
    }),
    new Promise((resolve) => {
      window.setTimeout(() => {
        resolve({
          data: null,
          error: new Error('Supabase Edge Function did not return within 45 seconds. Check whether deliver-approved-request is deployed and whether the Gmail Apps Script webhook is reachable.')
        });
      }, 45000);
    })
  ]);
}

async function recordAdminDeliveryFailure(client, requestId, message) {
  const existingRow = state.adminRequests.find((row) => row.request_id === requestId);
  const requestPayload = {
    ...adminRequestPayload(existingRow),
    delivery_error: {
      delivery_source: 'admin_gui_client',
      failed_at: new Date().toISOString(),
      error: message || 'Email delivery failed before Supabase recorded a server-side error.'
    }
  };

  state.adminRequests = state.adminRequests.map((row) =>
    row.request_id === requestId ? { ...row, request_payload: requestPayload } : row
  );
  renderAdminRequestRows(state.adminRequests);

  try {
    const { error } = await client
      .from('hrbmp_data_requests')
      .update({ request_payload: requestPayload })
      .eq('request_id', requestId);
    if (error) throw error;
  } catch (error) {
    console.error('Could not record delivery failure:', error);
  }
}

async function functionErrorDetail(error) {
  if (error?.context && typeof error.context.json === 'function') {
    try {
      const body = await error.context.json();
      if (body?.error) return body.error;
      return JSON.stringify(body);
    } catch {
      // Fall back to the generic error message below.
    }
  }
  return error?.message || String(error);
}

function adminRequestFilters(row) {
  const yearRange = row.year_start || row.year_end
    ? `${row.year_start || 'Any'}-${row.year_end || 'Any'}`
    : 'All Years';
  const dataTypes = Array.isArray(row.requested_data_types) && row.requested_data_types.length
    ? row.requested_data_types.map(formatAccessLevel).join(', ')
    : 'All Data Types';

  return [
    row.selected_program || 'All Programs',
    row.selected_species || 'All Species',
    row.selected_region || 'All Regions',
    row.selected_sample_id || 'All Samples',
    yearRange,
    dataTypes
  ].join('\n');
}

function setLoginStatus(message, level = '') {
  const status = document.getElementById('login-status');
  if (!status) return;
  status.textContent = message;
  status.className = level ? `demo-request-status ${level}` : 'demo-request-status';
}

async function refreshDemoArchive() {
  const key = demoSupabaseKey();
  if (!key) {
    state.demoRows = DEMO_FALLBACK_ARCHIVE_ROWS.map(normalizeDemoArchiveRow);
    state.demoRowsSource = 'fallback';
    state.demoApiLoaded = false;
    populateDemoFilters();
    renderDemoResults();
    setDemoStatus('No Supabase publishable key is saved in this browser. Showing built-in demo rows.', 'warning');
    return;
  }

  setDemoStatus('Loading public FJS archive records from Supabase...', 'warning');
  try {
    const rows = await fetchDemoArchiveRows(key);
    state.demoRows = rows.map(normalizeDemoArchiveRow);
    state.demoRowsSource = 'supabase';
    state.demoApiLoaded = true;
    populateDemoFilters();
    renderDemoResults();
    setDemoStatus(`Loaded ${formatNumber(rows.length)} public archive row(s) from Supabase.`, 'success');
  } catch (error) {
    console.error(error);
    state.demoRows = DEMO_FALLBACK_ARCHIVE_ROWS.map(normalizeDemoArchiveRow);
    state.demoRowsSource = 'fallback';
    state.demoApiLoaded = false;
    populateDemoFilters();
    renderDemoResults();
    setDemoStatus(`Supabase API request failed: ${error.message}. Showing built-in demo rows.`, 'error');
  }
}

async function fetchDemoArchiveRows(key) {
  const url = new URL(`${DEMO_SUPABASE_URL}/rest/v1/fjs_archive_catalog`);
  url.searchParams.set('select', DEMO_ARCHIVE_SELECT);
  url.searchParams.set('effective_access_level', 'eq.public');
  url.searchParams.set('order', 'sample_id.asc,common_name.asc,asset_kind.asc,original_file_name.asc');
  url.searchParams.set('limit', '1000');

  const response = await fetch(url.toString(), {
    headers: {
      apikey: key
    }
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`${response.status} ${detail || response.statusText}`);
  }
  return response.json();
}

function normalizeDemoArchiveRow(row) {
  const sampleDate = row.sample_date || '';
  const regionLabel = demoRegionLabel(row.river_region_name, row.river_region_number);
  return {
    ...row,
    program: row.program || 'FJS',
    sample_year: Number(sampleDate.slice(0, 4)) || null,
    common_name: row.common_name || 'Species pending',
    river_region_name: regionLabel || 'Region pending',
    total_count_corrected: asNumberOrNull(row.total_count_corrected),
    young_of_year_count_corrected: asNumberOrNull(row.young_of_year_count_corrected),
    yearling_count_corrected: asNumberOrNull(row.yearling_count_corrected),
    older_count_corrected: asNumberOrNull(row.older_count_corrected),
    yearling_and_older_count_corrected: asNumberOrNull(row.yearling_and_older_count_corrected)
  };
}

function demoRegionLabel(regionName, regionNumber) {
  const raw = String(regionName || '').trim();
  if (DEMO_REGION_CODE_LABELS[raw]) return DEMO_REGION_CODE_LABELS[raw];
  const rawLower = raw.toLowerCase();
  const namedRegion = HRBMP_REGIONS.find((region) => region.name.toLowerCase() === rawLower);
  if (namedRegion) return `${namedRegion.code} - ${namedRegion.name}`;
  if (raw) return raw;

  const numberedRegion = HRBMP_REGIONS.find((region) => String(region.number) === String(regionNumber));
  return numberedRegion ? `${numberedRegion.code} - ${numberedRegion.name}` : '';
}

function populateDemoFilters() {
  const rows = (state.demoRows || DEMO_FALLBACK_ARCHIVE_ROWS).map(normalizeDemoArchiveRow);
  const programs = uniqueSorted(rows.map((row) => row.program || 'FJS'));
  const species = uniqueSorted(rows.map((row) => row.common_name));
  const years = uniqueSorted(rows.map((row) => row.sample_year), true);
  const regions = uniqueSorted(rows.map((row) => row.river_region_name));
  const samples = uniqueSorted(rows.map((row) => row.sample_id));

  populateSelect('demo-program', programs, 'All Programs');
  populateSelect('demo-species', species, 'All Species');
  populateSelect('demo-year-start', years, 'Any Start');
  populateSelect('demo-year-end', years, 'Any End');
  populateSelect('demo-region', regions, 'All Regions');
  populateSelect('demo-sample', samples, 'All Samples');
}

function renderDemoResults() {
  const archiveRows = filteredDemoArchiveRows();
  const displayRows = buildDemoDisplayRows(archiveRows);
  state.demoLastFilteredRows = displayRows;

  renderSummaryStrip('demo-summary', [
    ['Rows', displayRows.length],
    ['Samples', uniqueCount(displayRows, 'sample_id')],
    ['Species', uniqueCount(displayRows, 'common_name')],
    ['Source', state.demoRowsSource === 'supabase' ? 'Supabase API' : 'Built-In Demo']
  ]);

  setText('demo-result-status', `${formatNumber(displayRows.length)} request item(s) match the current filters.`);
  renderDemoResultSummary(displayRows);
  updateDemoManifestDownload(displayRows);
  updateDemoRequestSummary(displayRows);
}

function filteredDemoArchiveRows() {
  const filters = {
    program: valueOf('demo-program'),
    species: valueOf('demo-species'),
    yearStart: valueOf('demo-year-start'),
    yearEnd: valueOf('demo-year-end'),
    region: valueOf('demo-region'),
    sample: valueOf('demo-sample')
  };

  return (state.demoRows || []).filter((row) => {
    if (filters.program !== 'all' && row.program !== filters.program) return false;
    if (filters.species !== 'all' && row.common_name !== filters.species) return false;
    if (filters.region !== 'all' && row.river_region_name !== filters.region) return false;
    if (filters.sample !== 'all' && row.sample_id !== filters.sample) return false;
    if (!withinRange(row.sample_year, filters.yearStart, filters.yearEnd)) return false;
    return true;
  });
}

function selectedDemoDataTypes() {
  const types = [];
  if (checked('demo-type-counts')) types.push('processed_abundance_count');
  if (checked('demo-type-images')) types.push('representative_species_image');
  const documentsInput = document.getElementById('demo-type-documents');
  if (documentsInput && !documentsInput.disabled && documentsInput.checked) {
    types.push('jar_label_image', 'field_sheet_pdf', 'lab_sheet_pdf');
  }
  return types;
}

function buildDemoDisplayRows(rows) {
  const selectedTypes = selectedDemoDataTypes();
  const includeCounts = selectedTypes.includes('processed_abundance_count');
  const includeAssetKinds = new Set(selectedTypes.filter((type) => type !== 'processed_abundance_count'));
  const displayRows = [];

  if (includeCounts) {
    const grouped = groupBy(rows, (row) => `${row.sample_id}|${row.common_name}|${row.taxon_code || ''}`);
    grouped.forEach((groupRows) => {
      const base = groupRows[0];
      displayRows.push({
        ...base,
        display_kind: 'processed_abundance_count',
        asset_kind: 'processed_abundance_count',
        original_file_name: 'processed_counts_by_sample_taxon.csv',
        storage_object_path: '',
        mime_type: 'text/csv'
      });
    });
  }

  rows
    .filter((row) => includeAssetKinds.has(row.asset_kind))
    .forEach((row) => {
      displayRows.push({
        ...row,
        display_kind: row.asset_kind
      });
    });

  return displayRows.sort(compareDemoRows);
}

function compareDemoRows(a, b) {
  return String(a.sample_id).localeCompare(String(b.sample_id))
    || String(a.common_name).localeCompare(String(b.common_name))
    || demoDataTypeRank(a.display_kind) - demoDataTypeRank(b.display_kind)
    || String(a.original_file_name || '').localeCompare(String(b.original_file_name || ''));
}

function demoDataTypeRank(kind) {
  return [
    'processed_abundance_count',
    'jar_label_image',
    'representative_species_image',
    'field_sheet_pdf',
    'lab_sheet_pdf'
  ].indexOf(kind);
}

function renderDemoResultSummary(rows) {
  const container = document.getElementById('demo-result-summary');
  if (!container) return;

  if (!rows.length) {
    container.textContent = 'No public records match the selected filters.';
    return;
  }

  const dataTypes = uniqueSorted(rows.map((row) => formatAccessLevel(row.display_kind))).join(', ');
  const speciesPreview = uniqueSorted(rows.map((row) => row.common_name)).slice(0, 4).join(', ');
  const samplePreview = uniqueSorted(rows.map((row) => row.sample_id)).slice(0, 4).join(', ');

  container.innerHTML = `
    <strong>Manifest ready.</strong>
    <span>${formatNumber(rows.length)} request item(s), ${formatNumber(uniqueCount(rows, 'sample_id'))} sample(s), and ${formatNumber(uniqueCount(rows, 'common_name'))} species match these filters.</span>
    <span><strong>Samples:</strong> ${escapeHtml(samplePreview)}${uniqueCount(rows, 'sample_id') > 4 ? '...' : ''}</span>
    <span><strong>Species:</strong> ${escapeHtml(speciesPreview)}${uniqueCount(rows, 'common_name') > 4 ? '...' : ''}</span>
    <span><strong>Data types:</strong> ${escapeHtml(dataTypes)}</span>
  `;
}

function updateDemoManifestDownload(rows) {
  const link = document.getElementById('demo-manifest-download');
  if (!link) return;
  const csv = toCsv(rows.map((row) => ({
    sample_id: row.sample_id,
    sample_date: row.sample_date,
    common_name: row.common_name,
    scientific_name: row.scientific_name,
    river_region_name: row.river_region_name,
    data_type: row.display_kind,
    original_file_name: row.original_file_name,
    storage_bucket: row.storage_bucket || '',
    storage_object_path: row.storage_object_path || '',
    total_count_corrected: row.total_count_corrected ?? ''
  })));
  link.href = makeDownloadUrl(csv, 'text/csv');
  link.download = `hrbmp_fjs_demo_manifest_${new Date().toISOString().slice(0, 10)}.csv`;
}

function updateDemoRequestSummary(rows = state.demoLastFilteredRows || []) {
  const summary = document.getElementById('demo-request-summary');
  if (!summary) return;
  summary.value = currentDemoRequestSummary(rows);
}

function currentDemoRequestSummary(rows = state.demoLastFilteredRows || []) {
  const dataTypes = selectedDemoDataTypes().map(formatAccessLevel).join(', ') || 'None selected';
  return [
    `Survey Program: ${valueOf('demo-program') === 'all' ? 'All Programs' : valueOf('demo-program')}`,
    `Species: ${valueOf('demo-species') === 'all' ? 'All Species' : valueOf('demo-species')}`,
    `Year Range: ${valueOf('demo-year-start') === 'all' ? 'Any Start' : valueOf('demo-year-start')} to ${valueOf('demo-year-end') === 'all' ? 'Any End' : valueOf('demo-year-end')}`,
    `HRBMP Region: ${valueOf('demo-region') === 'all' ? 'All Regions' : valueOf('demo-region')}`,
    `Sample: ${valueOf('demo-sample') === 'all' ? 'All Samples' : valueOf('demo-sample')}`,
    `Data Types: ${dataTypes}`,
    `Matching Request Items: ${formatNumber(rows.length)}`,
    `Admin Notification Target: ${DEMO_ADMIN_EMAIL}`
  ].join('\n');
}

async function submitDemoDataRequest() {
  const payload = buildDemoRequestPayload();
  if (!payload.requester_name || !payload.requester_email) {
    setDemoRequestStatus('Please enter at least a name and email before submitting.', 'warning');
    return;
  }
  if (!state.demoLastFilteredRows.length) {
    setDemoRequestStatus('No matching public records are selected for this request.', 'warning');
    return;
  }

  const key = demoSupabaseKey();
  if (!key) {
    renderDemoPayloadDownload(payload, 'No Supabase publishable key is saved in this browser. The request payload is ready to download.');
    return;
  }

  setDemoRequestStatus('Submitting request to Supabase...', 'warning');
  try {
    const inserted = await insertDemoDataRequest(key, payload);
    const requestId = Array.isArray(inserted) && inserted[0]?.request_id ? inserted[0].request_id : 'submitted';
    setDemoRequestStatus(
      requestId === 'submitted'
        ? 'Request submitted to Supabase. Admins can review it in hrbmp_data_requests.'
        : `Request submitted to Supabase. Admin review record: ${requestId}`,
      'success'
    );
  } catch (error) {
    console.error(error);
    renderDemoPayloadDownload(payload, `Supabase request insert failed: ${error.message}`);
  }
}

function buildDemoRequestPayload() {
  const rows = state.demoLastFilteredRows || [];
  const dataTypes = selectedDemoDataTypes();
  const requestForm = {
    requester_title: document.getElementById('demo-request-title')?.value.trim() || '',
    requester_phone: document.getElementById('demo-request-phone')?.value.trim() || '',
    collaborators_with_data_access: document.getElementById('demo-request-collaborators')?.value.trim() || '',
    project_abstract: document.getElementById('demo-request-abstract')?.value.trim() || '',
    specific_data_requested: document.getElementById('demo-request-notes')?.value.trim() || '',
    data_use_plan: document.getElementById('demo-request-use-plan')?.value.trim() || ''
  };
  return {
    request_scope: 'fjs_archive_demo',
    request_status: 'submitted',
    admin_email: DEMO_ADMIN_EMAIL,
    requester_name: document.getElementById('demo-request-name')?.value.trim() || '',
    requester_email: document.getElementById('demo-request-email')?.value.trim() || '',
    requester_affiliation: document.getElementById('demo-request-affiliation')?.value.trim() || '',
    intended_use: valueOf('demo-request-use'),
    request_notes: requestForm.specific_data_requested,
    selected_program: valueOf('demo-program'),
    selected_species: valueOf('demo-species'),
    selected_region: valueOf('demo-region'),
    selected_sample_id: valueOf('demo-sample'),
    year_start: valueOrNull(valueOf('demo-year-start')),
    year_end: valueOrNull(valueOf('demo-year-end')),
    requested_data_types: dataTypes,
    matching_row_count: rows.length,
    public_row_count: rows.filter((row) => row.effective_access_level === 'public').length,
    request_summary: currentDemoRequestSummary(rows),
    request_payload: {
      source: state.demoRowsSource,
      request_form: requestForm,
      filters: {
        program: valueOf('demo-program'),
        species: valueOf('demo-species'),
        year_start: valueOf('demo-year-start'),
        year_end: valueOf('demo-year-end'),
        region: valueOf('demo-region'),
        sample_id: valueOf('demo-sample'),
        data_types: dataTypes
      },
      manifest_preview: rows.slice(0, 50).map((row) => ({
        sample_id: row.sample_id,
        sample_date: row.sample_date,
        common_name: row.common_name,
        data_type: row.display_kind,
        original_file_name: row.original_file_name,
        storage_object_path: row.storage_object_path
      }))
    }
  };
}

async function insertDemoDataRequest(key, payload) {
  const response = await fetch(`${DEMO_SUPABASE_URL}/rest/v1/hrbmp_data_requests`, {
    method: 'POST',
    headers: {
      apikey: key,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`${response.status} ${detail || response.statusText}`);
  }
  const detail = await response.text();
  return detail ? JSON.parse(detail) : null;
}

function renderDemoPayloadDownload(payload, message) {
  const container = document.getElementById('demo-request-status');
  if (!container) return;
  container.className = 'demo-request-status warning';
  container.replaceChildren();

  const text = document.createElement('span');
  text.textContent = `${message} `;
  const link = document.createElement('a');
  link.href = makeDownloadUrl(JSON.stringify(payload, null, 2), 'application/json');
  link.download = `hrbmp_demo_request_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  link.textContent = 'Download request JSON';
  container.append(text, link);
}

function setDemoStatus(message, level = '') {
  const status = document.getElementById('demo-api-status');
  if (!status) return;
  status.textContent = message;
  status.className = level ? `demo-request-status ${level}` : '';
}

function setDemoRequestStatus(message, level = '') {
  const status = document.getElementById('demo-request-status');
  if (!status) return;
  status.className = level ? `demo-request-status ${level}` : 'demo-request-status';
  status.textContent = message;
}

function toCsv(rows) {
  if (!rows.length) return '';
  const columns = Object.keys(rows[0]);
  const lines = [columns.join(',')];
  rows.forEach((row) => {
    lines.push(columns.map((column) => csvValue(row[column])).join(','));
  });
  return lines.join('\n');
}

function csvValue(value) {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function makeDownloadUrl(content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  return URL.createObjectURL(blob);
}

function valueOrNull(value) {
  return value === 'all' || value === '' ? null : value;
}

function regionNameForNumber(regionNumber) {
  const region = HRBMP_REGIONS.find((item) => String(item.number) === String(regionNumber));
  return region ? region.name : '';
}

function currentEnvironmentalFilterSummary(rows = null) {
  const requestedVariable = valueOf('env-variable');
  const variable = ENV_VARIABLES[requestedVariable] ? requestedVariable : variablesForSource(state.selectedEnvSource || 'hrbmp')[0] || 'mean_temperature_c';
  const variableMeta = ENV_VARIABLES[variable] || ENV_VARIABLES.mean_temperature_c;
  const sourceMeta = ENV_SOURCES[variableMeta.source] || ENV_SOURCES.hrbmp;
  const filteredRows = rows || filterRows(state.environmentalRows, {
    yearStart: valueOf('env-year-start'),
    yearEnd: valueOf('env-year-end'),
    monthStart: valueOf('env-month-start'),
    monthEnd: valueOf('env-month-end'),
    dayStart: valueOf('env-day-start'),
    dayEnd: valueOf('env-day-end')
  }).filter(hasCoordinates);

  const lines = [
    `Database: ${sourceMeta.label}`,
    `Covariate: ${variableMeta.label}`,
    `Year Range: ${valueOf('env-year-start') === 'all' ? 'Any Start' : valueOf('env-year-start')} to ${valueOf('env-year-end') === 'all' ? 'Any End' : valueOf('env-year-end')}`,
    `Month Range: ${valueOf('env-month-start') === 'all' ? 'Any Start' : valueOf('env-month-start')} to ${valueOf('env-month-end') === 'all' ? 'Any End' : valueOf('env-month-end')}`,
    `Day Range: ${valueOf('env-day-start') === 'all' ? 'Any Start' : valueOf('env-day-start')} to ${valueOf('env-day-end') === 'all' ? 'Any End' : valueOf('env-day-end')}`,
    `Matching Rows: ${formatNumber(filteredRows.length)}`,
    `Environmental Records: ${formatNumber(sumRecordCounts(filteredRows, 'environmental'))}`
  ];

  return lines.join('\n');
}

function updateEnvironmentalDataRequestSummary(rows = null) {
  const summary = document.getElementById('env-data-request-summary');
  if (!summary || !state.ready) return;
  summary.value = currentEnvironmentalFilterSummary(rows);
}

function updateMetadataApiLinks() {
  setLinkHref('metadata-api-json', apiUrl('/metadata'));
}

function apiUrl(endpoint, params = {}) {
  const url = new URL(`${apiBaseUrl()}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === 'all') return;
    url.searchParams.set(key, value);
  });
  return url.toString();
}

function apiBaseUrl() {
  if (window.location.protocol === 'file:') return `http://127.0.0.1:${API_PORT}/api`;
  const isLocal = ['127.0.0.1', 'localhost'].includes(window.location.hostname);
  if (isLocal && window.location.port !== API_PORT) return `http://127.0.0.1:${API_PORT}/api`;
  return `${window.location.origin}/api`;
}

function setLinkHref(id, href) {
  const link = document.getElementById(id);
  if (link) link.href = href;
}

function renderMetadata() {
  const metadata = state.metadata || FALLBACK_METADATA;
  const status = document.getElementById('metadata-status');
  if (status) {
    status.textContent = metadata.using_fallback
      ? 'Showing built-in metadata because the local SQLite API is not running.'
      : 'Metadata are loaded from the local SQLite API.';
  }

  renderSummaryStrip('metadata-overview', [
    ['Datasets', metadata.datasets.length],
    ['Variables', metadata.variables.length],
    ['Programs', metadata.programs.length],
    ['HRBMP Regions', metadata.regions.length]
  ]);

  renderMetadataDatasets(metadata.datasets);
  renderMetadataVariables(metadata.variables);
}

function renderMetadataDatasets(rows) {
  const body = document.getElementById('metadata-datasets');
  if (!body) return;
  body.replaceChildren();
  if (!rows.length) {
    appendEmptyRow(body, 4, 'No dataset metadata available.');
    return;
  }

  rows.forEach((row) => {
    const tr = document.createElement('tr');
    appendCell(tr, row.dataset_name);
    appendCell(tr, row.source_database);
    appendCell(tr, formatAccessLevel(row.default_access_level));
    appendCell(tr, row.api_endpoint || 'Metadata only');
    body.appendChild(tr);
  });
}

function renderMetadataVariables(rows) {
  const body = document.getElementById('metadata-variables');
  if (!body) return;
  body.replaceChildren();
  if (!rows.length) {
    appendEmptyRow(body, 4, 'No variable metadata available.');
    return;
  }

  rows.slice(0, 12).forEach((row) => {
    const tr = document.createElement('tr');
    appendCell(tr, row.display_name || row.variable_name);
    appendCell(tr, row.source_database);
    appendCell(tr, row.unit || 'NA');
    appendCell(tr, row.value_type);
    body.appendChild(tr);
  });
}

function renderAccessControl() {
  const metadata = state.metadata || FALLBACK_METADATA;
  renderAccessTierCards(metadata.access_levels || []);
  renderDatasetAccessTable(metadata.dataset_access_policy || []);
  populateAccessRequestControls(metadata);
}

function renderAccessTierCards(rows) {
  const container = document.getElementById('access-tier-cards');
  if (!container) return;
  container.replaceChildren();

  rows.forEach((row) => {
    const card = document.createElement('article');
    card.className = 'access-tier-card';

    const heading = document.createElement('h3');
    heading.textContent = row.display_name;

    const meta = document.createElement('p');
    const login = Number(row.login_required) ? 'Login Required' : 'No Login';
    const approval = Number(row.manual_approval_required) ? 'Manual Approval' : 'Standard Access';
    meta.textContent = `${login} | ${approval}`;

    const description = document.createElement('p');
    description.textContent = row.description || 'Access policy description pending.';

    card.append(heading, meta, description);
    container.appendChild(card);
  });
}

function renderDatasetAccessTable(rows) {
  const body = document.getElementById('dataset-access-policy');
  if (!body) return;
  body.replaceChildren();

  if (!rows.length) {
    appendEmptyRow(body, 4, 'No dataset access policies available.');
    return;
  }

  rows.forEach((row) => {
    const tr = document.createElement('tr');
    appendCell(tr, row.dataset_name);
    appendCell(tr, row.access_level_name || formatAccessLevel(row.access_level_id));
    appendCell(tr, formatAccessLevel(row.release_status));
    appendCell(tr, Number(row.contains_sensitive_data) ? 'Yes' : 'No');
    body.appendChild(tr);
  });
}

function populateAccessRequestControls(metadata) {
  const roleSelect = document.getElementById('access-request-role');
  const datasetSelect = document.getElementById('access-request-dataset');
  if (roleSelect && roleSelect.options.length === 0) {
    (metadata.roles || [])
      .filter((role) => role.role_id !== 'public')
      .forEach((role) => {
        const option = document.createElement('option');
        option.value = role.role_id;
        option.textContent = role.display_name;
        roleSelect.appendChild(option);
      });
  }
  if (datasetSelect && datasetSelect.options.length === 0) {
    (metadata.datasets || []).forEach((dataset) => {
      const option = document.createElement('option');
      option.value = dataset.dataset_id;
      option.textContent = dataset.dataset_name;
      datasetSelect.appendChild(option);
    });
  }
}

function formatAccessLevel(value) {
  return String(value || 'public')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function renderBiologicalRegionReference() {
  const container = document.getElementById('bio-region-reference');
  if (!container) return;
  container.replaceChildren();

  HRBMP_REGIONS.forEach((region) => {
    const rows = rowsForHudsonRegion(state.biologicalRows, region);
    const card = document.createElement('article');
    card.className = 'region-reference-card';
    card.innerHTML = `
      <strong>Region ${region.number} - ${escapeHtml(region.name)}</strong>
      <span>${escapeHtml(region.code)}; River Mile ${escapeHtml(region.river_mile_range)}</span>
      <span>${formatNumber(rows.length)} Biological Record${rows.length === 1 ? '' : 's'}</span>
    `;
    container.appendChild(card);
  });
}

function renderEnvironmental() {
  renderEnvironmentalSourcePanel();
  renderEnvironmentalMetrics();
  renderEnvironmentalMap();
  renderAnnualChart();
  renderTaxaChart();
  renderEnvironmentalTable();
}

function renderEnvironmentalSourcePanel() {
  const tabs = document.getElementById('env-source-tabs');
  const list = document.getElementById('env-covariate-list');
  const sourceKey = state.selectedEnvSource || 'hrbmp';
  const source = ENV_SOURCES[sourceKey] || ENV_SOURCES.hrbmp;
  if (!tabs || !list || !source) return;

  tabs.replaceChildren();
  Object.entries(ENV_SOURCES).forEach(([key, meta]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'source-tab';
    button.classList.toggle('active', key === sourceKey);
    button.textContent = meta.label;
    button.addEventListener('click', () => selectEnvironmentalSource(key));
    tabs.appendChild(button);
  });

  list.replaceChildren();
  variablesForSource(sourceKey).forEach((key) => {
    const variable = ENV_VARIABLES[key];
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'covariate-chip';
    chip.classList.toggle('active', valueOf('env-variable') === key);
    chip.innerHTML = `<strong>${escapeHtml(variable.label)}</strong><span>${escapeHtml(variable.unit)}</span>`;
    chip.addEventListener('click', () => {
      const select = document.getElementById('env-variable');
      if (select) select.value = key;
      renderEnvironmentalSourcePanel();
      renderEnvironmentalMap();
    });
    list.appendChild(chip);
  });
}

function selectEnvironmentalSource(sourceKey) {
  state.selectedEnvSource = sourceKey;
  const variableSelect = document.getElementById('env-variable');
  const variables = variablesForSource(sourceKey);
  populateSelect('env-variable', variables.map((key) => ({ value: key, label: ENV_VARIABLES[key].label })), 'Select Covariate');
  if (variableSelect && variables.length > 0) {
    variableSelect.value = variables[0];
  }
  renderEnvironmentalSourcePanel();
  renderEnvironmentalMap();
}

function variablesForSource(sourceKey) {
  return (ENV_SOURCES[sourceKey] || ENV_SOURCES.hrbmp).variables.filter((key) => ENV_VARIABLES[key]);
}

function renderEnvironmentalMap() {
  const rows = filterRows(state.environmentalRows, {
    yearStart: valueOf('env-year-start'),
    yearEnd: valueOf('env-year-end'),
    monthStart: valueOf('env-month-start'),
    monthEnd: valueOf('env-month-end'),
    dayStart: valueOf('env-day-start'),
    dayEnd: valueOf('env-day-end')
  }).filter(hasCoordinates);
  const requestedVariable = valueOf('env-variable');
  const variable = ENV_VARIABLES[requestedVariable] ? requestedVariable : variablesForSource(state.selectedEnvSource || 'hrbmp')[0] || 'mean_temperature_c';
  const variableMeta = ENV_VARIABLES[variable] || ENV_VARIABLES.mean_temperature_c;
  const sourceMeta = ENV_SOURCES[variableMeta.source] || ENV_SOURCES.hrbmp;
  const variableValues = rows.map((row) => row[variable]).filter(Number.isFinite);

  renderMapStats('env-map-stats', [
    ['Environmental Records', sumRecordCounts(rows, 'environmental')],
    ['Mean Selected Covariate', variableValues.length ? formatMetric(average(variableValues), variableMeta.unit) : 'NA'],
    ['Covariate Source', sourceMeta.label]
  ]);
  updateEnvironmentalDataRequestSummary(rows);

  if (!isActiveTab('environmental-database')) return;

  const map = ensureLeafletMap('env-map', 'environmental');
  if (!map) return;

  clearMapLayers('environmental');

  if (checked('env-layer-region-reference')) {
    addRegionReferenceLayer(map, 'environmental', rows);
  }

  if (checked('env-layer-river-centerline')) {
    addHudsonCenterlineLayer(map, 'environmental');
  }

  if (checked('env-layer-values')) {
    addEnvironmentalRecordDotLayer(map, rows, {
      variable,
      variableMeta,
      popupType: 'environmental-record'
    });
  }

  if (checked('env-layer-regional-totals')) {
    addRegionTotalCircleLayer(map, 'environmental', rows);
  }

  setText('env-selected', rows.length ? `Environmental records with ${variableMeta.label.toLowerCase()} context from ${sourceMeta.label}.` : 'No environmental records match the selected filters.');
  updateLegend('environmental', legendHtml('Environmental Map', [
    checked('env-layer-values') && { color: '#2f6f9f', label: 'Environmental Records' },
    checked('env-layer-regional-totals') && { color: '#1b8d86', label: 'Regional Totals' },
    checked('env-layer-region-reference') && { color: '#755d2a', label: 'HRBMP Region Boundaries' },
    checked('env-layer-river-centerline') && { color: '#176b78', label: 'Hudson River Centerline' }
  ].filter(Boolean)));
  fitRows(map, rows);
}

function ensureLeafletMap(containerId, key) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  if (!window.L) {
    container.innerHTML = '<div class="empty-state" style="padding:18px;">Leaflet did not load. Serve this page with internet access or install local Leaflet assets for offline use.</div>';
    return null;
  }

  if (state.maps[key]) {
    applyBasemap(key, selectedBasemapKey(key));
    state.maps[key].invalidateSize();
    return state.maps[key];
  }

  const map = L.map(containerId, {
    center: [41.55, -73.92],
    zoom: 7,
    minZoom: 6,
    maxZoom: 18,
    scrollWheelZoom: true
  });

  state.maps[key] = map;
  applyBasemap(key, selectedBasemapKey(key));
  L.control.scale({ imperial: true, metric: true }).addTo(map);
  map.fitBounds(HUDSON_BOUNDS, { padding: [24, 24] });

  return map;
}

function selectedBasemapKey(mapKey) {
  const id = mapKey === 'biological' ? 'bio-basemap' : 'env-basemap';
  const selected = valueOf(id);
  return MAP_BASEMAPS[selected] ? selected : DEFAULT_BASEMAP;
}

function applyBasemap(mapKey, basemapKey) {
  const map = state.maps[mapKey];
  if (!map || !window.L) return;

  const selected = MAP_BASEMAPS[basemapKey] ? basemapKey : DEFAULT_BASEMAP;
  if (state.baseLayers[mapKey]) {
    map.removeLayer(state.baseLayers[mapKey]);
  }

  const basemap = MAP_BASEMAPS[selected];
  state.baseLayers[mapKey] = L.tileLayer(basemap.url, basemap.options).addTo(map);
}

function addClusterLayer(map, mapKey, rows, options) {
  const values = rows.map((row) => Number(row[options.valueKey])).filter(Number.isFinite);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const layer = createMarkerGroup(options.clusterClass, options.disableCluster);

  rows.forEach((row) => {
    const value = Number(row[options.valueKey]) || 0;
    const size = scaleValue(value, min, max, 20, 42);
    const color = options.markerType === 'environmental'
      ? colorForValue(value, min, max, options.variableMeta.colors)
      : '#1e8f84';
    const marker = L.marker([row.latitude, row.longitude], {
      icon: markerIcon({
        className: `availability-marker ${options.markerType}`,
        color,
        size,
        label: options.markerType === 'environmental' ? shortNumber(value) : row.biological_records
      })
    });

    marker.bindPopup(popupHtml(row, options.popupType, options));
    marker.on('click', () => {
      const targetId = mapKey === 'biological' ? 'bio-selected' : 'env-selected';
      setText(targetId, selectedText(row, options.popupType, options));
    });
    layer.addLayer(marker);
  });

  layer.addTo(map);
  state.layers[mapKey].push(layer);
}

function addSiteLayer(map, mapKey, rows, options) {
  const features = aggregateByStation(rows);
  const layer = L.layerGroup();

  features.forEach((feature) => {
    const marker = L.circleMarker([feature.latitude, feature.longitude], {
      radius: options.radius || 7,
      color: '#ffffff',
      weight: 2,
      fillColor: options.color,
      fillOpacity: 0.95
    });
    marker.bindPopup(popupHtml(feature, options.popupType, options));
    marker.on('click', () => {
      const targetId = mapKey === 'biological' ? 'bio-selected' : 'env-selected';
      setText(targetId, selectedText(feature, options.popupType, options));
    });
    layer.addLayer(marker);
  });

  layer.addTo(map);
  state.layers[mapKey].push(layer);
}

function addBiologicalRecordDotLayer(map, rows) {
  const layer = L.layerGroup();

  rows.forEach((row) => {
    const marker = L.circleMarker([row.latitude, row.longitude], {
      radius: 3.4,
      color: '#ffffff',
      weight: 0.9,
      fillColor: '#1e8f84',
      fillOpacity: 0.55
    });
    marker.bindPopup(popupHtml(row, 'biological-record'));
    marker.on('click', () => {
      setText('bio-selected', selectedText(row, 'biological-record'));
    });
    layer.addLayer(marker);
  });

  layer.addTo(map);
  state.layers.biological.push(layer);
}

function addEnvironmentalRecordDotLayer(map, rows, options = {}) {
  const layer = L.layerGroup();

  rows.forEach((row) => {
    const marker = L.circleMarker([row.latitude, row.longitude], {
      radius: 3.4,
      color: '#ffffff',
      weight: 0.9,
      fillColor: '#2f6f9f',
      fillOpacity: 0.55
    });
    marker.bindPopup(popupHtml(row, 'environmental-record', options));
    marker.on('click', () => {
      setText('env-selected', selectedText(row, 'environmental-record', options));
    });
    layer.addLayer(marker);
  });

  layer.addTo(map);
  state.layers.environmental.push(layer);
}

function addRegionReferenceLayer(map, mapKey, rows) {
  const layer = L.layerGroup();

  HRBMP_REGIONS.forEach((region) => {
    const middle = interpolateHudsonCenterline((region.min_river_mile + region.max_river_mile) / 2);
    const label = L.marker([middle.latitude, middle.longitude - 0.39], {
      icon: L.divIcon({
        className: 'region-line-label',
        html: `<strong>${escapeHtml(region.code)}</strong><span>${escapeHtml(region.river_mile_range)}</span>`,
        iconSize: [82, 20],
        iconAnchor: [0, 11]
      }),
      interactive: false
    });
    layer.addLayer(label);
  });

  HRBMP_REGIONS.forEach((region) => {
    layer.addLayer(regionBoundaryLine(region.min_river_mile, `Region ${region.number} starts at River Mile ${region.min_river_mile}`));
  });
  const finalRegion = HRBMP_REGIONS[HRBMP_REGIONS.length - 1];
  layer.addLayer(regionBoundaryLine(finalRegion.max_river_mile, `Region ${finalRegion.number} ends at River Mile ${finalRegion.max_river_mile}`));

  layer.addTo(map);
  state.layers[mapKey].push(layer);
}

function addHudsonCenterlineLayer(map, mapKey) {
  const layer = L.layerGroup();
  const line = L.polyline(
    HUDSON_CENTERLINE.map((point) => [point.latitude, point.longitude]),
    {
      color: '#176b78',
      weight: 3,
      opacity: 0.82,
      dashArray: '7 6'
    }
  );
  line.bindTooltip('Hudson River centerline reference', {
    sticky: true
  });
  layer.addLayer(line);
  layer.addTo(map);
  state.layers[mapKey].push(layer);
}

function addRegionTotalCircleLayer(map, mapKey, rows) {
  const countByRegionCode = summarizeRowsByRegionCode(rows, mapKey);
  const counts = HRBMP_REGIONS.map((region) => {
    const count = countByRegionCode.get(region.code) || 0;
    return {
      region,
      count,
      position: regionTotalPosition(region, rows)
    };
  }).filter((item) => item.count > 0 && item.position);
  const positiveCounts = counts.map((item) => item.count).filter((value) => value > 0);
  const min = Math.min(...positiveCounts, 1);
  const max = Math.max(...positiveCounts, 1);
  const layer = L.layerGroup();

  counts.forEach((item) => {
    const size = scaleValue(item.count, min, max, 24, 42);
    const marker = L.marker([item.position.latitude, item.position.longitude], {
      icon: L.divIcon({
        className: 'region-total-marker',
        html: `<span style="width:${size}px;height:${size}px;">${formatNumber(item.count)}</span>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
      })
    });
    marker.bindTooltip(`${item.region.code}: ${formatNumber(item.count)} selected record${item.count === 1 ? '' : 's'}`, {
      direction: 'top',
      sticky: true
    });
    marker.bindPopup(`
      <h3>${escapeHtml(item.region.code)} - ${escapeHtml(item.region.name)}</h3>
      <dl>
        <dt>${mapKey === 'biological' ? 'Biological Records' : 'Environmental Records'}</dt><dd>${formatNumber(item.count)}</dd>
        <dt>River Mile Range</dt><dd>${escapeHtml(item.region.river_mile_range)}</dd>
      </dl>
    `);
    layer.addLayer(marker);
  });

  layer.addTo(map);
  state.layers[mapKey].push(layer);
}

function summarizeRowsByRegionCode(rows, mapKey) {
  return rows.reduce((counts, row) => {
    const code = canonicalRegionCode(row);
    if (!code) return counts;
    counts.set(code, (counts.get(code) || 0) + recordCountForMapRow(row, mapKey));
    return counts;
  }, new Map());
}

function sumRecordCounts(rows, mapKey) {
  return rows.reduce((total, row) => total + recordCountForMapRow(row, mapKey), 0);
}

function recordCountForMapRow(row, mapKey) {
  const key = mapKey === 'biological' ? 'biological_records' : 'environmental_records';
  const value = Number(row[key]);
  return Number.isFinite(value) && value > 0 ? value : 1;
}

function regionTotalPosition(region, rows) {
  const regionRows = rowsForHudsonRegion(rows, region).filter(hasCoordinates);
  if (regionRows.length) {
    return {
      latitude: average(regionRows.map((row) => row.latitude)),
      longitude: average(regionRows.map((row) => row.longitude))
    };
  }
  return interpolateHudsonCenterline((region.min_river_mile + region.max_river_mile) / 2);
}

function canonicalRegionCode(row) {
  const regionCode = String(row.region_code || '').trim().toUpperCase();
  if (regionCode) return regionCode;

  const regionNumber = asNumberOrNull(row.region_number);
  if (Number.isFinite(regionNumber)) {
    const byNumber = HRBMP_REGIONS.find((region) => region.number === regionNumber);
    if (byNumber) return byNumber.code;
  }

  const regionName = String(row.region_name || row.region || '').replace(/^Region\s+\d+\s*-\s*/i, '').trim().toLowerCase();
  const byName = HRBMP_REGIONS.find((region) => region.name.toLowerCase() === regionName);
  if (byName) return byName.code;

  const riverMile = Number(row.river_mile);
  const byMile = HRBMP_REGIONS.find((region) => riverMile >= region.min_river_mile && riverMile <= region.max_river_mile);
  return byMile ? byMile.code : '';
}

function rowsForHudsonRegion(rows, region) {
  return rows.filter((row) => {
    return canonicalRegionCode(row) === region.code;
  });
}

function regionBoundaryLine(riverMile, title) {
  const point = interpolateHudsonCenterline(riverMile);
  const line = L.polyline([
    [point.latitude, point.longitude - 0.39],
    [point.latitude, point.longitude + 0.08]
  ], {
    color: '#5f6368',
    weight: 1.6,
    opacity: 0.78,
    dashArray: '4 3',
    interactive: true
  });
  line.bindTooltip(title, { sticky: true });
  return line;
}

function interpolateHudsonCenterline(riverMile) {
  for (let index = 0; index < HUDSON_CENTERLINE.length - 1; index += 1) {
    const start = HUDSON_CENTERLINE[index];
    const end = HUDSON_CENTERLINE[index + 1];
    if (riverMile >= start.river_mile && riverMile <= end.river_mile) {
      const position = (riverMile - start.river_mile) / (end.river_mile - start.river_mile);
      return {
        latitude: start.latitude + (end.latitude - start.latitude) * position,
        longitude: start.longitude + (end.longitude - start.longitude) * position
      };
    }
  }
  return HUDSON_CENTERLINE[HUDSON_CENTERLINE.length - 1];
}

function addRegionLayer(map, mapKey, rows, options) {
  const regions = aggregateByRegion(rows, options.valueKey);
  const values = regions.map((region) => region.value).filter(Number.isFinite);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const layer = L.layerGroup();

  regions.forEach((region) => {
    const marker = L.circleMarker([region.latitude, region.longitude], {
      radius: scaleValue(region.value, min, max, 20, 46),
      color: '#ffffff',
      weight: 2,
      fillColor: options.color,
      fillOpacity: 0.44
    });
    marker.bindPopup(`
      <h3>${escapeHtml(region.region)}</h3>
      <dl>
        <dt>${escapeHtml(options.label)}</dt><dd>${formatNumber(region.value)}</dd>
        <dt>Stations</dt><dd>${formatNumber(region.stations)}</dd>
        <dt>Events</dt><dd>${formatNumber(region.events)}</dd>
      </dl>
    `);
    marker.on('click', () => {
      const targetId = mapKey === 'biological' ? 'bio-selected' : 'env-selected';
      setText(targetId, `${region.region}: ${formatNumber(region.value)} ${options.label.toLowerCase()} across ${region.stations} station(s).`);
    });
    layer.addLayer(marker);
  });

  layer.addTo(map);
  state.layers[mapKey].push(layer);
}

function createMarkerGroup(clusterClass, disableCluster = false) {
  if (!disableCluster && window.L && L.markerClusterGroup) {
    return L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 90,
      iconCreateFunction(cluster) {
        const count = cluster.getChildCount();
        const size = count < 10 ? 38 : count < 100 ? 46 : 54;
        return L.divIcon({
          html: `<span>${formatNumber(count)}</span>`,
          className: clusterClass,
          iconSize: [size, size]
        });
      }
    });
  }

  return L.layerGroup();
}

function markerIcon({ className, color, size, label }) {
  return L.divIcon({
    className,
    html: `<span style="background:${color};width:${size}px;height:${size}px;">${escapeHtml(label)}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
}

function clearMapLayers(key) {
  const map = state.maps[key];
  if (!map) return;
  state.layers[key].forEach((layer) => {
    map.removeLayer(layer);
  });
  state.layers[key] = [];
}

function updateLegend(key, html) {
  const map = state.maps[key];
  if (!map || !window.L) return;

  if (state.legends[key]) {
    map.removeControl(state.legends[key]);
  }

  const legend = L.control({ position: 'bottomright' });
  legend.onAdd = () => {
    const div = L.DomUtil.create('div', 'legend-control');
    div.innerHTML = html;
    return div;
  };
  legend.addTo(map);
  state.legends[key] = legend;
}

function legendHtml(title, entries) {
  const items = entries.map((entry) => {
    const style = `background:${entry.color}`;
    return `<div><span class="legend-swatch" style="${style}"></span>${escapeHtml(entry.label)}</div>`;
  }).join('');
  return `<strong>${escapeHtml(title)}</strong>${items}`;
}

function refreshActiveMap() {
  if (!state.ready) return;

  requestAnimationFrame(() => {
    if (isActiveTab('biological-database')) renderBiologicalMap();
    if (isActiveTab('environmental-database')) renderEnvironmentalMap();
  });
}

function fitRows(map, rows) {
  const coordinates = rows.filter(hasCoordinates).map((row) => [row.latitude, row.longitude]);
  if (coordinates.length === 0) {
    map.fitBounds(HUDSON_BOUNDS, { padding: [24, 24] });
    return;
  }

  if (coordinates.length === 1) {
    map.setView(coordinates[0], 10);
    return;
  }

  map.fitBounds(coordinates, { padding: [42, 42], maxZoom: 10 });
}

function renderEnvironmentalMetrics() {
  const env = state.data.environmental_summary[0] || {};
  const rows = state.environmentalRows || [];
  const container = document.getElementById('environmental-metrics');
  if (!container) return;

  renderMetricCards(container, [
    ['Mean Temperature', formatMetric(env.mean_temperature_c, 'deg C')],
    ['Mean Dissolved Oxygen', formatMetric(env.mean_dissolved_oxygen_mg_l, 'mg/L')],
    ['Mean Conductivity', formatMetric(average(rows.map((row) => row.mean_conductivity_us_cm)), 'uS/cm')],
    ['Mean Sampling Depth', formatMetric(average(rows.map((row) => row.sampling_depth_m)), 'm')],
    ['Mean Salinity', formatMetric(env.mean_salinity_psu, 'PSU')],
    ['Mean Turbidity', formatMetric(env.mean_turbidity_ntu, 'NTU')]
  ]);
}

function renderAnnualChart() {
  const container = document.getElementById('annual-chart');
  const rows = Array.from(groupBy(state.biologicalRows, 'year').entries())
    .map(([year, yearRows]) => ({
      year,
      biological_records: sum(yearRows, 'biological_records')
    }))
    .sort((a, b) => Number(a.year) - Number(b.year));
  if (!container) return;
  renderBars(container, rows, 'year', 'biological_records');
}

function renderTaxaChart() {
  const container = document.getElementById('taxa-chart');
  const rows = Array.from(groupBy(state.biologicalRows, 'common_name').entries())
    .map(([commonName, taxaRows]) => ({
      common_name: commonName,
      biological_records: sum(taxaRows, 'biological_records')
    }))
    .sort((a, b) => b.biological_records - a.biological_records)
    .slice(0, 12);
  if (!container) return;
  renderBars(container, rows, 'common_name', 'biological_records');
}

function renderEnvironmentalTable() {
  const body = document.getElementById('environmental-body');
  if (!body) return;
  body.replaceChildren();

  if (state.environmentalRows.length === 0) {
    appendEmptyRow(body, 10, 'No environmental records found in the current export.');
    return;
  }

  state.environmentalRows
    .slice()
    .sort((a, b) => a.year - b.year || a.month - b.month || b.river_mile - a.river_mile)
    .forEach((row) => {
      const tr = document.createElement('tr');
      [
        `${row.station_id} - ${row.station_name}`,
        row.region,
        row.year,
        monthName(row.month),
        row.environmental_records,
        formatMetric(row.mean_temperature_c, 'deg C'),
        formatMetric(row.mean_dissolved_oxygen_mg_l, 'mg/L'),
        formatMetric(row.mean_conductivity_us_cm, 'uS/cm'),
        formatMetric(row.sampling_depth_m, 'm'),
        formatMetric(row.mean_salinity_psu, 'PSU')
      ].forEach((value) => appendCell(tr, value));
      body.appendChild(tr);
    });
}

function renderCatalog() {
  const container = document.getElementById('image-catalog');
  if (!container) return;

  const allRecords = (state.data.sampling_image_catalog || []).sort(compareCatalogRecords);
  const imageType = valueOf('catalog-type');
  const speciesFilter = valueOf('catalog-species');
  const imageTypeRecords = filterCatalogRows(allRecords, { imageType }).sort(compareCatalogRecords);
  const keySpeciesSummaries = summarizeCatalogSpecies(imageTypeRecords.filter((row) => row.is_key_species));
  const allSpeciesSummaries = summarizeCatalogSpecies(imageTypeRecords);

  if (speciesFilter && speciesFilter !== 'all') {
    state.selectedCatalogSpecies = speciesFilter;
  }

  renderSummaryStrip('catalog-summary', [
    ['Key Species', keySpeciesSummaries.length],
    ['All Species', uniqueCount(allRecords, 'species_common')],
    ['Life-Stage Records', sum(imageTypeRecords, 'image_count') || imageTypeRecords.length],
    ['Life Stages', CATALOG_LIFE_STAGE_DISTRIBUTION.length]
  ]);

  container.replaceChildren();

  if (keySpeciesSummaries.length === 0) {
    const empty = document.createElement('article');
    empty.className = 'catalog-card empty-state-card';
    empty.textContent = 'No key species records match the selected filters.';
    container.appendChild(empty);
    renderCatalogDetail(null, []);
    renderAllSpeciesList(allSpeciesSummaries);
    return;
  }

  if (!state.selectedCatalogSpecies || !allSpeciesSummaries.some((summary) => summary.species_common === state.selectedCatalogSpecies)) {
    state.selectedCatalogSpecies = keySpeciesSummaries[0].species_common;
  }

  keySpeciesSummaries.forEach((summary) => {
    const card = document.createElement('article');
    card.className = 'catalog-card species-catalog-card';
    card.classList.toggle('active', summary.species_common === state.selectedCatalogSpecies);
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-pressed', summary.species_common === state.selectedCatalogSpecies ? 'true' : 'false');
    card.addEventListener('click', () => selectCatalogSpecies(summary.species_common));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectCatalogSpecies(summary.species_common);
      }
    });

    const visual = document.createElement('div');
    visual.className = 'catalog-visual';
    appendCatalogImage(visual, summary.image_url, summary.species_common);

    const copy = document.createElement('div');
    copy.className = 'catalog-copy';

    const label = document.createElement('span');
    label.className = 'catalog-id';
    label.textContent = `Highlighted species ${summary.highlight_rank}`;

    const heading = document.createElement('h2');
    heading.textContent = summary.species_common || 'Image Category';

    const species = document.createElement('p');
    species.className = 'catalog-species';
    species.textContent = summary.species_scientific || 'Scientific name pending';

    const description = document.createElement('p');
    description.textContent = 'Click to view Hudson River distribution, data availability, and life-stage image records.';

    const meta = document.createElement('dl');
    meta.className = 'catalog-meta';
    [
      ['Catalog Records', formatNumber(summary.catalog_records)],
      ['Life Stages', summary.life_stages.join(', ')],
      ['Regions', summary.regions.join(', ')],
      ['Date Range', formatCatalogDateRange(summary.records)]
    ].forEach(([term, value]) => appendMetaItem(meta, term, value));

    const source = document.createElement('a');
    source.className = 'source-link';
    source.href = summary.source_url;
    source.target = '_blank';
    source.rel = 'noopener';
    source.textContent = 'HRBMP Species Highlights Reference';
    source.addEventListener('click', (event) => event.stopPropagation());

    copy.append(label, heading, species, description, meta, source);
    card.append(visual, copy);
    container.appendChild(card);
  });

  const selectedSummary = allSpeciesSummaries.find((summary) => summary.species_common === state.selectedCatalogSpecies) || keySpeciesSummaries[0];
  renderCatalogDetail(selectedSummary, imageTypeRecords);
  renderAllSpeciesList(allSpeciesSummaries);
}

function selectCatalogSpecies(speciesName) {
  state.selectedCatalogSpecies = speciesName;
  state.selectedCatalogLifeStage = null;
  const select = document.getElementById('catalog-species');
  if (select && Array.from(select.options).some((option) => option.value === speciesName)) {
    select.value = speciesName;
  }
  renderCatalog();
  requestAnimationFrame(() => {
    document.getElementById('catalog-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function selectCatalogLifeStage(lifeStage) {
  state.selectedCatalogLifeStage = lifeStage === 'all' ? null : lifeStage;
  const typeSelect = document.getElementById('catalog-type');
  if (typeSelect) typeSelect.value = 'all';
  renderCatalog();
  requestAnimationFrame(() => {
    scrollToElementWithOffset('catalog-life-history', 86);
  });
}

function renderAllSpeciesList(speciesSummaries) {
  const list = document.getElementById('all-species-list');
  const count = document.getElementById('all-species-count');
  if (!list) return;

  if (count) {
    count.textContent = `${formatNumber(speciesSummaries.length)} species`;
  }

  list.replaceChildren();
  speciesSummaries
    .slice()
    .sort((a, b) => allSpeciesIndex(a.species_common) - allSpeciesIndex(b.species_common))
    .forEach((summary) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = summary.is_key_species ? 'all-species-pill key-species' : 'all-species-pill';
      button.classList.toggle('active', summary.species_common === state.selectedCatalogSpecies);
      button.textContent = summary.species_common;
      button.addEventListener('click', () => selectCatalogSpecies(summary.species_common));
      list.appendChild(button);
    });
}

function summarizeCatalogSpecies(records) {
  return Array.from(groupBy(records, 'species_common').entries())
    .map(([speciesName, speciesRows]) => {
      const sortedRows = speciesRows.slice().sort(compareCatalogRecords);
      const base = sortedRows[0];
      return {
        species_common: speciesName,
        species_scientific: base.species_scientific,
        highlight_rank: base.highlight_rank,
        is_key_species: base.is_key_species,
        image_url: base.image_url,
        source_url: base.source_url,
        catalog_records: sum(sortedRows, 'image_count') || sortedRows.length,
        records: sortedRows,
        image_types: sortImageTypes(sortedRows.map((row) => row.image_type)),
        life_stages: sortLifeStages(sortedRows.map((row) => row.life_stage)),
        regions: uniqueSorted(sortedRows.map((row) => row.region))
      };
    })
    .sort((a, b) => a.highlight_rank - b.highlight_rank || a.species_common.localeCompare(b.species_common));
}

function renderCatalogDetail(summary, filteredRecords) {
  const detail = document.getElementById('catalog-detail');
  if (!detail) return;
  detail.replaceChildren();

  if (!summary) {
    detail.classList.add('empty-state-card');
    detail.textContent = 'Select a species to inspect image metadata and availability.';
    return;
  }

  detail.classList.remove('empty-state-card');

  const selectedSpecies = summary.species_common;
  const allSpeciesCatalogRows = (state.data.sampling_image_catalog || [])
    .filter((row) => row.species_common === selectedSpecies)
    .sort(compareCatalogRecords);
  const visibleSpeciesRows = filteredRecords
    .filter((row) => row.species_common === selectedSpecies)
    .sort(compareCatalogRecords);
  const selectedStageRows = state.selectedCatalogLifeStage
    ? allSpeciesCatalogRows.filter((row) => row.life_stage === state.selectedCatalogLifeStage)
    : allSpeciesCatalogRows;
  const archiveRows = state.selectedCatalogLifeStage
    ? visibleSpeciesRows.filter((row) => row.life_stage === state.selectedCatalogLifeStage)
    : visibleSpeciesRows;
  const biologicalRows = rowsForSpecies(state.biologicalRows, selectedSpecies);
  const distributionRows = aggregateDistributionRows(
    selectedSpecies,
    selectedStageRows,
    state.selectedCatalogLifeStage ? [] : biologicalRows
  );

  const header = document.createElement('div');
  header.className = 'catalog-detail-header';

  const visual = document.createElement('div');
  visual.className = 'catalog-detail-visual';
  appendCatalogImage(visual, summary.image_url, selectedSpecies);

  const intro = document.createElement('div');
  const label = document.createElement('span');
  label.className = 'catalog-id';
  label.textContent = `Selected species ${summary.highlight_rank}`;
  const heading = document.createElement('h2');
  heading.textContent = selectedSpecies;
  const scientific = document.createElement('p');
  scientific.className = 'catalog-species';
  scientific.textContent = summary.species_scientific;
  const copy = document.createElement('p');
  copy.textContent = 'Distribution and availability are prototype summaries designed to show how users could inspect species-specific image and monitoring coverage.';
  intro.append(label, heading, scientific, copy);
  header.append(visual, intro);

  const stats = document.createElement('div');
  stats.className = 'summary-strip catalog-detail-stats';
  renderSummaryItems(stats, [
    ['Image Archive Records', sum(archiveRows, 'image_count') || archiveRows.length],
    ['Distribution Stations', uniqueCount(selectedStageRows, 'station_id')],
    ['Biological Records', biologicalRows.length ? sum(biologicalRows, 'biological_records') : 'Pending'],
    ['Life Stages', sortLifeStages(allSpeciesCatalogRows.map((row) => row.life_stage)).join(', ')]
  ]);

  const lifeHistory = document.createElement('section');
  lifeHistory.id = 'catalog-life-history';
  lifeHistory.className = 'catalog-subsection';
  const lifeHistoryTitle = document.createElement('h3');
  lifeHistoryTitle.textContent = 'Life History Stage';
  const lifeHistoryNote = document.createElement('p');
  lifeHistoryNote.textContent = 'Choose a stage to update the distribution bar, data availability, and image archive.';
  const stageControls = document.createElement('div');
  stageControls.className = 'life-stage-tabs';
  const allButton = createLifeStageButton('All Life Stages', 'all', state.selectedCatalogLifeStage === null);
  stageControls.appendChild(allButton);
  sortLifeStages(allSpeciesCatalogRows.map((row) => row.life_stage)).forEach((stage) => {
    stageControls.appendChild(createLifeStageButton(stage, stage, state.selectedCatalogLifeStage === stage));
  });
  lifeHistory.append(lifeHistoryTitle, lifeHistoryNote, stageControls);

  const distribution = document.createElement('section');
  distribution.id = 'catalog-distribution';
  distribution.className = 'catalog-subsection';
  const distributionTitle = document.createElement('h3');
  distributionTitle.textContent = state.selectedCatalogLifeStage
    ? `${state.selectedCatalogLifeStage} Distribution Along The Hudson River`
    : 'Distribution Along The Hudson River';
  const distributionNote = document.createElement('p');
  distributionNote.textContent = biologicalRows.length
    ? 'Points combine prototype catalog stations with biological database availability for this species.'
    : 'Points use pseudo catalog stations until verified species-level biological records are connected.';
  const strip = document.createElement('div');
  renderDistributionStrip(strip, distributionRows);
  distribution.append(distributionTitle, distributionNote, strip);

  const availability = document.createElement('section');
  availability.className = 'catalog-subsection';
  const availabilityTitle = document.createElement('h3');
  availabilityTitle.textContent = 'Data Availability';
  const availabilityGrid = document.createElement('div');
  availabilityGrid.className = 'availability-grid';
  renderSummaryItems(availabilityGrid, [
    ['Regions Represented', uniqueSorted(distributionRows.map((row) => row.region)).join(', ')],
    ['Stations Represented', uniqueCount(distributionRows, 'station_id')],
    ['Image Date Range', formatCatalogDateRange(selectedStageRows)],
    ['Image Types Shown', sortImageTypes(archiveRows.map((row) => row.image_type)).join(', ') || 'None']
  ]);
  availability.append(availabilityTitle, availabilityGrid);

  const lifeStages = document.createElement('section');
  lifeStages.className = 'catalog-subsection';
  const lifeStageTitle = document.createElement('h3');
  lifeStageTitle.textContent = state.selectedCatalogLifeStage
    ? `${state.selectedCatalogLifeStage} Image Archive`
    : 'Image Archive';
  const gallery = document.createElement('div');
  gallery.className = 'life-stage-gallery';

  if (archiveRows.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No life-stage images match the selected image type.';
    gallery.appendChild(empty);
  } else {
    archiveRows.forEach((record) => gallery.appendChild(createLifeStageCard(record)));
  }

  lifeStages.append(lifeStageTitle, gallery);
  detail.append(header, stats, lifeHistory, distribution, availability, lifeStages);
}

function createLifeStageButton(label, value, isActive) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'life-stage-tab';
  button.classList.toggle('active', isActive);
  button.textContent = label;
  button.addEventListener('click', () => selectCatalogLifeStage(value));
  return button;
}

function createLifeStageCard(record) {
  const card = document.createElement('article');
  card.className = 'life-stage-card';

  const visual = document.createElement('div');
  visual.className = 'life-stage-visual';
  appendCatalogImage(visual, record.image_url, `${record.species_common} ${record.life_stage}`);

  const copy = document.createElement('div');
  const heading = document.createElement('h4');
  heading.textContent = record.life_stage;
  const meta = document.createElement('dl');
  meta.className = 'catalog-meta';
  [
    ['Image Type', record.image_type],
    ['Date', formatDateParts(record)],
    ['Station', `${record.station_id} - ${record.station_name}`],
    ['Region', record.region],
    ['Gear', record.gear_type]
  ].forEach(([term, value]) => appendMetaItem(meta, term, value));
  copy.append(heading, meta);
  card.append(visual, copy);
  return card;
}

function appendCatalogImage(container, imageUrl, label) {
  if (!imageUrl) {
    container.classList.add('image-pending');
    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    const title = document.createElement('strong');
    title.textContent = label;
    const note = document.createElement('span');
    note.textContent = 'Image pending upload';
    placeholder.append(title, note);
    container.appendChild(placeholder);
    return;
  }

  const image = document.createElement('img');
  image.src = imageUrl;
  image.alt = `${label} catalog image`;
  image.loading = 'lazy';
  image.referrerPolicy = 'no-referrer';
  image.addEventListener('error', () => {
    container.classList.add('image-error');
    container.replaceChildren();
    container.textContent = `${label} image`;
  });
  container.appendChild(image);
}

function rowsForSpecies(rows, speciesName) {
  const target = String(speciesName || '').toLowerCase();
  return rows.filter((row) => {
    const commonName = String(row.common_name || '').toLowerCase();
    const scientificName = String(row.scientific_name || '').toLowerCase();
    return commonName === target || scientificName === target;
  });
}

function aggregateDistributionRows(speciesName, catalogRows, biologicalRows) {
  const byStation = new Map();

  function addRow(row, source, countKey) {
    if (!Number.isFinite(Number(row.river_mile))) return;
    const key = row.station_id || `${row.region}-${row.river_mile}`;
    const current = byStation.get(key) || {
      station_id: row.station_id || key,
      station_name: row.station_name || 'Station metadata pending',
      region: row.region || 'Unassigned',
      river_mile: Number(row.river_mile),
      image_records: 0,
      biological_records: 0,
      life_stages: [],
      source
    };

    if (source === 'Image Catalog') {
      current.image_records += Number(row[countKey] || 1);
      if (row.life_stage && !current.life_stages.includes(row.life_stage)) {
        current.life_stages.push(row.life_stage);
      }
    }
    if (source === 'Biological Database') current.biological_records += Number(row[countKey] || 0);
    current.source = current.biological_records > 0 ? 'Biological Database' : current.source;
    byStation.set(key, current);
  }

  catalogRows.forEach((row) => addRow(row, 'Image Catalog', 'image_count'));
  biologicalRows.forEach((row) => addRow(row, 'Biological Database', 'biological_records'));

  return Array.from(byStation.values())
    .sort((a, b) => b.river_mile - a.river_mile)
    .map((row) => ({ ...row, life_stages: sortLifeStages(row.life_stages), species_common: speciesName }));
}

function renderDistributionStrip(container, rows) {
  container.className = 'distribution-panel';
  container.replaceChildren();

  if (rows.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No distribution points are available for this species yet.';
    container.appendChild(empty);
    return;
  }

  const strip = document.createElement('div');
  strip.className = 'river-mile-strip';
  const line = document.createElement('div');
  line.className = 'river-mile-line';
  strip.appendChild(line);

  rows.forEach((row) => {
    const point = document.createElement('button');
    point.type = 'button';
    point.className = row.biological_records > 0 ? 'distribution-point has-data' : 'distribution-point';
    point.style.left = `${scaleValue(row.river_mile, 0, 153, 3, 97)}%`;
    const stageLabel = row.life_stages.length ? `; ${row.life_stages.join(', ')}` : '';
    point.title = `${row.station_id} - ${row.station_name}; ${row.region}; river mile ${formatNumber(row.river_mile)}${stageLabel}`;
    point.textContent = shortNumber(row.biological_records || row.image_records || 1);
    strip.appendChild(point);
  });

  const labels = document.createElement('div');
  labels.className = 'river-mile-labels';
  labels.innerHTML = '<span>New York Harbor</span><span>Mid-Hudson</span><span>Upper Hudson</span>';

  const list = document.createElement('div');
  list.className = 'distribution-list';
  rows.forEach((row) => {
    const item = document.createElement('article');
    const countText = row.biological_records > 0
      ? `${formatNumber(row.biological_records)} biological records`
      : `${formatNumber(row.image_records)} image record(s)`;
    const stageText = row.life_stages.length ? `; ${row.life_stages.join(', ')}` : '';
    item.innerHTML = `<strong>${escapeHtml(row.region)}</strong><span>${escapeHtml(row.station_id)}; river mile ${formatNumber(row.river_mile)}; ${escapeHtml(countText)}${escapeHtml(stageText)}</span>`;
    list.appendChild(item);
  });

  container.append(strip, labels, list);
}

function renderBars(container, rows, labelKey, valueKey) {
  container.replaceChildren();

  if (!rows.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No chart records found in the current export.';
    container.appendChild(empty);
    return;
  }

  const max = Math.max(...rows.map((row) => Number(row[valueKey]) || 0), 1);
  const list = document.createElement('div');
  list.className = 'bar-list';

  rows.forEach((row) => {
    const value = Number(row[valueKey]) || 0;
    const item = document.createElement('div');
    item.className = 'bar-row';

    const label = document.createElement('strong');
    label.textContent = row[labelKey];

    const track = document.createElement('div');
    track.className = 'bar-track';
    const fill = document.createElement('div');
    fill.className = 'bar-fill';
    fill.style.width = `${Math.max(3, (value / max) * 100)}%`;
    track.appendChild(fill);

    const valueEl = document.createElement('span');
    valueEl.className = 'bar-value';
    valueEl.textContent = formatNumber(value);

    item.append(label, track, valueEl);
    list.appendChild(item);
  });

  container.appendChild(list);
}

function rowsFromGeoJson(geoJson) {
  if (!geoJson || !Array.isArray(geoJson.features)) return [];

  return geoJson.features.map((feature) => {
    const coordinates = feature.geometry && Array.isArray(feature.geometry.coordinates)
      ? feature.geometry.coordinates
      : [];
    return {
      ...(feature.properties || {}),
      longitude: Number(coordinates[0]),
      latitude: Number(coordinates[1])
    };
  });
}

function rowsToGeoJson(rows) {
  return {
    type: 'FeatureCollection',
    features: rows.filter(hasCoordinates).map((row) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [row.longitude, row.latitude]
      },
      properties: Object.fromEntries(
        Object.entries(row).filter(([key]) => key !== 'latitude' && key !== 'longitude')
      )
    }))
  };
}

function deriveAvailabilityFromEvents(data) {
  const stationsById = new Map(data.stations.map((station) => [station.station_id, station]));

  return data.sampling_events.map((event) => {
    const station = stationsById.get(event.station_id) || {};
    return {
      station_id: event.station_id,
      station_name: station.station_name || event.station_name || event.station_id,
      river_mile: station.river_mile,
      latitude: station.latitude,
      longitude: station.longitude,
      region: station.region || event.region || 'Unassigned',
      year: Number(event.year),
      month: Number(event.month),
      day: event.day || dayOfMonth(event.sample_date),
      gear_type: event.gear_type || 'Unknown',
      program: event.program || inferMonitoringProgram(event),
      monitoring_program: inferMonitoringProgram(event),
      life_stage: event.life_stage || inferLifeStage(event),
      sampling_events: 1,
      biological_records: 0,
      total_abundance: 0
    };
  });
}

function normalizeAvailabilityRow(row) {
  const samplingEvents = Number(row.sampling_events || 0);
  const totalAbundance = Number(row.total_abundance || 0);
  const region = resolveHudsonRegion(row);
  return {
    ...row,
    year: Number(row.year),
    month: Number(row.month),
    day: Number(row.day || dayOfMonth(row.sample_date)),
    river_mile: Number(row.river_mile),
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    sampling_events: samplingEvents,
    biological_records: Number(row.biological_records || 0),
    total_abundance: totalAbundance,
    mean_relative_abundance: asNumberOrNull(row.mean_relative_abundance) ?? (samplingEvents > 0 ? totalAbundance / samplingEvents : 0),
    region: region ? `Region ${region.number} - ${region.name}` : row.region || 'Unassigned',
    region_name: region ? region.name : row.region || 'Unassigned',
    region_code: row.region_code || (region ? region.code : ''),
    region_number: region ? region.number : asNumberOrNull(row.region_number),
    river_mile_range: row.river_mile_range || (region ? region.river_mile_range : ''),
    gear_type: row.gear_type || 'Unknown',
    program: row.program || inferMonitoringProgram(row),
    monitoring_program: inferMonitoringProgram(row),
    life_stage: row.life_stage || inferLifeStage(row),
    scientific_name: row.scientific_name || 'Unspecified',
    common_name: row.common_name || row.scientific_name || 'Unspecified'
  };
}

function inferMonitoringProgram(row) {
  const program = String(row.program || row.monitoring_program || '').trim();
  if (BIOLOGICAL_MONITORING_PROGRAMS.includes(program)) return program;

  const gear = String(row.gear_type || '').toLowerCase();
  const month = Number(row.month);
  if (gear.includes('beach') || gear.includes('seine')) return 'Beach Seine Survey';
  if (month >= 9 || month <= 1) return 'Fall Juvenile Survey';
  return 'Long River Survey';
}

function inferLifeStage(row) {
  const lifeStage = String(row.life_stage || '').trim();
  if (lifeStage) return normalizeLifeStageName(lifeStage);

  const month = Number(row.month);
  const day = Number(row.day) || 1;
  const gear = String(row.gear_type || '').toLowerCase();
  if (gear.includes('ichthyoplankton') || gear.includes('plankton')) {
    return day <= 10 ? 'Egg' : day <= 20 ? 'Yolk-Sac Larvae' : 'Post-Yolk-Sac Larvae';
  }
  if (month <= 4) return 'Egg';
  if (month === 5) return 'Yolk-Sac Larvae';
  if (month === 6) return 'Post-Yolk-Sac Larvae';
  if (month === 7 || month === 8) return 'Young Of The Year';
  if (month === 9 || month === 10) return 'Yearling';
  return 'Adult';
}

function normalizeLifeStageName(value) {
  const cleaned = String(value || '').trim();
  const lower = cleaned.toLowerCase().replace(/-/g, ' ');
  if (lower === 'young of year' || lower === 'young of the year' || lower === 'young of-year') return 'Young Of The Year';
  if (lower === 'yoy' || lower === 'young-of-year') return 'Young Of The Year';
  if (lower.includes('post') && lower.includes('yolk')) return 'Post-Yolk-Sac Larvae';
  if (lower.includes('yolk') && lower.includes('sac')) return 'Yolk-Sac Larvae';
  if (lower.includes('larval') || lower.includes('larvae')) return 'Post-Yolk-Sac Larvae';
  if (lower.includes('juvenile')) return 'Young Of The Year';
  if (lower.includes('subadult')) return 'Yearling';
  if (lower.includes('yearling')) return 'Yearling';
  if (lower.includes('adult')) return 'Adult';
  if (lower.includes('egg')) return 'Egg';
  return cleaned;
}

function resolveHudsonRegion(row) {
  const regionNumber = asNumberOrNull(row.region_number);
  if (Number.isFinite(regionNumber)) {
    const byNumber = HRBMP_REGIONS.find((region) => region.number === regionNumber);
    if (byNumber) return byNumber;
  }

  const rawName = String(row.region_name || row.region || '').replace(/^Region\s+\d+\s*-\s*/i, '').trim().toLowerCase();
  return HRBMP_REGIONS_BY_NAME.get(rawName) || null;
}

function ensureMinimumBiologicalRows(rows, minimum) {
  if (!Array.isArray(rows) || rows.length === 0 || rows.length >= minimum) return rows;

  const next = rows.slice();
  let index = 0;
  while (next.length < minimum) {
    const source = rows[index % rows.length];
    const cycle = Math.floor(index / rows.length) + 1;
    const year = Number(source.year) + (cycle % 4);
    const month = ((Number(source.month) + cycle - 1) % 12) + 1;
    const day = ((Number(source.day) + cycle - 1) % 28) + 1;
    const samplingEvents = Math.max(1, Number(source.sampling_events || 1));
    const totalAbundance = Math.max(1, Number(source.total_abundance || 1) + (cycle % 9));
    next.push(normalizeAvailabilityRow({
      ...source,
      station_id: `${source.station_id}-D${cycle}`,
      station_name: `${source.station_name} Demonstration ${cycle}`,
      latitude: Number(source.latitude) + ((cycle % 7) - 3) * 0.003,
      longitude: Number(source.longitude) + ((cycle % 5) - 2) * 0.003,
      year,
      month,
      day,
      sample_date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      sampling_events: samplingEvents,
      biological_records: Math.max(1, Number(source.biological_records || 1)),
      total_abundance: totalAbundance,
      mean_relative_abundance: totalAbundance / samplingEvents
    }));
    index += 1;
  }

  return next;
}

function ensureDistributedBiologicalDemoRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return rows;
  const counts = summarizeRowsByRegionCode(rows, 'biological');
  const total = Array.from(counts.values()).reduce((acc, value) => acc + value, 0);
  const maxRegionCount = Math.max(...Array.from(counts.values()), 0);
  const isSmallDemo = rows.length <= MIN_BIOLOGICAL_DEMO_ROWS;
  const isCollapsed = counts.size < 8 || (total > 0 && maxRegionCount / total > 0.6);
  return isSmallDemo && isCollapsed ? buildDistributedBiologicalDemoRows() : rows;
}

function buildDistributedBiologicalDemoRows() {
  const stages = ['Egg', 'Yolk-Sac Larvae', 'Post-Yolk-Sac Larvae', 'Young Of The Year', 'Yearling', 'Adult'];
  const programs = ['Long River Survey', 'Fall Juvenile Survey', 'Beach Seine Survey'];
  const gearByProgram = {
    'Long River Survey': 'Ichthyoplankton Net',
    'Fall Juvenile Survey': 'Beam Trawl',
    'Beach Seine Survey': 'Beach Seine'
  };
  const rows = [];

  HRBMP_REGIONS.forEach((region, regionIndex) => {
    const count = BIOLOGICAL_DEMO_REGION_COUNTS[region.code] || 0;
    for (let index = 0; index < count; index += 1) {
      const fraction = (index + 1) / (count + 1);
      const riverMile = roundTo(region.min_river_mile + fraction * (region.max_river_mile - region.min_river_mile), 1);
      const coordinates = demoCoordinateForRiverMile(riverMile, index);
      const species = BIOLOGICAL_DEMO_SPECIES[(index + regionIndex * 3) % BIOLOGICAL_DEMO_SPECIES.length];
      const lifeStage = stages[(index + regionIndex) % stages.length];
      const program = programs[(index + regionIndex) % programs.length];
      const year = 2010 + ((index + regionIndex * 2) % 15);
      const month = 1 + ((index + regionIndex * 3) % 12);
      const day = 1 + ((index * 5 + regionIndex) % 28);

      rows.push(normalizeAvailabilityRow({
        station_id: `${region.code}${String(index + 1).padStart(2, '0')}`,
        station_name: `Region ${region.number} ${region.name} Record ${index + 1}`,
        river_mile: riverMile,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        region: `Region ${region.number} - ${region.name}`,
        region_name: region.name,
        region_code: region.code,
        region_number: region.number,
        river_mile_range: region.river_mile_range,
        year,
        month,
        day,
        gear_type: gearByProgram[program],
        program,
        monitoring_program: program,
        taxon_id: `TX-${speciesCode(species[0])}`,
        scientific_name: species[1],
        common_name: species[0],
        taxonomic_group: 'Fish',
        life_stage: lifeStage,
        sampling_events: 1,
        biological_records: 1,
        total_abundance: 0
      }));
    }
  });

  return rows;
}

function ensureDistributedEnvironmentalDemoRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return buildDistributedEnvironmentalDemoRows();
  const counts = summarizeRowsByRegionCode(rows, 'environmental');
  const total = Array.from(counts.values()).reduce((acc, value) => acc + value, 0);
  const maxRegionCount = Math.max(...Array.from(counts.values()), 0);
  const isSmallDemo = rows.length < MIN_ENVIRONMENTAL_DEMO_ROWS;
  const isCollapsed = counts.size < 8 || (total > 0 && maxRegionCount / total > 0.6);
  return isSmallDemo || isCollapsed ? buildDistributedEnvironmentalDemoRows() : rows;
}

function buildDistributedEnvironmentalDemoRows() {
  const rows = [];

  HRBMP_REGIONS.forEach((region, regionIndex) => {
    const count = ENVIRONMENTAL_DEMO_REGION_COUNTS[region.code] || 0;
    for (let index = 0; index < count; index += 1) {
      const fraction = (index + 1) / (count + 1);
      const riverMile = roundTo(region.min_river_mile + fraction * (region.max_river_mile - region.min_river_mile), 1);
      const coordinates = demoCoordinateForRiverMile(riverMile, index);
      const year = 2010 + ((index + regionIndex * 2) % 15);
      const month = 1 + ((index + regionIndex * 3) % 12);
      const day = 1 + ((index * 5 + regionIndex) % 28);
      const salinity = Math.max(0.1, 12 - riverMile * 0.075 + ((index % 3) - 1) * 0.2);
      const temperature = 7 + month * 1.45 + Math.max(0, 152 - riverMile) * 0.01 + ((index % 4) - 1.5) * 0.35;
      const dissolvedOxygen = Math.max(5.2, 10.8 - month * 0.23 + ((index % 5) - 2) * 0.08);

      rows.push(normalizeEnvironmentalRow({
        station_id: `${region.code}${String(index + 1).padStart(2, '0')}`,
        station_name: `${region.name} Environmental Record ${index + 1}`,
        river_mile: riverMile,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        region: `Region ${region.number} - ${region.name}`,
        region_name: region.name,
        region_code: region.code,
        region_number: region.number,
        river_mile_range: region.river_mile_range,
        year,
        month,
        day,
        sample_date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        environmental_records: 1,
        mean_temperature_c: roundTo(temperature, 2),
        mean_salinity_psu: roundTo(salinity, 2),
        mean_dissolved_oxygen_mg_l: roundTo(dissolvedOxygen, 2),
        mean_turbidity_ntu: roundTo(5 + (riverMile / 152) * 10 + (index % 6) * 0.9, 2),
        mean_chlorophyll_a: roundTo(2.5 + month * 0.28 + (index % 4) * 0.35, 2)
      }));
    }
  });

  return rows;
}

function demoCoordinateForRiverMile(riverMile, index) {
  const base = interpolateHudsonCenterline(riverMile);
  const side = index % 2 === 0 ? -1 : 1;
  const spread = 0.014 + (index % 3) * 0.004;
  return {
    latitude: roundTo(base.latitude + ((index % 5) - 2) * 0.0012, 5),
    longitude: roundTo(base.longitude + side * spread, 5)
  };
}

function meanRelativeAbundanceForRows(rows) {
  const values = rows.map((row) => asNumberOrNull(row.mean_relative_abundance)).filter(Number.isFinite);
  if (!values.length) return 0;
  return roundTo(average(values), 2);
}

function normalizeEnvironmentalRow(row) {
  const region = resolveHudsonRegion(row);
  const base = {
    ...row,
    year: Number(row.year),
    month: Number(row.month),
    day: Number(row.day || dayOfMonth(row.sample_date)),
    river_mile: Number(row.river_mile),
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    environmental_records: Number(row.environmental_records || 1),
    mean_temperature_c: asNumberOrNull(row.mean_temperature_c),
    mean_salinity_psu: asNumberOrNull(row.mean_salinity_psu),
    mean_dissolved_oxygen_mg_l: asNumberOrNull(row.mean_dissolved_oxygen_mg_l),
    region: region ? `Region ${region.number} - ${region.name}` : row.region || 'Unassigned',
    region_name: region ? region.name : row.region || 'Unassigned',
    region_code: row.region_code || (region ? region.code : ''),
    region_number: region ? region.number : asNumberOrNull(row.region_number),
    river_mile_range: row.river_mile_range || (region ? region.river_mile_range : '')
  };

  return {
    ...base,
    ...deriveEnvironmentalCovariates(base)
  };
}

function deriveEnvironmentalCovariates(row) {
  const riverMile = Number(row.river_mile) || 0;
  const month = Number(row.month) || 6;
  const salinity = asNumberOrNull(row.mean_salinity_psu) ?? Math.max(0, 12 - riverMile * 0.08);
  const temperature = asNumberOrNull(row.mean_temperature_c) ?? 14 + month * 0.8;
  const dissolvedOxygen = asNumberOrNull(row.mean_dissolved_oxygen_mg_l) ?? Math.max(5, 10.5 - month * 0.25);
  const depth = asNumberOrNull(row.sampling_depth_m) ?? Math.max(1.2, 12 - riverMile * 0.045);
  const conductivity = asNumberOrNull(row.mean_conductivity_us_cm) ?? Math.round(250 + salinity * 1450 + riverMile * 1.8);

  return {
    mean_temperature_c: temperature,
    mean_salinity_psu: salinity,
    mean_dissolved_oxygen_mg_l: dissolvedOxygen,
    mean_conductivity_us_cm: conductivity,
    sampling_depth_m: depth,
    usgs_discharge_cfs: asNumberOrNull(row.usgs_discharge_cfs) ?? Math.round(4200 + riverMile * 65 + month * 180),
    usgs_tide_stage_m: asNumberOrNull(row.usgs_tide_stage_m) ?? roundTo(0.35 + Math.sin(month + riverMile / 30) * 0.45, 2),
    usgs_gage_height_ft: asNumberOrNull(row.usgs_gage_height_ft) ?? roundTo(2.5 + riverMile * 0.018 + month * 0.05, 2),
    usgs_salt_front_river_mile: asNumberOrNull(row.usgs_salt_front_river_mile) ?? roundTo(Math.max(0, 65 - month * 2.2 + salinity * 1.8), 1),
    usgs_specific_conductance_us_cm: asNumberOrNull(row.usgs_specific_conductance_us_cm) ?? Math.round(conductivity * 1.04),
    usgs_freshwater_inflow_cfs: asNumberOrNull(row.usgs_freshwater_inflow_cfs) ?? Math.round(5200 + riverMile * 48 + (13 - month) * 210),
    epa_nutrients_index: asNumberOrNull(row.epa_nutrients_index) ?? roundTo(0.28 + month * 0.025 + riverMile * 0.0015, 2),
    epa_ph: asNumberOrNull(row.epa_ph) ?? roundTo(7.1 + Math.cos(month / 2) * 0.25, 2),
    epa_turbidity_ntu: asNumberOrNull(row.epa_turbidity_ntu) ?? roundTo(7 + month * 0.7 + Math.max(0, 80 - riverMile) * 0.04, 2),
    epa_bacteria_cfu_100ml: asNumberOrNull(row.epa_bacteria_cfu_100ml) ?? Math.round(35 + month * 8 + Math.max(0, 50 - riverMile) * 1.4),
    epa_metals_index: asNumberOrNull(row.epa_metals_index) ?? roundTo(0.18 + Math.max(0, 100 - riverMile) * 0.003, 2),
    epa_pcb_pfas_index: asNumberOrNull(row.epa_pcb_pfas_index) ?? roundTo(0.12 + Math.max(0, 70 - riverMile) * 0.004, 2),
    epa_contaminants_index: asNumberOrNull(row.epa_contaminants_index) ?? roundTo(0.16 + Math.max(0, 90 - riverMile) * 0.0035, 2),
    noaa_water_level_m: asNumberOrNull(row.noaa_water_level_m) ?? roundTo(0.4 + Math.sin(month + riverMile / 20) * 0.35, 2),
    noaa_tide_stage_m: asNumberOrNull(row.noaa_tide_stage_m) ?? roundTo(0.45 + Math.cos(month + riverMile / 25) * 0.4, 2),
    noaa_current_speed_ms: asNumberOrNull(row.noaa_current_speed_ms) ?? roundTo(0.2 + salinity * 0.025 + month * 0.01, 2),
    noaa_wind_speed_ms: asNumberOrNull(row.noaa_wind_speed_ms) ?? roundTo(2.5 + month * 0.18, 2),
    noaa_air_temperature_c: asNumberOrNull(row.noaa_air_temperature_c) ?? roundTo(temperature + 1.4, 2),
    noaa_water_temperature_c: asNumberOrNull(row.noaa_water_temperature_c) ?? temperature,
    noaa_salinity_psu: asNumberOrNull(row.noaa_salinity_psu) ?? salinity,
    noaa_conductivity_us_cm: asNumberOrNull(row.noaa_conductivity_us_cm) ?? conductivity,
    noaa_air_pressure_hpa: asNumberOrNull(row.noaa_air_pressure_hpa) ?? roundTo(1013 - month * 0.6 + riverMile * 0.01, 1)
  };
}

function normalizeEventRow(row) {
  return {
    ...row,
    year: Number(row.year),
    month: Number(row.month),
    day: Number(row.day || dayOfMonth(row.sample_date))
  };
}

function normalizeCatalogRecord(row) {
  return {
    ...row,
    catalog_id: row.catalog_id || 'IMG-PENDING',
    highlight_rank: Number(row.highlight_rank || highlightRank(row.species_common)),
    species_common: row.species_common || row.common_name || row.category || 'Unspecified species',
    species_scientific: row.species_scientific || row.scientific_name || 'Scientific name pending',
    image_type: row.image_type || row.category || 'Image record',
    image_count: Number(row.image_count || row.count || 1),
    is_key_species: row.is_key_species === true || highlightRank(row.species_common || row.common_name) !== 999,
    year: Number(row.year),
    month: Number(row.month),
    day: Number(row.day || dayOfMonth(row.sample_date)),
    river_mile: Number(row.river_mile),
    station_id: row.station_id || 'Station pending',
    station_name: row.station_name || 'Station metadata pending',
    region: row.region || 'Unassigned',
    life_stage: row.life_stage || 'Life Stage Pending',
    gear_type: row.gear_type || 'Gear Pending',
    image_url: row.image_url || '',
    source_url: row.source_url || 'https://you.stonybrook.edu/hrbmp/database/species-highlights/',
    description: row.description || 'Prototype image catalog metadata.'
  };
}

function aggregateByStation(rows) {
  return Array.from(groupBy(rows, 'station_id').entries()).map(([stationId, stationRows]) => {
    const base = stationRows[0];
    const species = uniqueSorted(stationRows.map((row) => row.common_name || row.scientific_name || 'Unspecified'));
    const samplingEvents = sum(stationRows, 'sampling_events');
    const totalAbundance = sum(stationRows, 'total_abundance');
    const meanRelativeAbundance = meanRelativeAbundanceForRows(stationRows);
    return {
      ...base,
      station_id: stationId,
      common_name: species.length === 1 ? species[0] : `${species.length} species`,
      sampling_events: samplingEvents,
      biological_records: sum(stationRows, 'biological_records'),
      environmental_records: sum(stationRows, 'environmental_records'),
      total_abundance: totalAbundance,
      mean_relative_abundance: meanRelativeAbundance,
      mean_temperature_c: average(stationRows.map((row) => row.mean_temperature_c).filter(Number.isFinite)),
      mean_salinity_psu: average(stationRows.map((row) => row.mean_salinity_psu).filter(Number.isFinite)),
      mean_dissolved_oxygen_mg_l: average(stationRows.map((row) => row.mean_dissolved_oxygen_mg_l).filter(Number.isFinite))
    };
  });
}

function aggregateByRegion(rows, valueKey) {
  return Array.from(groupBy(rows, 'region').entries()).map(([region, regionRows]) => {
    const coordinates = regionRows.filter(hasCoordinates);
    return {
      region,
      latitude: average(coordinates.map((row) => row.latitude)),
      longitude: average(coordinates.map((row) => row.longitude)),
      value: sum(regionRows, valueKey),
      stations: uniqueCount(regionRows, 'station_id'),
      events: sum(regionRows, 'sampling_events') || sum(regionRows, 'environmental_records')
    };
  }).filter(hasCoordinates);
}

function popupHtml(row, type, options = {}) {
  if (type === 'biological-record' || type === 'biological-site') {
    return `
      <h3>${escapeHtml(row.station_id)} - ${escapeHtml(row.station_name)}</h3>
      <dl>
        <dt>Region</dt><dd>${escapeHtml(row.region)}</dd>
        <dt>River mile</dt><dd>${formatNumber(row.river_mile)}</dd>
        <dt>Period</dt><dd>${formatPeriod(row)}</dd>
        <dt>Species</dt><dd>${escapeHtml(row.common_name || row.scientific_name || 'Unspecified')}</dd>
        <dt>Gear</dt><dd>${escapeHtml(row.gear_type)}</dd>
        <dt>Records</dt><dd>${formatNumber(row.biological_records)}</dd>
      </dl>
    `;
  }

  const variable = options.variable || 'mean_temperature_c';
  const variableMeta = options.variableMeta || ENV_VARIABLES.mean_temperature_c;
  return `
    <h3>${escapeHtml(row.station_id)} - ${escapeHtml(row.station_name)}</h3>
    <dl>
      <dt>Region</dt><dd>${escapeHtml(row.region)}</dd>
      <dt>River mile</dt><dd>${formatNumber(row.river_mile)}</dd>
      <dt>Period</dt><dd>${formatPeriod(row)}</dd>
      <dt>Records</dt><dd>${formatNumber(row.environmental_records)}</dd>
      <dt>${escapeHtml(variableMeta.label)}</dt><dd>${formatMetric(row[variable], variableMeta.unit)}</dd>
    </dl>
  `;
}

function selectedText(row, type, options = {}) {
  if (type.startsWith('biological')) {
    const species = row.common_name || row.scientific_name || 'Unspecified';
    return `${row.station_id} - ${row.station_name}: ${species}; ${formatNumber(row.biological_records)} biological record(s).`;
  }

  const variable = options.variable || 'mean_temperature_c';
  const variableMeta = options.variableMeta || ENV_VARIABLES.mean_temperature_c;
  return `${row.station_id} - ${row.station_name}: ${formatNumber(row.environmental_records)} environmental record(s); ${variableMeta.label} ${formatMetric(row[variable], variableMeta.unit)}.`;
}

function filterRows(rows, filters) {
  const search = (filters.search || '').trim().toLowerCase();

  return rows.filter((row) => {
    if (filters.region && filters.region !== 'all' && row.region !== filters.region) return false;
    if (filters.year && filters.year !== 'all' && String(row.year) !== String(filters.year)) return false;
    if (filters.month && filters.month !== 'all' && String(row.month) !== String(filters.month)) return false;
    if (filters.day && filters.day !== 'all' && String(row.day) !== String(filters.day)) return false;
    if (filters.species && filters.species !== 'all') {
      const speciesName = row.common_name || row.scientific_name || 'Unspecified';
      if (speciesName.toLowerCase() !== filters.species.toLowerCase()) return false;
    }
    if (filters.lifeStage && filters.lifeStage !== 'all' && row.life_stage !== filters.lifeStage) return false;
    if (filters.program && filters.program !== 'all' && row.monitoring_program !== filters.program) return false;
    if (!withinRange(row.year, filters.yearStart, filters.yearEnd)) return false;
    if (!withinRange(row.month, filters.monthStart, filters.monthEnd)) return false;
    if (!withinRange(row.day, filters.dayStart, filters.dayEnd)) return false;

    if (search) {
      const haystack = [
        row.station_id,
        row.station_name,
        row.region,
        row.common_name,
        row.scientific_name,
        row.gear_type,
        row.life_stage,
        row.monitoring_program,
        row.environmental_records,
        row.mean_temperature_c,
        row.mean_dissolved_oxygen_mg_l,
        row.mean_conductivity_us_cm,
        row.mean_salinity_psu,
        row.year,
        row.month,
        row.day
      ].join(' ').toLowerCase();
      if (!haystack.includes(search)) return false;
    }

    return true;
  });
}

function filterCatalogRows(rows, filters) {
  return rows.filter((row) => {
    if (filters.species && filters.species !== 'all' && row.species_common !== filters.species) return false;
    if (filters.imageType && filters.imageType !== 'all' && row.image_type !== filters.imageType) return false;
    return true;
  });
}

function compareCatalogRecords(a, b) {
  return a.highlight_rank - b.highlight_rank
    || String(a.species_common).localeCompare(String(b.species_common))
    || lifeStageRank(a.life_stage) - lifeStageRank(b.life_stage)
    || a.year - b.year
    || a.month - b.month
    || a.day - b.day
    || String(a.catalog_id).localeCompare(String(b.catalog_id));
}

function renderSummaryStrip(id, items) {
  const container = document.getElementById(id);
  if (!container) return;
  renderSummaryItems(container, items);
}

function renderMapStats(id, items) {
  const container = document.getElementById(id);
  if (!container) return;
  renderSummaryItems(container, items);
}

function renderSummaryItems(container, items) {
  container.replaceChildren();
  items.forEach(([label, value]) => {
    const article = document.createElement('article');
    const labelEl = document.createElement('span');
    const valueEl = document.createElement('strong');
    labelEl.textContent = label;
    valueEl.textContent = typeof value === 'string' ? value : formatNumber(value);
    article.append(labelEl, valueEl);
    container.appendChild(article);
  });
}

function renderMetricCards(container, items) {
  container.replaceChildren();
  items.forEach(([label, value]) => {
    const card = document.createElement('article');
    card.className = 'metric-card';
    const labelEl = document.createElement('span');
    const valueEl = document.createElement('strong');
    labelEl.textContent = label;
    valueEl.textContent = value;
    card.append(labelEl, valueEl);
    container.appendChild(card);
  });
}

function appendCell(row, value) {
  const cell = document.createElement('td');
  cell.textContent = value ?? 'NA';
  row.appendChild(cell);
}

function appendMetaItem(list, term, value) {
  const dt = document.createElement('dt');
  dt.textContent = term;
  const dd = document.createElement('dd');
  dd.textContent = value ?? 'NA';
  list.append(dt, dd);
}

function appendEmptyRow(body, colspan, message) {
  const tr = document.createElement('tr');
  tr.className = 'empty-row';
  const td = document.createElement('td');
  td.colSpan = colspan;
  td.textContent = message;
  tr.appendChild(td);
  body.appendChild(tr);
}

function checked(id) {
  const element = document.getElementById(id);
  return element ? element.checked : true;
}

function valueOf(id) {
  const element = document.getElementById(id);
  return element ? element.value : 'all';
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value ?? '';
}

function isActiveTab(id) {
  const page = document.querySelector(`[data-tab-page="${id}"]`);
  return Boolean(page && page.classList.contains('active'));
}

function hasCoordinates(row) {
  return Number.isFinite(Number(row.latitude)) && Number.isFinite(Number(row.longitude));
}

function uniqueSorted(values, numeric = false) {
  const cleaned = values.filter((value) => value !== undefined && value !== null && value !== '' && !Number.isNaN(value));
  const unique = Array.from(new Set(cleaned.map((value) => String(value))));
  return unique.sort((a, b) => numeric ? Number(a) - Number(b) : a.localeCompare(b));
}

function sortHighlightSpecies(values) {
  return values.slice().sort((a, b) => {
    const aRank = highlightRank(a);
    const bRank = highlightRank(b);
    return aRank - bRank || a.localeCompare(b);
  });
}

function highlightRank(speciesName) {
  const index = HIGHLIGHT_SPECIES_ORDER.findIndex((name) => name.toLowerCase() === String(speciesName || '').toLowerCase());
  return index === -1 ? 999 : index + 1;
}

function speciesCode(speciesName) {
  return String(speciesName || 'SP')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 6) || 'SP';
}

function allSpeciesIndex(speciesName) {
  const index = ALL_SPECIES_NAMES.findIndex((name) => name.toLowerCase() === String(speciesName || '').toLowerCase());
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function scrollToElementWithOffset(id, offset = 80) {
  const element = document.getElementById(id);
  if (!element) return;

  const top = element.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

function lifeStageRank(lifeStage) {
  const index = CATALOG_LIFE_STAGE_DISTRIBUTION.findIndex((stage) => stage.life_stage === lifeStage);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function sortLifeStages(values) {
  return uniqueSorted(values).sort((a, b) => lifeStageRank(a) - lifeStageRank(b) || a.localeCompare(b));
}

function sortImageTypes(values) {
  return uniqueSorted(values).sort((a, b) => imageTypeRank(a) - imageTypeRank(b) || a.localeCompare(b));
}

function imageTypeRank(imageType) {
  const index = CATALOG_LIFE_STAGE_DISTRIBUTION.findIndex((stage) => stage.image_type === imageType);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function uniqueCount(rows, key) {
  return new Set(rows.map((row) => row[key]).filter(Boolean)).size;
}

function sum(rows, key) {
  return rows.reduce((total, row) => total + (Number(row[key]) || 0), 0);
}

function average(values) {
  const numeric = values.map(Number).filter(Number.isFinite);
  if (!numeric.length) return 0;
  return numeric.reduce((total, value) => total + value, 0) / numeric.length;
}

function groupBy(rows, key) {
  return rows.reduce((map, row) => {
    const groupKey = (typeof key === 'function' ? key(row) : row[key]) ?? 'Unassigned';
    if (!map.has(groupKey)) map.set(groupKey, []);
    map.get(groupKey).push(row);
    return map;
  }, new Map());
}

function withinRange(value, start, end) {
  const numeric = Number(value);
  let startValue = start && start !== 'all' ? Number(start) : null;
  let endValue = end && end !== 'all' ? Number(end) : null;
  if (Number.isFinite(startValue) && Number.isFinite(endValue) && startValue > endValue) {
    const tmp = startValue;
    startValue = endValue;
    endValue = tmp;
  }
  if (!Number.isFinite(numeric)) return false;
  if (Number.isFinite(startValue) && numeric < startValue) return false;
  if (Number.isFinite(endValue) && numeric > endValue) return false;
  return true;
}

function monthOption(value) {
  return {
    value: String(value),
    label: monthName(Number(value))
  };
}

function monthName(value) {
  const index = Number(value) - 1;
  return MONTH_NAMES[index] || 'Unknown';
}

function formatPeriod(row) {
  const day = Number.isFinite(Number(row.day)) ? ` ${row.day}` : '';
  return `${monthName(row.month)}${day}, ${row.year}`;
}

function formatDateParts(row) {
  if (row.sample_date) return row.sample_date;
  if (!Number.isFinite(Number(row.year))) return 'Date pending';
  const month = Number.isFinite(Number(row.month)) ? monthName(row.month) : 'Month pending';
  const day = Number.isFinite(Number(row.day)) ? ` ${row.day}` : '';
  return `${month}${day}, ${row.year}`;
}

function formatCatalogDateRange(rows) {
  const dates = rows
    .map((row) => new Date(`${row.year}-${String(row.month).padStart(2, '0')}-${String(row.day).padStart(2, '0')}T00:00:00`))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a - b);

  if (dates.length === 0) return 'Date pending';

  const start = dates[0];
  const end = dates[dates.length - 1];
  const format = (date) => `${monthName(date.getMonth() + 1)} ${date.getDate()}, ${date.getFullYear()}`;
  return start.getTime() === end.getTime() ? format(start) : `${format(start)} to ${format(end)}`;
}

function formatNumber(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return value ?? 'NA';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(numeric);
}

function formatTimestamp(value) {
  if (!value) return 'Date pending';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function shortNumber(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 'NA';
  if (Math.abs(numeric) >= 1000) return `${Math.round(numeric / 1000)}k`;
  return String(Math.round(numeric));
}

function formatMetric(value, unit) {
  if (value === null || value === undefined || value === '') return 'NA';
  if (unit === 'value') return formatNumber(value);
  return `${formatNumber(value)} ${unit}`;
}

function asNumberOrNull(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function roundTo(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(Number(value) * factor) / factor;
}

function scaleValue(value, min, max, outMin, outMax) {
  if (!Number.isFinite(value) || max <= min) return (outMin + outMax) / 2;
  const pct = (value - min) / (max - min);
  return outMin + pct * (outMax - outMin);
}

function colorForValue(value, min, max, colors) {
  if (!Number.isFinite(value) || max <= min) return colors[1];
  const pct = (value - min) / (max - min);
  if (pct < 0.34) return colors[0];
  if (pct < 0.67) return colors[1];
  return colors[2];
}

function dayOfMonth(dateString) {
  if (!dateString) return null;
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.getDate();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
