/* Classroom activities use only the supplied teaching materials. No entries
 * are sent to the archive or stored in a user account. */
(function () {
  'use strict';

  function wholeNumber(value, label, minimum = 0, maximum = 100) {
    const number = Number(value);
    if (value === '' || !Number.isSafeInteger(number) || number < minimum || number > maximum) {
      throw new RangeError(`${label}: enter a whole number from ${minimum} to ${maximum}.`);
    }
    return number;
  }

  function calculateSurveyBudget(design, survey) {
    const objective = survey.objectives.find((item) => item.id === design.objective);
    const schedule = survey.schedules.find((item) => item.id === design.schedule);
    const gear = survey.gear.find((item) => item.id === design.gear);
    if (!objective || !schedule || !gear) throw new Error('Choose an objective, schedule, and sampling method.');
    const repeats = wholeNumber(design.repeats, 'Gear repeats', 1);
    let stations = 0;
    const lines = [];
    survey.areas.forEach((area) => {
      const count = wholeNumber(design.stations[area.id], area.name);
      stations += count;
      if (count) lines.push({ label: `${area.name} field costs`, quantity: count * schedule.visits, unit: area.cost, basis: 'station-visits', cost: count * schedule.visits * area.cost });
    });
    const stationVisits = stations * schedule.visits;
    const gearQuantity = stationVisits * repeats;
    lines.push({ label: gear.name, quantity: gearQuantity, unit: gear.cost, basis: gear.unit, cost: gearQuantity * gear.cost });
    survey.measurements.filter((item) => design.measurements.includes(item.id)).forEach((measurement) => {
      const quantity = measurement.basis === 'station' ? stations
        : measurement.basis === 'specimen' ? stationVisits * wholeNumber(design.specimens, 'Specimens per station-visit', 1, 1000)
          : stationVisits;
      lines.push({ label: measurement.name, quantity, unit: measurement.cost, basis: measurement.basis === 'station' ? 'stations (once)' : measurement.basis === 'specimen' ? 'specimens' : 'station-visits', cost: quantity * measurement.cost });
    });
    const total = lines.reduce((sum, line) => sum + line.cost, 0);
    return { objective, schedule, gear, stations, stationVisits, repeats, lines, total, remaining: objective.budget - total };
  }

  function validateMatches(answers, matching) {
    const letters = new Set(matching.juveniles.map((item) => item.letter));
    const used = new Set();
    for (const adult of matching.adults) {
      const answer = answers[adult.id];
      if (!letters.has(answer)) return { valid: false, id: adult.id, message: `Choose a young-fish letter for ${adult.name}.` };
      if (used.has(answer)) return { valid: false, id: adult.id, message: `Letter ${answer} is used more than once. Use each letter once before comparing.` };
      used.add(answer);
    }
    return { valid: true };
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { calculateSurveyBudget, validateMatches };
  if (typeof document === 'undefined') return;

  function syncNavigationHeight() {
    const nav = document.querySelector('.site-nav');
    const height = nav && getComputedStyle(nav).position === 'sticky' ? Math.ceil(nav.getBoundingClientRect().height) : 0;
    document.documentElement.style.setProperty('--education-nav-height', `${height}px`);
  }

  function bindEducationNavigation() {
    const root = document.querySelector('.education-navigation');
    if (!root) return;
    const menu = root.querySelector('.nav-submenu');
    function positionMenu() {
      menu.style.left = '0px';
      const rect = menu.getBoundingClientRect();
      if (!rect.width) return;
      const shift = Math.max(12 - rect.left, Math.min(0, innerWidth - 12 - rect.right));
      menu.style.left = `${shift}px`;
      if (innerWidth <= 760) menu.style.maxHeight = `${Math.max(160, innerHeight - rect.top - 12)}px`;
      else menu.style.maxHeight = '';
    }
    root.addEventListener('mouseenter', positionMenu);
    root.addEventListener('focusin', positionMenu);
    root.querySelectorAll('.nav-subitem').forEach((item) => {
      const nested = item.querySelector('.nav-nested-submenu');
      function positionNested() {
        positionMenu();
        nested.classList.remove('education-menu-flipped');
        const rect = nested.getBoundingClientRect();
        if (innerWidth > 760 && rect.right > innerWidth - 12) nested.classList.add('education-menu-flipped');
        const top = nested.getBoundingClientRect().top;
        nested.style.maxHeight = innerWidth > 760 ? `${Math.max(100, innerHeight - top - 12)}px` : '';
      }
      item.addEventListener('mouseenter', positionNested);
      item.addEventListener('focusin', positionNested);
    });
  }

  function bindSupplementaryPreviews() {
    const page = document.getElementById('education-supplementary');
    if (!page) return;
    const frame = document.getElementById('supplementary-pdf-frame');
    const title = document.getElementById('supplementary-preview-title');
    const open = document.getElementById('supplementary-open-pdf');
    const status = document.getElementById('supplementary-pdf-status');
    const buttons = Array.from(page.querySelectorAll('[data-pdf-preview]'));
    function preview(button, moveFocus) {
      status.hidden = false;
      status.textContent = 'Loading PDF…';
      title.textContent = button.dataset.pdfTitle;
      frame.title = `${button.dataset.pdfTitle} PDF preview`;
      frame.src = button.dataset.pdfPreview + '#view=FitH';
      open.href = button.dataset.pdfPreview;
      buttons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      if (moveFocus) {
        title.focus({ preventScroll: true });
        title.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    frame.addEventListener('load', () => { status.hidden = true; });
    buttons.forEach((button) => button.addEventListener('click', () => preview(button, true)));
    const loadInitial = () => { if (page.classList.contains('active') && !frame.getAttribute('src')) preview(buttons[0], false); };
    window.addEventListener('hrbmp-tab-change', loadInitial);
    loadInitial();
  }

  const dollars = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  const element = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  };

  function bindSurvey(survey) {
    const form = document.getElementById('survey-design-form');
    const summary = document.getElementById('survey-budget-summary');
    const breakdown = document.getElementById('survey-budget-lines');
    const detail = document.getElementById('survey-objective-detail');
    const gearDetail = document.getElementById('survey-gear-detail');
    const save = document.getElementById('survey-export');
    const saveStatus = document.getElementById('survey-save-status');
    let current;
    function readDesign() {
      const values = new FormData(form);
      return { objective: values.get('objective'), schedule: values.get('schedule'), gear: values.get('gear'), repeats: values.get('repeats'),
        stations: Object.fromEntries(survey.areas.map((area) => [area.id, values.get(`area-${area.id}`)])),
        measurements: values.getAll('measurement'), specimens: values.get('specimens') };
    }
    function update() {
      const design = readDesign();
      document.getElementById('survey-specimens-label').hidden = !design.measurements.includes('maturity');
      const objective = survey.objectives.find((item) => item.id === design.objective);
      const gear = survey.gear.find((item) => item.id === design.gear);
      detail.replaceChildren(element('p', objective.scenario), element('p', objective.objective, 'survey-primary-objective'), element('p', objective.clue), element('p', objective.discussion, 'survey-discussion-prompt'));
      gearDetail.textContent = `${gear.description}. ${gear.limitation}.`;
      saveStatus.textContent = '';
      summary.replaceChildren();
      breakdown.replaceChildren();
      try {
        current = calculateSurveyBudget(design, survey);
      } catch (error) {
        summary.append(element('p', error.message, 'survey-input-error'));
        current = null;
        save.disabled = true;
        return;
      }
      save.disabled = false;
      const over = current.remaining < 0;
      summary.append(element('span', 'Planned cost', 'survey-cost-label'), element('strong', dollars(current.total), 'survey-total'));
      const meter = element('meter');
      meter.min = 0;
      meter.max = current.objective.budget;
      meter.value = Math.min(current.total, current.objective.budget);
      meter.setAttribute('aria-label', 'Share of objective budget used');
      summary.append(meter, element('p', `Budget: ${dollars(current.objective.budget)}`), element('p', `${dollars(Math.abs(current.remaining))} ${over ? 'over budget' : 'remaining'}`, over ? 'survey-over-budget' : 'survey-remaining'));
      summary.append(element('p', current.stations ? `${current.stations} stations × ${current.schedule.visits} visits = ${current.stationVisits} station-visits` : 'Add stations to begin your design.', 'survey-effort'));
      current.lines.forEach((line) => {
        const row = element('div', undefined, 'survey-cost-line');
        const label = element('div');
        label.append(element('strong', line.label), element('small', `${line.quantity} ${line.basis} × ${dollars(line.unit)}`));
        row.append(label, element('span', dollars(line.cost)));
        breakdown.append(row);
      });
      if (over) breakdown.append(element('p', 'Revise locations, visits, gear effort, or measurements. Explain the scientific trade-off.', 'survey-over-budget'));
    }
    form.addEventListener('input', (event) => { if (!event.target.matches('textarea')) update(); });
    form.addEventListener('change', (event) => { if (!event.target.matches('textarea')) update(); });
    form.addEventListener('submit', (event) => event.preventDefault());
    form.addEventListener('reset', () => window.requestAnimationFrame(update));
    save.addEventListener('click', () => {
      if (!current) return;
      if (!current.stations) { saveStatus.textContent = 'Add at least one station before saving your plan.'; return; }
      const values = new FormData(form);
      const text = ['HUDSON RIVER SURVEY DESIGN CHALLENGE', current.objective.title, '', current.objective.objective, '',
        `Objective budget: ${dollars(current.objective.budget)}`, `Planned cost: ${dollars(current.total)}`, `${dollars(Math.abs(current.remaining))} ${current.remaining < 0 ? 'over budget' : 'remaining'}`, '',
        ...survey.areas.map((area) => `${area.name}: ${values.get(`area-${area.id}`)} stations`),
        `Schedule: ${current.schedule.name}`, `Station-visits: ${current.stationVisits}`, `Method: ${current.gear.name}`, `Gear repeats per station-visit: ${current.repeats}`, '', 'BUDGET',
        ...current.lines.map((line) => `${line.label}: ${line.quantity} ${line.basis} × ${dollars(line.unit)} = ${dollars(line.cost)}`), '', 'OUR DESIGN',
        ...Array.from(form.querySelectorAll('.survey-notes textarea')).flatMap((input) => [input.parentElement.firstChild.textContent, input.value || '(not filled in)', '']),
        'Classroom costs from the supplied survey-design challenge deck.'].join('\n');
      const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
      const link = element('a');
      link.href = url;
      link.download = 'hudson-river-survey-plan.txt';
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      saveStatus.textContent = 'Survey plan saved to your downloads.';
    });
    form.hidden = false;
    update();
  }

  function bindMatching(matching) {
    const form = document.getElementById('fish-matching-form');
    const status = document.getElementById('matching-status');
    const review = document.getElementById('matching-review');
    const comparisons = document.getElementById('matching-comparisons');
    function clearReview() { status.textContent = ''; review.hidden = true; comparisons.replaceChildren(); }
    form.addEventListener('input', clearReview);
    form.addEventListener('reset', clearReview);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const values = new FormData(form);
      const answers = Object.fromEntries(matching.adults.map((adult) => [adult.id, values.get(adult.id)]));
      const validation = validateMatches(answers, matching);
      if (!validation.valid) {
        status.textContent = validation.message;
        document.getElementById(`match-${validation.id}`).focus();
        return;
      }
      comparisons.replaceChildren();
      matching.adults.forEach((adult) => {
        const juvenile = matching.juveniles.find((item) => item.letter === answers[adult.id]);
        const row = element('article', undefined, 'matching-comparison');
        row.append(element('h3', `${adult.name} ↔ Young fish ${juvenile.letter}`));
        const pair = element('div', undefined, 'matching-comparison-images');
        [adult.image.path, juvenile.image.path].forEach((path, index) => {
          const img = element('img');
          img.src = path;
          img.alt = index === 0 ? `Adult ${adult.name}` : `Your selected young fish ${juvenile.letter}`;
          pair.append(img);
        });
        row.append(pair);
        const reason = values.get(`reason-${adult.id}`).trim();
        if (reason) row.append(element('p', `Your evidence: ${reason}`));
        comparisons.append(row);
      });
      // The source worksheet supplies no answer key. Never grade inferred fish IDs.
      status.textContent = 'All five pairs are ready to compare. Explain your choices with your group.';
      review.hidden = false;
      document.getElementById('matching-review-title').focus({ preventScroll: true });
      review.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function bindImageDialog() {
    const dialog = document.getElementById('activity-image-dialog');
    document.querySelectorAll('[data-enlarge-image]').forEach((button) => button.addEventListener('click', () => {
      const image = document.getElementById('activity-image-large');
      image.src = button.dataset.enlargeImage;
      image.alt = button.dataset.imageLabel;
      document.getElementById('activity-image-title').textContent = button.dataset.imageLabel;
      dialog.showModal();
    }));
    document.getElementById('activity-image-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
    window.addEventListener('hrbmp-tab-change', () => { if (dialog.open) dialog.close(); });
  }

  function prepareActivityPrint() {
    document.querySelectorAll('.activity-print-value').forEach((node) => node.remove());
    document.querySelectorAll('.activity-page.active select, .activity-page.active input[type="number"], .activity-page.active textarea').forEach((input) => {
      const value = input.tagName === 'SELECT' ? input.selectedOptions[0]?.textContent : input.value;
      const copy = element('div', value || '\u00a0', `activity-print-value${input.tagName === 'TEXTAREA' ? ' activity-print-notes' : ''}`);
      input.after(copy);
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    syncNavigationHeight();
    new ResizeObserver(syncNavigationHeight).observe(document.querySelector('.site-nav'));
    window.addEventListener('resize', syncNavigationHeight);
    window.addEventListener('hrbmp-tab-change', syncNavigationHeight);
    bindSupplementaryPreviews();
    bindEducationNavigation();
    window.addEventListener('beforeprint', prepareActivityPrint);
    window.addEventListener('afterprint', () => document.querySelectorAll('.activity-print-value').forEach((node) => node.remove()));
    if (!document.getElementById('survey-design-form')) return;
    const status = document.getElementById('survey-load-status');
    try {
      const response = await fetch('data/education_activities.json');
      if (!response.ok) throw new Error('Activity data could not be loaded.');
      const data = await response.json();
      bindSurvey(data.survey);
      bindMatching(data.matching);
      bindImageDialog();
      status.hidden = true;
    } catch (error) {
      status.textContent = 'The activity could not load. Reload the page to try again.';
      console.error('Classroom activity initialization failed:', error);
    }
    document.querySelectorAll('[data-print-activity]').forEach((button) => button.addEventListener('click', () => window.print()));
  });
})();
