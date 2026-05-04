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

const DATA_VERSION = 'home-partner-logos-20260504';

const BIOLOGICAL_MONITORING_PROGRAMS = [
  'Long River Survey',
  'Fall Juvenile Survey',
  'Beach Seine Survey'
];

const HUDSON_BOUNDS = [
  [40.45, -74.35],
  [42.95, -73.35]
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

const state = {
  ready: false,
  data: null,
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
  legends: {
    biological: null,
    environmental: null
  },
  selectedEnvSource: 'hrbmp',
  selectedCatalogSpecies: null,
  selectedCatalogLifeStage: null
};

document.addEventListener('DOMContentLoaded', () => {
  initTabs();

  Promise.all([
    loadJson(`./data/example_summary.json?v=${DATA_VERSION}`, FALLBACK_DATA),
    loadJson(`./data/biological_availability.geojson?v=${DATA_VERSION}`, null),
    loadJson(`./data/environmental_availability.geojson?v=${DATA_VERSION}`, null)
  ])
    .then(([summary, biologicalGeoJson, environmentalGeoJson]) => {
      state.data = hydrateData(summary, biologicalGeoJson, environmentalGeoJson);
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

  function showTab(tabId, updateHash = true) {
    const nextId = pageIds.has(tabId) ? tabId : 'home';

    pages.forEach((page) => {
      page.classList.toggle('active', page.dataset.tabPage === nextId);
    });

    links.forEach((link) => {
      link.classList.toggle('active', link.dataset.tabLink === nextId);
    });

    if (updateHash && window.location.hash !== `#${nextId}`) {
      window.history.pushState(null, '', `#${nextId}`);
    }

    window.dispatchEvent(new CustomEvent('hrbmp-tab-change', { detail: { tabId: nextId } }));
  }

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showTab(link.dataset.tabLink);
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
  next.environmental_availability = next.environmental_availability.map(normalizeEnvironmentalRow);
  next.sampling_events = next.sampling_events.map(normalizeEventRow);
  next.sampling_image_catalog = next.sampling_image_catalog.map(normalizeCatalogRecord);

  return next;
}

function renderAll() {
  fillCounts();
  populateFilters();
  renderInquiry();
  renderBiologicalMap();
  renderEnvironmental();
  renderCatalog();
}

function bindControls() {
  [
    'inquiry-region',
    'inquiry-year',
    'inquiry-month',
    'inquiry-search',
    'bio-species',
    'bio-life-stage',
    'bio-program',
    'bio-year-start',
    'bio-year-end',
    'bio-month-start',
    'bio-month-end',
    'bio-day-start',
    'bio-day-end',
    'layer-sites',
    'layer-records',
    'layer-regions'
  ].forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;
    const eventName = element.tagName === 'INPUT' && element.type === 'search' ? 'input' : 'change';
    element.addEventListener(eventName, () => {
      renderInquiry();
      renderBiologicalMap();
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
    'env-layer-sites',
    'env-layer-values',
    'env-layer-regions'
  ].forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.addEventListener('change', () => {
      if (id === 'env-variable') renderEnvironmentalSourcePanel();
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
}

function fillCounts() {
  const counts = state.data.counts || {};
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
  const bioRegions = uniqueSorted(state.biologicalRows.map((row) => row.region));
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

  populateSelect('inquiry-region', bioRegions, 'All Regions');
  populateSelect('inquiry-year', bioYears, 'All Years');
  populateSelect('inquiry-month', bioMonths.map(monthOption), 'All Months');
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

function renderInquiry() {
  const rows = filterRows(state.biologicalRows, {
    region: valueOf('inquiry-region'),
    year: valueOf('inquiry-year'),
    month: valueOf('inquiry-month'),
    search: valueOf('inquiry-search')
  });

  renderSummaryStrip('inquiry-summary', [
    ['Stations', uniqueCount(rows, 'station_id')],
    ['Events', sum(rows, 'sampling_events')],
    ['Biological Records', sum(rows, 'biological_records')],
    ['Total Abundance', sum(rows, 'total_abundance')]
  ]);

  const body = document.getElementById('inquiry-body');
  if (!body) return;
  body.replaceChildren();

  if (rows.length === 0) {
    appendEmptyRow(body, 8, 'No records match the selected filters.');
    return;
  }

  rows
    .slice()
    .sort((a, b) => a.year - b.year || a.month - b.month || b.river_mile - a.river_mile)
    .forEach((row) => {
      const tr = document.createElement('tr');
      [
        `${row.station_id} - ${row.station_name}`,
        row.region,
        row.year,
        monthName(row.month),
        row.gear_type,
        row.sampling_events,
        row.biological_records,
        formatNumber(row.total_abundance)
      ].forEach((value) => appendCell(tr, value));
      body.appendChild(tr);
    });
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
    ['Visible Sites', uniqueCount(rows, 'station_id')],
    ['Sampling Events', sum(rows, 'sampling_events')],
    ['Biological Records', sum(rows, 'biological_records')],
    ['Total Abundance', sum(rows, 'total_abundance')],
    ['Species Shown', valueOf('bio-species') === 'all' ? 'All Species' : valueOf('bio-species')],
    ['Life Stage', valueOf('bio-life-stage') === 'all' ? 'All Stages' : valueOf('bio-life-stage')],
    ['Program', valueOf('bio-program') === 'all' ? 'All Programs' : valueOf('bio-program')]
  ]);

  if (!isActiveTab('biological-database')) return;

  const map = ensureLeafletMap('bio-map', 'biological');
  if (!map) return;

  clearMapLayers('biological');

  if (checked('layer-regions')) {
    addRegionLayer(map, 'biological', rows, {
      valueKey: 'biological_records',
      label: 'Biological Records',
      color: '#bd7a1e'
    });
  }

  if (checked('layer-sites')) {
    addSiteLayer(map, 'biological', rows, {
      color: '#173330',
      popupType: 'biological-site'
    });
  }

  if (checked('layer-records')) {
    addClusterLayer(map, 'biological', rows, {
      clusterClass: 'map-cluster',
      markerType: 'biological',
      valueKey: 'biological_records',
      popupType: 'biological-record'
    });
  }

  setText('bio-selected', rows.length ? 'Use the map to inspect stations, events, and clusters.' : 'No records match the selected filters.');
  updateLegend('biological', '<strong>Biological Map</strong><div><span class="legend-swatch" style="background:#1e8f84"></span>Records</div><div><span class="legend-swatch" style="background:#173330"></span>Sites</div><div><span class="legend-swatch" style="background:#bd7a1e"></span>Area Totals</div>');
  fitRows(map, rows);
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
    ['Visible Sites', uniqueCount(rows, 'station_id')],
    ['Environmental Records', sum(rows, 'environmental_records')],
    ['Mean Selected Covariate', variableValues.length ? formatMetric(average(variableValues), variableMeta.unit) : 'NA'],
    ['Covariate Source', sourceMeta.label]
  ]);

  if (!isActiveTab('environmental-database')) return;

  const map = ensureLeafletMap('env-map', 'environmental');
  if (!map) return;

  clearMapLayers('environmental');

  if (checked('env-layer-regions')) {
    addRegionLayer(map, 'environmental', rows, {
      valueKey: 'environmental_records',
      label: 'Environmental Records',
      color: '#2f6f9f'
    });
  }

  if (checked('env-layer-sites')) {
    addSiteLayer(map, 'environmental', rows, {
      color: '#173330',
      popupType: 'environmental-site',
      variable,
      variableMeta
    });
  }

  if (checked('env-layer-values')) {
    addClusterLayer(map, 'environmental', rows, {
      clusterClass: 'map-cluster environmental',
      markerType: 'environmental',
      valueKey: variable,
      variable,
      variableMeta,
      popupType: 'environmental-record'
    });
  }

  setText('env-selected', rows.length ? `Environmental map styled by ${variableMeta.label.toLowerCase()} from ${sourceMeta.label}.` : 'No environmental records match the selected filters.');
  updateLegend('environmental', `<strong>${variableMeta.label}</strong><div><span class="legend-swatch" style="background:${variableMeta.colors[0]}"></span>Lower</div><div><span class="legend-swatch" style="background:${variableMeta.colors[1]}"></span>Middle</div><div><span class="legend-swatch" style="background:${variableMeta.colors[2]}"></span>Higher</div>`);
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
    state.maps[key].invalidateSize();
    return state.maps[key];
  }

  const map = L.map(containerId, {
    center: [41.55, -73.92],
    zoom: 7,
    minZoom: 6,
    maxZoom: 15,
    scrollWheelZoom: true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  L.control.scale({ imperial: true, metric: true }).addTo(map);
  map.fitBounds(HUDSON_BOUNDS, { padding: [24, 24] });
  state.maps[key] = map;

  return map;
}

function addClusterLayer(map, mapKey, rows, options) {
  const values = rows.map((row) => Number(row[options.valueKey])).filter(Number.isFinite);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const layer = createMarkerGroup(options.clusterClass);

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
      radius: 7,
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

function createMarkerGroup(clusterClass) {
  if (window.L && L.markerClusterGroup) {
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
  const rows = state.data.annual_total_abundance || [];
  if (!container) return;
  renderBars(container, rows, 'year', 'total_abundance');
}

function renderTaxaChart() {
  const container = document.getElementById('taxa-chart');
  const rows = state.data.taxa_totals || [];
  if (!container) return;
  renderBars(container, rows, 'common_name', 'total_abundance');
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
  return {
    ...row,
    year: Number(row.year),
    month: Number(row.month),
    day: Number(row.day || dayOfMonth(row.sample_date)),
    river_mile: Number(row.river_mile),
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    sampling_events: Number(row.sampling_events || 0),
    biological_records: Number(row.biological_records || 0),
    total_abundance: Number(row.total_abundance || 0),
    region: row.region || 'Unassigned',
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

function normalizeEnvironmentalRow(row) {
  const base = {
    ...row,
    year: Number(row.year),
    month: Number(row.month),
    day: Number(row.day || dayOfMonth(row.sample_date)),
    river_mile: Number(row.river_mile),
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    environmental_records: Number(row.environmental_records || 0),
    mean_temperature_c: asNumberOrNull(row.mean_temperature_c),
    mean_salinity_psu: asNumberOrNull(row.mean_salinity_psu),
    mean_dissolved_oxygen_mg_l: asNumberOrNull(row.mean_dissolved_oxygen_mg_l),
    region: row.region || 'Unassigned'
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
    return {
      ...base,
      station_id: stationId,
      common_name: species.length === 1 ? species[0] : `${species.length} species`,
      sampling_events: sum(stationRows, 'sampling_events'),
      biological_records: sum(stationRows, 'biological_records'),
      environmental_records: sum(stationRows, 'environmental_records'),
      total_abundance: sum(stationRows, 'total_abundance'),
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
        <dt>Abundance</dt><dd>${formatNumber(row.total_abundance)}</dd>
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
    return `${row.station_id} - ${row.station_name}: ${species}; ${formatNumber(row.biological_records)} biological record(s), ${formatNumber(row.total_abundance)} total abundance.`;
  }

  const variable = options.variable || 'mean_temperature_c';
  const variableMeta = options.variableMeta || ENV_VARIABLES.mean_temperature_c;
  return `${row.station_id} - ${row.station_name}: ${variableMeta.label} ${formatMetric(row[variable], variableMeta.unit)}.`;
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
    const groupKey = row[key] || 'Unassigned';
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
