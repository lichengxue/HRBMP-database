const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { calculateSurveyBudget, validateMatches } = require('../gui/education-activities.js');
const activities = JSON.parse(fs.readFileSync('gui/data/education_activities.json', 'utf8'));
const profiles = JSON.parse(fs.readFileSync('gui/data/fish_tales.json', 'utf8'));
const html = fs.readFileSync('gui/index.html', 'utf8');
const design = (changes = {}) => ({ objective: '1', schedule: 'spring-fall', gear: 'seine', repeats: 2,
  stations: { marsh: 0, lower: 2, mid: 3, upper: 0 }, measurements: ['temperature', 'habitat', 'maturity'], specimens: 3, ...changes });

test('survey charges field visits, gear repeats, station measurements and specimen assessments separately', () => {
  // Five stations, two visits: field 10,800; 20 seine hauls 10,000;
  // temperature 500; habitat once 750; 30 specimen assessments 4,500.
  const result = calculateSurveyBudget(design(), activities.survey);
  assert.equal(result.stations, 5);
  assert.equal(result.stationVisits, 10);
  assert.equal(result.total, 26550);
  assert.equal(result.remaining, 73450);
  assert.equal(result.lines.find(line => line.label === 'Habitat type').quantity, 5);
  assert.equal(result.lines.find(line => line.label === 'Sex and maturity').quantity, 30);
  const moreGear = calculateSurveyBudget(design({ repeats: 3 }), activities.survey);
  assert.equal(moreGear.total - result.total, 5000);
});

test('survey reports overspending, handles zero effort and rejects invalid effort', () => {
  const over = calculateSurveyBudget(design({ schedule: 'monthly', gear: 'trawl', repeats: 1, stations: { marsh: 0, lower: 20, mid: 0, upper: 0 }, measurements: [] }), activities.survey);
  assert.equal(over.total, 648000);
  assert.equal(over.remaining, -548000);
  assert.equal(calculateSurveyBudget(design({ stations: { marsh: 0, lower: 0, mid: 0, upper: 0 } }), activities.survey).total, 0);
  for (const bad of ['', -1, 1.5, Infinity, 101]) {
    assert.throws(() => calculateSurveyBudget(design({ stations: { marsh: bad, lower: 0, mid: 0, upper: 0 } }), activities.survey), RangeError);
  }
  assert.throws(() => calculateSurveyBudget(design({ repeats: 0 }), activities.survey), RangeError);
  assert.throws(() => calculateSurveyBudget(design({ specimens: '' }), activities.survey), RangeError);
});

test('matching requires five unique valid letters without inventing an answer key', () => {
  assert.equal(activities.matching.answer_key, null);
  const answers = Object.fromEntries(activities.matching.adults.map((adult, index) => [adult.id, 'ABCDE'[index]]));
  assert.equal(validateMatches(answers, activities.matching).valid, true);
  assert.equal(validateMatches({ ...answers, 'white-catfish': 'A' }, activities.matching).valid, false);
  assert.equal(validateMatches({ ...answers, 'white-catfish': '' }, activities.matching).valid, false);
  assert.equal(validateMatches({ ...answers, 'white-catfish': 'Z' }, activities.matching).valid, false);
});

test('each supplied species has a complete page and original image; credits are preserved where supplied', () => {
  assert.equal(profiles.profiles.length, 16);
  assert.equal(new Set(profiles.profiles.map(p => p.slug)).size, 16);
  assert.equal(profiles.profiles.filter(p => p.image.credit).length, 13);
  for (const p of profiles.profiles) {
    for (const key of ['appearance', 'biology', 'diet', 'ecosystem', 'monitoring', 'fact']) assert.ok(p.sections[key]?.length, `${p.slug}: ${key}`);
    const image = fs.readFileSync(path.join('gui', p.image.src));
    assert.equal(crypto.createHash('sha256').update(image).digest('hex'), p.image.sha256);
    assert.equal((html.match(new RegExp(`id="fish-tale-${p.slug}"`, 'g')) || []).length, 1);
    assert.ok(html.includes(`href="#fish-tale-${p.slug}" data-tab-link="fish-tale-${p.slug}"`));
  }
  assert.equal(html.includes('\ufffd'), false);
  assert.equal(html.includes('Space for HRBMP graph'), false);
  assert.equal(html.includes('Hudson River Range Map'), false);
});

test('activity images preserve the ten original document assets and both activities have direct entrances', () => {
  const images = [...activities.matching.adults, ...activities.matching.juveniles];
  assert.equal(images.length, 10);
  for (const item of images) {
    const bytes = fs.readFileSync(path.join('gui', item.image.path));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), item.image.sha256);
  }
  for (const id of ['activity-survey-design', 'activity-match-fish']) {
    assert.equal((html.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1);
    assert.ok(html.includes(`data-tab-link="${id}"`));
  }
  assert.equal(activities.survey.objectives.length, 5);
  assert.equal(activities.survey.source_slides.length, 19);
  assert.equal(activities.survey.discussion.length, 6);
});

test('supplementary portal offers complete PDF and original PowerPoint pairs with matching file hashes', () => {
  const supplements = JSON.parse(fs.readFileSync('gui/teaching-materials/manifest.json', 'utf8'));
  assert.equal(supplements.length, 2);
  assert.deepEqual(supplements.map(item => item.slides), [22, 19]);
  for (const item of supplements) {
    for (const format of ['pdf', 'pptx']) {
      const file = fs.readFileSync(path.join('gui', item[format].path));
      assert.equal(file.length, item[format].bytes);
      assert.equal(crypto.createHash('sha256').update(file).digest('hex'), item[format].sha256);
      assert.ok(html.includes(`href="${item[format].path}" download`));
      if (format === 'pdf') assert.equal(file.subarray(0, 5).toString(), '%PDF-');
      else assert.equal(file.subarray(0, 2).toString(), 'PK');
    }
    assert.ok(fs.existsSync(path.join('gui', item.thumbnail)));
    assert.ok(html.includes(`data-pdf-preview="${item.pdf.path}"`));
  }
  assert.ok(html.includes('data-tab-link="education-supplementary"'));
});
