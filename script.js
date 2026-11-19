(() => {
  'use strict';

  const root = document.documentElement;
  const nav = document.getElementById('main-nav');
  const menu = document.querySelector('.menu-toggle');
  const languageLinks = [...document.querySelectorAll('.languages a')];

  function setMenu(open, restoreFocus = false) {
    nav.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? menu.dataset.close : menu.dataset.open);
    if (restoreFocus) menu.focus();
  }
  menu.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('open')) setMenu(false, true);
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header') && nav.classList.contains('open')) setMenu(false);
  });

  const themes = document.querySelector('.theme-nav');
  const tabs = [...themes.querySelectorAll('button')];
  function showTheme(tab, focus = false) {
    tabs.forEach(button => {
      const selected = button === tab;
      const panel = document.getElementById(button.dataset.theme);
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      panel.hidden = !selected;
      panel.toggleAttribute('data-active', selected);
    });
    if (focus) tab.focus();
  }
  themes.setAttribute('role', 'tablist');
  tabs.forEach((tab, index) => {
    const panel = document.getElementById(tab.dataset.theme);
    tab.id = 'tab-' + panel.id;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panel.id);
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;
    tab.addEventListener('click', () => showTheme(tab));
    tab.addEventListener('keydown', event => {
      const keys = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 };
      if (event.key in keys) {
        event.preventDefault();
        showTheme(tabs[keys[event.key]], true);
      }
    });
  });
  const hashTab = () => tabs.find(tab => '#' + tab.dataset.theme === location.hash);
  showTheme(hashTab() || tabs[0]);
  themes.hidden = false;
  root.classList.add('enhanced');

  const sections = [...document.querySelectorAll('.masthead, .chapter, .contact')];
  const navItems = [...nav.querySelectorAll('a')];
  function currentSection() {
    const readingLine = document.querySelector('.site-header').offsetHeight + 75;
    let id = '';
    for (const section of sections) {
      if (section.getBoundingClientRect().top > readingLine) break;
      id = section.id;
    }
    return id;
  }
  let manualReading = false;
  function syncLinks() {
    const requested = document.getElementById(location.hash.slice(1));
    const explicitSection = requested?.closest('.chapter, .contact');
    const section = !manualReading && requested
      ? explicitSection?.id || ''
      : currentSection();
    navItems.forEach(link => {
      if (link.hash === '#' + section) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
    let target = section;
    if (section === 'research') target = tabs.find(t => t.getAttribute('aria-selected') === 'true').dataset.theme;
    if (section === 'collaborations') {
      const country = document.getElementById('network-country');
      if (country?.value) target = 'network-' + country.value.toLowerCase();
    }
    languageLinks.forEach(link => { link.hash = target; });
  }
  let scheduled = false;
  function scheduleSync() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { syncLinks(); scheduled = false; });
  }
  window.addEventListener('scroll', scheduleSync, {passive: true});
  window.addEventListener('resize', scheduleSync);
  window.addEventListener('hashchange', () => {
    manualReading = false;
    if (hashTab()) showTheme(hashTab());
    scheduleSync();
  });
  function followScroll() { manualReading = true; scheduleSync(); }
  window.addEventListener('wheel', followScroll, {passive: true});
  window.addEventListener('touchmove', followScroll, {passive: true});
  document.addEventListener('keydown', event => {
    if (['PageDown', 'PageUp', 'Home', 'End', 'ArrowDown', 'ArrowUp', ' '].includes(event.key)
        && !event.target.closest('select, input, button, [role=tablist]')) followScroll();
  });
  document.addEventListener('change', event => {
    if (event.target.closest('#collaborations')) manualReading = false;
    scheduleSync();
  });
  document.addEventListener('click', scheduleSync);
  document.addEventListener('focusin', scheduleSync);
  syncLinks();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('seen'); observer.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px' });
    sections.forEach(section => observer.observe(section));
  }
})();
