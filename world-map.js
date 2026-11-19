(() => {
  'use strict';
  const section = document.getElementById('collaborations');
  if (!section) return;

  const map = section.querySelector('.network-map');
  const kind = section.querySelector('[data-network-type]');
  const country = section.querySelector('#network-country');
  const switches = Array.from(section.querySelectorAll('[data-network-zoom]'));
  const countries = Array.from(section.querySelectorAll('[data-network-card]')).map(card => {
    const iso = card.dataset.networkCard;
    const marker = map.querySelector('[data-network-iso="' + iso + '"]');
    return {
      iso, card, marker, europe: marker.dataset.europe === 'true',
      kinds: card.dataset.networkKinds.split(' '),
      option: Array.from(country.options).find(item => item.value === iso),
      records: Array.from(card.querySelectorAll('[data-network-record]'))
    };
  });

  let zoom = 'world';
  function render(iso, updateLocation) {
    const eligible = countries.filter(entry =>
      (kind.value === 'all' || entry.kinds.includes(kind.value)) &&
      (zoom === 'world' || entry.europe)
    );
    const selected = eligible.find(entry => entry.iso === iso) || eligible[0];
    if (!selected) return;
    map.dataset.zoom = zoom;
    map.setAttribute('viewBox', zoom === 'world' ? map.dataset.worldBox : map.dataset.europeBox);
    for (const button of switches) {
      button.setAttribute('aria-pressed', String(button.dataset.networkZoom === zoom));
    }
    for (const entry of countries) {
      const available = eligible.includes(entry);
      const chosen = entry === selected;
      entry.card.hidden = !chosen;
      entry.option.hidden = !available;
      entry.option.disabled = !available;
      entry.marker.classList.toggle('network-unavailable', !available);
      entry.marker.setAttribute('tabindex', available ? '0' : '-1');
      entry.marker.setAttribute('aria-hidden', String(!available));
      if (chosen) entry.marker.setAttribute('aria-current', 'true');
      else entry.marker.removeAttribute('aria-current');
      for (const record of entry.records) {
        record.hidden = kind.value !== 'all' && record.dataset.networkRecord !== kind.value;
      }
    }
    country.value = selected.iso;
    if (updateLocation && location.hash !== '#' + selected.card.id) {
      history.replaceState(null, '', '#' + selected.card.id);
    }
  }
  function entryFromHash() {
    return countries.find(entry => '#' + entry.card.id === location.hash);
  }
  function restoreFromHash() {
    const entry = entryFromHash();
    if (!entry) return;
    kind.value = 'all';
    zoom = 'world';
    render(entry.iso, false);
  }

  for (const entry of countries) {
    entry.marker.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      render(entry.iso, true);
    });
  }
  for (const button of switches) {
    button.addEventListener('click', () => {
      zoom = button.dataset.networkZoom;
      render(country.value, true);
    });
  }
  kind.addEventListener('change', () => render(country.value, true));
  country.addEventListener('change', () => render(country.value, true));
  window.addEventListener('hashchange', restoreFromHash);
  section.querySelector('.network-toolbar').hidden = false;
  section.querySelector('.network-picker').hidden = false;
  render(entryFromHash()?.iso || 'NOR', false);
})();
