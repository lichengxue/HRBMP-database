-- Example analysis queries for the HRBMP prototype database.

-- 1) Row counts by table.
SELECT 'stations' AS table_name, COUNT(*) AS n FROM stations
UNION ALL SELECT 'sampling_events', COUNT(*) FROM sampling_events
UNION ALL SELECT 'taxa', COUNT(*) FROM taxa
UNION ALL SELECT 'observations', COUNT(*) FROM observations
UNION ALL SELECT 'environmental_observations', COUNT(*) FROM environmental_observations;

-- 2) Annual total abundance.
SELECT se.year, SUM(o.abundance) AS total_abundance
FROM observations o
JOIN sampling_events se ON se.event_id = o.event_id
GROUP BY se.year
ORDER BY se.year;

-- 3) Taxa totals.
SELECT t.scientific_name, t.common_name, SUM(o.abundance) AS total_abundance
FROM observations o
JOIN taxa t ON t.taxon_id = o.taxon_id
GROUP BY t.taxon_id, t.scientific_name, t.common_name
ORDER BY total_abundance DESC;
