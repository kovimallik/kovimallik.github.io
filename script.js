(() => {
  'use strict';
  const root = document.documentElement;
  const nav = document.getElementById('main-nav');
  const menu = document.querySelector('.menu-toggle');
  function setMenu(open, restoreFocus = false) {
    nav.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    if (restoreFocus) menu.focus();
  }
  menu.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('open')) setMenu(false, true);
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.site-header') && nav.classList.contains('open')) setMenu(false);
  });

  const plate = document.getElementById('hero-plate');
  const views = {
    specimen: ['Lolium perenne', 'Perennial ryegrass'],
    field: ['Field phenotyping', 'Forage trials at NMBU'],
    portrait: ['Mallikarjuna Rao Kovi', 'SustainPlant Group']
  };
  plate.querySelectorAll('[data-view]').forEach(button => {
    button.addEventListener('click', () => {
      const view = button.dataset.view;
      const field = view === 'field';
      plate.classList.toggle('is-field', field);
      plate.querySelector('.botany').hidden = view !== 'specimen';
      plate.querySelector('.plate-portrait').hidden = view !== 'portrait';
      plate.querySelector('.field-image').hidden = !field;
      document.getElementById('plate-name').textContent = views[view][0];
      document.getElementById('plate-detail').textContent = views[view][1];
      plate.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    });
  });

  const themes = document.querySelector('.theme-nav');
  const tabs = Array.from(themes.querySelectorAll('button'));
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
  themes.setAttribute('role','tablist');
  tabs.forEach((tab, index) => {
    const id = tab.dataset.theme;
    const panel = document.getElementById(id);
    tab.id = 'tab-' + id;
    tab.setAttribute('role','tab');
    tab.setAttribute('aria-controls', id);
    panel.setAttribute('role','tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;
    tab.addEventListener('click', () => showTheme(tab));
    tab.addEventListener('keydown', e => {
      const keys = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 };
      if (e.key in keys) { e.preventDefault(); showTheme(tabs[keys[e.key]], true); }
    });
  });
  const currentTheme = () => tabs.find(tab => '#' + tab.dataset.theme === location.hash);
  showTheme(currentTheme() || tabs[0]);
  themes.hidden = false;
  window.addEventListener('hashchange', () => { const tab = currentTheme(); if (tab) showTheme(tab); });
  root.classList.add('enhanced');

  if ('IntersectionObserver' in window) {
    const chapters = Array.from(document.querySelectorAll('.chapter'));
    const navItems = Array.from(nav.querySelectorAll('a'));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('seen');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    const tracker = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navItems.forEach(link => {
            if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current','location');
            else link.removeAttribute('aria-current');
          });
        }
      });
    }, {rootMargin: '-10% 0px -65% 0px'});
    chapters.forEach(section => { observer.observe(section); tracker.observe(section); });
    tracker.observe(document.querySelector('.hero'));
    tracker.observe(document.querySelector('.contact'));
  }
})();
