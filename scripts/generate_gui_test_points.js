const fs = require('fs');

const biologicalPath = 'gui/data/biological_availability.geojson';
const summaryPath = 'gui/data/example_summary.json';

const TOTAL_RECORDS = 100;
const regions = [
  { number: 0, name: 'Battery', code: 'BT', range: '0-11', minRm: 0, maxRm: 11 },
  { number: 1, name: 'Yonkers', code: 'YK', range: '12-23', minRm: 12, maxRm: 23 },
  { number: 2, name: 'Tappan Zee', code: 'TZ', range: '24-33', minRm: 24, maxRm: 33 },
  { number: 3, name: 'Croton-Haverstraw', code: 'CH', range: '34-38', minRm: 34, maxRm: 38 },
  { number: 4, name: 'Indian Point', code: 'IP', range: '39-46', minRm: 39, maxRm: 46 },
  { number: 5, name: 'West Point', code: 'WP', range: '47-55', minRm: 47, maxRm: 55 },
  { number: 6, name: 'Cornwall', code: 'CW', range: '56-61', minRm: 56, maxRm: 61 },
  { number: 7, name: 'Poughkeepsie', code: 'PK', range: '62-76', minRm: 62, maxRm: 76 },
  { number: 8, name: 'Hyde Park', code: 'HP', range: '77-85', minRm: 77, maxRm: 85 },
  { number: 9, name: 'Kingston', code: 'KG', range: '86-93', minRm: 86, maxRm: 93 },
  { number: 10, name: 'Saugerties', code: 'SG', range: '94-106', minRm: 94, maxRm: 106 },
  { number: 11, name: 'Catskill', code: 'CS', range: '107-124', minRm: 107, maxRm: 124 },
  { number: 12, name: 'Albany', code: 'AL', range: '125-152', minRm: 125, maxRm: 152 }
];

const centerline = [
  { rm: 0, lat: 40.55, lon: -74.03 },
  { rm: 11, lat: 40.72, lon: -74.00 },
  { rm: 23, lat: 40.94, lon: -73.90 },
  { rm: 33, lat: 41.10, lon: -73.87 },
  { rm: 38, lat: 41.20, lon: -73.91 },
  { rm: 46, lat: 41.31, lon: -73.95 },
  { rm: 55, lat: 41.41, lon: -73.96 },
  { rm: 61, lat: 41.47, lon: -74.01 },
  { rm: 76, lat: 41.70, lon: -73.94 },
  { rm: 85, lat: 41.84, lon: -73.95 },
  { rm: 93, lat: 41.93, lon: -73.96 },
  { rm: 106, lat: 42.08, lon: -73.93 },
  { rm: 124, lat: 42.26, lon: -73.80 },
  { rm: 152, lat: 42.65, lon: -73.75 }
];

const keySpecies = [
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

const lifeStages = [
  'Egg',
  'Yolk-Sac Larvae',
  'Post-Yolk-Sac Larvae',
  'Young Of The Year',
  'Yearling',
  'Adult'
];

const programs = ['Long River Survey', 'Fall Juvenile Survey', 'Beach Seine Survey'];
const gearByProgram = {
  'Long River Survey': 'Ichthyoplankton Net',
  'Fall Juvenile Survey': 'Beam Trawl',
  'Beach Seine Survey': 'Beach Seine'
};

const sampleWeights = [3, 14, 5, 11, 2, 9, 6, 17, 4, 8, 12, 1, 8];
let seed = 20260504;
function random() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
}

function allocate(total, weights) {
  const weightSum = weights.reduce((acc, weight) => acc + weight, 0);
  const counts = weights.map((weight) => Math.max(1, Math.floor((weight / weightSum) * total)));
  let remainder = total - counts.reduce((acc, count) => acc + count, 0);
  let index = counts.length - 1;
  while (remainder > 0) {
    counts[index] += 1;
    remainder -= 1;
    index = (index - 1 + counts.length) % counts.length;
  }
  while (remainder < 0) {
    if (counts[index] > 1) {
      counts[index] -= 1;
      remainder += 1;
    }
    index = (index - 1 + counts.length) % counts.length;
  }
  return counts;
}

function interpolateCenterline(riverMile) {
  for (let index = 0; index < centerline.length - 1; index += 1) {
    const start = centerline[index];
    const end = centerline[index + 1];
    if (riverMile >= start.rm && riverMile <= end.rm) {
      const t = (riverMile - start.rm) / (end.rm - start.rm);
      return {
        lat: start.lat + (end.lat - start.lat) * t,
        lon: start.lon + (end.lon - start.lon) * t
      };
    }
  }
  const last = centerline[centerline.length - 1];
  return { lat: last.lat, lon: last.lon };
}

