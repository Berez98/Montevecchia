import { PageFlip } from 'page-flip';
import bookSource from '../content/book-source.txt?raw';
import { parseRawContent, SAMPLE_PAGES } from './utils/parser.js';
import { setupControls } from './utils/controls.js';

document.addEventListener('DOMContentLoaded', () => {
  initBook();
});

function initBook() {
  const bookElement = document.getElementById('book');
  if (!bookElement) return;

  // Ingestione del testo sorgente tramite il parser editoriale
  let pages = parseRawContent(bookSource);
  if (!pages || pages.length === 0) {
    pages = SAMPLE_PAGES;
  }

  // 1. Popolamento e generazione della Modalità Smartphone (scorrimento continuo)
  initMobileReader(pages);

  // 2. Generazione del Flipbook 3D
  bookElement.innerHTML = '';

  pages.forEach((page, index) => {
    const pageDiv = document.createElement('div');
    
    // In StPageFlip con showCover:true:
    // Indice 0: Copertina frontale (lato destro a libro chiuso)
    // Indici dispari (1, 3, 5...): Pagina sinistra nello spread aperto
    // Indici pari (2, 4, 6...): Pagina destra nello spread aperto
    const isLeft = index % 2 === 1;
    const isCover = index === 0;
    const isBackCover = index === pages.length - 1;

    let pageTypeClass = '';
    if (page.type === 'cover' || isCover) {
      pageTypeClass = 'page-cover';
    } else if (page.type === 'backcover' || isBackCover) {
      pageTypeClass = 'page-backcover';
    } else if (page.type === 'endpaper') {
      pageTypeClass = 'page-endpaper';
    }

    pageDiv.className = `page ${pageTypeClass} ${isLeft ? '--left' : '--right'}`.trim();
    pageDiv.setAttribute('data-density', page.density || ((isCover || isBackCover) ? 'hard' : 'soft'));
    pageDiv.innerHTML = page.html;

    bookElement.appendChild(pageDiv);
  });

  // Istanziazione di StPageFlip con proporzioni responsive e swipe calibrato
  const pageFlip = new PageFlip(bookElement, {
    width: 450,
    height: 600,
    size: 'stretch',
    minWidth: 260,
    maxWidth: 600,
    minHeight: 380,
    maxHeight: 850,
    maxShadowOpacity: 0.4,
    showCover: true,
    mobileScrollSupport: false,
    swipeDistance: 60,
    usePortrait: true,
    autoSize: true,
    drawShadow: true,
    flippingTime: 600,
    useMouseEvents: true
  });

  // Caricamento elementi DOM nell'engine di sfoglio
  const pageNodes = bookElement.querySelectorAll('.page');
  pageFlip.loadFromHTML(pageNodes);

  // Inizializzazione della barra di navigazione e controlli (incluso switch smartphone/flipbook)
  setupControls(pageFlip);

  console.log('Web Flipbook e Modalità Smartphone inizializzati con successo. Pagine:', pages.length);
}

/**
 * Genera l'interfaccia a scorrimento continuo per la Modalità Smartphone
 */
function initMobileReader(pages) {
  const readerEl = document.getElementById('mobile-reader');
  if (!readerEl) return;

  const topbar = `
    <header class="reader-topbar">
      <button id="reader-switch-flip-btn" class="reader-btn" type="button" title="Torna allo sfoglio 3D">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
        <span>Sfoglia 3D</span>
      </button>

      <span class="reader-title-badge">Santo Rosario</span>

      <div class="reader-actions">
        <button id="reader-toc-toggle-btn" class="reader-btn" type="button" title="Indice dei contenuti">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          <span>Indice</span>
        </button>
        <button id="reader-font-dec" class="reader-font-btn" type="button" title="Riduci testo">A-</button>
        <button id="reader-font-inc" class="reader-font-btn" type="button" title="Ingrandisci testo">A+</button>
      </div>
    </header>
  `;

  // Menu rapido di navigazione (Indice dei contenuti)
  const tocItems = pages
    .filter(p => p.type !== 'endpaper')
    .map((p, i) => `
      <li>
        <a href="#reader-section-${i}" class="reader-toc-link">
          ${p.title || p.header || `Sezione ${i + 1}`}
        </a>
      </li>
    `).join('');

  const drawer = `
    <nav id="reader-drawer" class="reader-drawer" aria-label="Indice dei misteri">
      <div class="reader-drawer-title">Indice dei Contenuti</div>
      <ul class="reader-toc-links">
        ${tocItems}
      </ul>
    </nav>
  `;

  // Schede di lettura fluide
  const cardsHtml = pages
    .filter(p => p.type !== 'endpaper')
    .map((p, i) => {
      let cardClass = 'reader-card';
      if (p.type === 'cover') cardClass += ' reader-card-cover';
      if (p.type === 'backcover') cardClass += ' reader-card-backcover';

      return `
        <article id="reader-section-${i}" class="${cardClass}">
          ${(p.type !== 'cover' && p.type !== 'backcover') ? `<div class="reader-card-header">${p.header || ''}</div>` : ''}
          <div class="reader-card-body">
            ${p.html}
          </div>
        </article>
      `;
    }).join(`
      <div class="reader-separator"></div>
    `);

  const content = `
    <div class="reader-content">
      ${cardsHtml}
    </div>
    <button id="reader-back-to-top" class="reader-back-to-top" type="button" aria-label="Torna in cima" title="Torna all'inizio">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </button>
  `;

  readerEl.innerHTML = topbar + drawer + content;
}
