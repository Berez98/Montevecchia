/**
 * Modalità lettura continua (smartphone): markup, indice e controlli dedicati.
 */

import { getState, setState } from '../state/store.js';

const FONT_MIN = 0.85;
const FONT_MAX = 1.45;
const FONT_STEP = 0.1;

let teardown = null;

const ICON_BOOK = `
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>`;

const ICON_LIST = `
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>`;

export function renderReader(pages) {
  const readerEl = document.getElementById('mobile-reader');
  if (!readerEl) return;

  const visible = pages.filter((p) => p.type !== 'endpaper');

  // Le pagine di continuazione non generano una voce d'indice separata
  const tocItems = visible
    .map((page, index) => ({ page, index }))
    .filter(({ page }) => page.isSectionStart !== false)
    .map(({ page, index }) => `<li><a href="#reader-section-${index}" class="reader-toc-link">${page.title || page.header || `Sezione ${index + 1}`}</a></li>`)
    .join('');

  const cards = visible
    .map((p, i) => {
      const modifier =
        p.type === 'cover' ? ' reader-card-cover' : p.type === 'backcover' ? ' reader-card-backcover' : '';
      const header =
        p.type === 'cover' || p.type === 'backcover' || p.isSectionStart === false
          ? ''
          : `<div class="reader-card-header">${p.header || ''}</div>`;
      return `
        <article id="reader-section-${i}" class="reader-card${modifier}">
          ${header}
          <div class="reader-card-body">${p.html}</div>
        </article>`;
    })
    .join('<div class="reader-separator"></div>');

  readerEl.innerHTML = `
    <header class="reader-topbar">
      <button id="reader-switch-flip-btn" class="reader-btn" type="button" title="Torna allo sfoglio 3D">
        ${ICON_BOOK}<span>Sfoglia 3D</span>
      </button>

      <span class="reader-title-badge">Santo Rosario</span>

      <div class="reader-actions">
        <button id="reader-toc-toggle-btn" class="reader-btn" type="button" aria-expanded="false" aria-controls="reader-drawer" title="Indice dei contenuti">
          ${ICON_LIST}<span>Indice</span>
        </button>
        <button id="reader-font-dec" class="reader-font-btn" type="button" aria-label="Riduci il testo" title="Riduci testo">A-</button>
        <button id="reader-font-inc" class="reader-font-btn" type="button" aria-label="Ingrandisci il testo" title="Ingrandisci testo">A+</button>
      </div>
    </header>

    <nav id="reader-drawer" class="reader-drawer" aria-label="Indice dei contenuti" hidden>
      <div class="reader-drawer-title">Indice dei Contenuti</div>
      <ul class="reader-toc-links">${tocItems}</ul>
    </nav>

    <div class="reader-content">${cards}</div>

    <button id="reader-back-to-top" class="reader-back-to-top" type="button" aria-label="Torna in cima" title="Torna all'inizio">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </button>
  `;
}

export function setupReaderControls() {
  teardown?.();

  const controller = new AbortController();
  const { signal } = controller;
  const on = (target, type, handler, opts) =>
    target?.addEventListener(type, handler, { ...opts, signal });

  const readerEl = document.getElementById('mobile-reader');
  const drawer = document.getElementById('reader-drawer');
  const tocToggleBtn = document.getElementById('reader-toc-toggle-btn');
  const backToTopBtn = document.getElementById('reader-back-to-top');

  on(document.getElementById('reader-switch-flip-btn'), 'click', () => setState({ mode: 'flipbook' }));

  // --------------------------------------------------- indice con focus trap
  function focusableInDrawer() {
    return Array.from(drawer?.querySelectorAll('a[href], button') ?? []);
  }

  function openDrawer() {
    if (!drawer) return;
    drawer.hidden = false;
    drawer.classList.add('is-open');
    tocToggleBtn?.setAttribute('aria-expanded', 'true');
    focusableInDrawer()[0]?.focus();
  }

  function closeDrawer({ restoreFocus = true } = {}) {
    if (!drawer || drawer.hidden) return;
    drawer.classList.remove('is-open');
    drawer.hidden = true;
    tocToggleBtn?.setAttribute('aria-expanded', 'false');
    if (restoreFocus) tocToggleBtn?.focus();
  }

  on(tocToggleBtn, 'click', () => (drawer?.hidden ? openDrawer() : closeDrawer()));

  on(drawer, 'keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeDrawer();
      return;
    }
    if (e.key !== 'Tab') return;

    const items = focusableInDrawer();
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  on(document, 'pointerdown', (e) => {
    if (drawer && !drawer.hidden && !drawer.contains(e.target) && !tocToggleBtn?.contains(e.target)) {
      closeDrawer({ restoreFocus: false });
    }
  });

  drawer?.querySelectorAll('.reader-toc-link').forEach((link) => {
    on(link, 'click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (!target || !readerEl) return;
      closeDrawer({ restoreFocus: false });
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      readerEl.scrollTo({ top: Math.max(0, target.offsetTop - 60), behavior });
    });
  });

  // ------------------------------------------------------- dimensione testo
  const stepFont = (delta) => {
    const next = Number((getState().fontScale + delta).toFixed(2));
    setState({ fontScale: Math.min(FONT_MAX, Math.max(FONT_MIN, next)) });
  };

  on(document.getElementById('reader-font-inc'), 'click', () => stepFont(FONT_STEP));
  on(document.getElementById('reader-font-dec'), 'click', () => stepFont(-FONT_STEP));

  // ---------------------------------------------------------- torna in cima
  on(
    readerEl,
    'scroll',
    () => backToTopBtn?.classList.toggle('is-visible', readerEl.scrollTop > 300),
    { passive: true }
  );

  on(backToTopBtn, 'click', () => {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    readerEl?.scrollTo({ top: 0, behavior });
  });

  teardown = () => {
    controller.abort();
    teardown = null;
  };

  return teardown;
}