function coordinateForRiverMile(riverMile, jitterScale = 0.012) {
  const base = interpolateCenterline(riverMile);
  return {
    lat: round(base.lat + (random() - 0.5) * jitterScale, 5),
    lon: round(base.lon + (random() - 0.5) * jitterScale, 5)
  };
}

function coordinateForRecord(riverMile, index) {
  const base = interpolateCenterline(riverMile);
  const side = index % 2 === 0 ? -1 : 1;
  const spread = 0.014 + (index % 3) * 0.004;
  return {
    lat: round(base.lat + (random() - 0.5) * 0.006, 5),
    lon: round(base.lon + side * spread + (random() - 0.5) * 0.006, 5)
  };
}

function round(value, digits = 4) {
  return Number(value.toFixed(digits));
}

function speciesCode(name) {
  return name.split(/\s+/).map((part) => part[0]).join('').slice(0, 4).toUpperCase();
}

function buildStations(stationAllocations) {
  return regions.flatMap((region, regionIndex) => {
    const count = stationAllocations[regionIndex];
    return Array.from({ length: count }, (_, stationIndex) => {
      const fraction = (stationIndex + 1) / (count + 1);
      const riverMile = round(region.minRm + fraction * (region.maxRm - region.minRm), 1);
      const coordinates = coordinateForRiverMile(riverMile, 0.009);
      return {
        station_id: `${region.code}${String(stationIndex + 1).padStart(2, '0')}`,
        station_name: `Region ${region.number} ${region.name} Station ${stationIndex + 1}`,
        river_mile: riverMile,
        latitude: coordinates.lat,
        longitude: coordinates.lon,
        region
      };
    });
  });
}

function sampleStationsForRegion(stations, regionNumber) {
  return stations.filter((station) => station.region.number === regionNumber);
}

function main() {
  const sampleAllocations = allocate(TOTAL_RECORDS, sampleWeights);
  const stations = buildStations(sampleAllocations);
  const features = [];

  regions.forEach((region, regionIndex) => {
    const regionStations = sampleStationsForRegion(stations, region.number);
    for (let index = 0; index < sampleAllocations[regionIndex]; index += 1) {
      const station = regionStations[index % regionStations.length];
      const species = keySpecies[(index + regionIndex * 3) % keySpecies.length];
      const lifeStage = lifeStages[(index + regionIndex) % lifeStages.length];
      const program = programs[(index + regionIndex) % programs.length];
      const year = 2010 + ((index + regionIndex * 2) % 15);
      const month = 1 + ((index + regionIndex * 3) % 12);
      const day = 1 + ((index * 5 + regionIndex) % 28);
      const eventCoordinates = coordinateForRecord(station.river_mile, index);
      const stageMultiplier = lifeStage === 'Egg' ? 4.5 : lifeStage === 'Adult' ? 1.7 : 3.1;

      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [eventCoordinates.lon, eventCoordinates.lat]
        },
        properties: {
          station_id: station.station_id,
          station_name: station.station_name,
          river_mile: station.river_mile,
          region: `Region ${region.number} - ${region.name}`,
          region_name: region.name,
          region_code: region.code,
          region_number: region.number,
          river_mile_range: region.range,
          year,
          month,
          day,
          gear_type: gearByProgram[program],
          program,
          taxon_id: `TX-${speciesCode(species[0])}`,
          scientific_name: species[1],
          common_name: species[0],
          taxonomic_group: 'Fish',
          life_stage: lifeStage,
          sampling_events: 1,
          biological_records: 1,
          mean_relative_abundance: round(0.05 + random() * stageMultiplier, 2),
          total_abundance: 0
        }
      });
    }
  });

  fs.writeFileSync(biologicalPath, JSON.stringify({ type: 'FeatureCollection', features }, null, 2));

  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
  summary.generated_at_utc = '2026-05-04 00:00:00 UTC';
  summary.counts = {
    ...(summary.counts || {}),
    stations: stations.length,
    sampling_events: features.length,
    taxa: keySpecies.length,
    observations: features.length
  };
  summary.annual_total_abundance = [];
  summary.taxa_totals = keySpecies.map(([commonName, scientificName]) => ({
    taxon_id: `TX-${speciesCode(commonName)}`,
    scientific_name: scientificName,
    common_name: commonName,
    taxonomic_group: 'Fish',
    biological_records: features.filter((feature) => feature.properties.common_name === commonName).length
  }));

  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

  console.log(JSON.stringify({
    biological_records: features.length,
    stations: stations.length,
    by_region: Object.fromEntries(regions.map((region, index) => [
      `Region ${region.number} - ${region.name}`,
      sampleAllocations[index]
    ]))
  }, null, 2));
}

main();
