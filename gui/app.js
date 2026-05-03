async function loadSummary() {
  const response = await fetch('./data/example_summary.json');
  if (!response.ok) throw new Error('Failed to load summary JSON');
  return response.json();
}

function fillCounts(counts) {
  document.getElementById('count-stations').textContent = counts.stations;
  document.getElementById('count-events').textContent = counts.sampling_events;
  document.getElementById('count-taxa').textContent = counts.taxa;
  document.getElementById('count-observations').textContent = counts.observations;
}

function renderTableRows(elementId, rows) {
  const tbody = document.getElementById(elementId);
  tbody.innerHTML = rows.join('');
}

loadSummary()
  .then((data) => {
    fillCounts(data.counts);

    renderTableRows('stations-body', data.stations.map(s =>
      `<tr><td>${s.station_id}</td><td>${s.station_name}</td><td>${s.river_mile}</td><td>${s.region}</td><td>${s.latitude}</td><td>${s.longitude}</td></tr>`
    ));

    renderTableRows('annual-body', data.annual_total_abundance.map(a =>
      `<tr><td>${a.year}</td><td>${a.total_abundance}</td></tr>`
    ));

    renderTableRows('taxa-body', data.taxa_totals.map(t =>
      `<tr><td>${t.taxon_id}</td><td><em>${t.scientific_name}</em></td><td>${t.common_name}</td><td>${t.taxonomic_group}</td><td>${t.total_abundance}</td></tr>`
    ));

    const env = data.environmental_summary[0] || {};
    const envList = document.getElementById('env-summary');
    envList.innerHTML = `
      <li>Mean temperature (°C): ${env.mean_temperature_c ?? 'NA'}</li>
      <li>Mean salinity (PSU): ${env.mean_salinity_psu ?? 'NA'}</li>
      <li>Mean dissolved oxygen (mg/L): ${env.mean_dissolved_oxygen_mg_l ?? 'NA'}</li>
      <li>Mean turbidity (NTU): ${env.mean_turbidity_ntu ?? 'NA'}</li>
      <li>Mean chlorophyll-a: ${env.mean_chlorophyll_a ?? 'NA'}</li>`;
  })
  .catch((error) => {
    console.error(error);
    alert('Could not load GUI data. Run R export script and/or serve via local web server.');
  });
