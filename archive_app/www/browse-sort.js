/* Connect detail headers to shinyFiles' existing sort state and comparator. */
(function ($) {
  'use strict';
  const columns = {
    'sF-file-name': 'Name', 'sF-file-size': 'Size',
    'sF-file-mTime': 'Modified', 'sF-file-cTime': 'Created'
  };
  const selections = new WeakMap();
  function folder(modal) {
    const crumbs = $(modal).find('.sF-breadcrumps');
    return JSON.stringify([crumbs.data('selectedRoot'), crumbs.find('option').map(function () { return this.value; }).get()]);
  }
  function remember(modal) {
    selections.set(modal, {folder: folder(modal), names: $(modal).find('.sF-fileList > .sF-file.selected')
      .map(function () { return $(this).find('.sF-file-name').text(); }).get()});
  }
  function restore(modal) {
    const saved = selections.get(modal);
    if (!saved || saved.folder !== folder(modal)) { remember(modal); return; }
    const rows = $(modal).find('.sF-fileList > .sF-file');
    if (!rows.length) return;
    rows.each(function () { $(this).toggleClass('selected', saved.names.includes($(this).find('.sF-file-name').text())); });
    $(modal).find('#sF-selectButton').prop('disabled', !rows.filter('.selected').length);
  }
  function column(header) {
    return Object.keys(columns).find(key => header.classList.contains(key));
  }
  function headers(modal, attribute, direction) {
    modal.querySelectorAll('.sF-file-header > div > div').forEach(header => {
      const key = column(header);
      if (!key) return;
      header.classList.add('fjs-sortable');
      header.setAttribute('role', 'button');
      header.setAttribute('tabindex', '0');
      header.setAttribute('title', 'Sort by ' + columns[key] + '; click again to reverse');
      header.setAttribute('aria-label', 'Sort by ' + columns[key]);
      header.setAttribute('aria-sort', columns[key] === attribute ? direction : 'none');
    });
  }
  function sort(modal, attribute, direction) {
    const menu = $(modal).find('.sF-sort');
    menu.find('li.sortAttr').each(function () {
      $(this).toggleClass('selected', $(this).find('a').text().trim() === attribute);
    });
    menu.find('li.sortDir a').removeClass('ascending descending').addClass(direction);
    $(modal).trigger('fileSort', [attribute, direction]);
    headers(modal, attribute, direction);
  }
  function activate(event) {
    const header = event.target.closest('.sF-file-header > div > div');
    if (!header || !column(header)) return;
    if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
    // Stop shinyFiles' background click handler from clearing the selection.
    event.preventDefault();
    event.stopPropagation();
    const modal = header.closest('.sF-modalContainer');
    const button = $($(modal).data('button'));
    const attribute = columns[column(header)];
    const direction = button.data('sort') === attribute
      ? (button.data('sortDir') === 'ascending' ? 'descending' : 'ascending')
      : (attribute === 'Modified' || attribute === 'Created' ? 'descending' : 'ascending');
    sort(modal, attribute, direction);
  }
  document.addEventListener('click', activate, true);
  document.addEventListener('keydown', activate, true);
  document.addEventListener('click', function (event) {
    const modal = event.target.closest('.sF-modalContainer');
    if (modal && event.target.closest('.sF-fileWindow') && !event.target.closest('.sF-file-header')) {
      // Run after shinyFiles' bubbling click listener updates its selection.
      setTimeout(() => remember(modal), 0);
    }
  }, true);
  $(document).on('change.fjsBrowseSort', '.sF-modalContainer', function (event) {
    if (event.target !== this) return;
    const button = $($(this).data('button'));
    if (!button.length) return;
    restore(this);
    // Reapply the selected order after navigation or the one-second refresh.
    sort(this, button.data('sort') || 'Name', button.data('sortDir') || 'ascending');
  });
  $(document).on('fileSort.fjsBrowseSort', '.sF-modalContainer', function (event, attribute, direction) {
    headers(this, attribute, direction);
  });
})(window.jQuery);
