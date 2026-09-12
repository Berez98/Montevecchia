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

  // Regola editoriale: un libro con copertine rigide (showCover: true) richiede
  // un numero pari di facciate affinché la retrocopertina chiuda all'esterno
  if (pages.length > 2 && pages.length % 2 !== 0) {
    const backCover = pages.pop();
    pages.push({
      type: 'endpaper',
      density: 'soft',
      pageNumber: pages.length + 1,
      html: `
        <div class="page-content endpaper-inner">
          <div class="endpaper-ornament">✦</div>
          <p class="endpaper-text">Note</p>
        </div>
      `
    });
    pages.push(backCover);
  }

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

  // Istanziazione di StPageFlip con proporzioni responsive e rapporto editoriale
  const pageFlip = new PageFlip(bookElement, {
    width: 450,
    height: 600,
    size: 'stretch',
    minWidth: 320,
    maxWidth: 600,
    minHeight: 440,
    maxHeight: 820,
    maxShadowOpacity: 0.5,
    showCover: true,
    mobileScrollSupport: false,
    usePortrait: true,
    autoSize: true,
    drawShadow: true,
    flippingTime: 800,
    useMouseEvents: true
  });

  // Caricamento elementi DOM nell'engine di sfoglio
  const pageNodes = bookElement.querySelectorAll('.page');
  pageFlip.loadFromHTML(pageNodes);

  // Inizializzazione della barra di navigazione e scorciatoie da tastiera
  setupControls(pageFlip);

  console.log('Web Flipbook inizializzato con successo. Pagine caricate:', pages.length);
}
