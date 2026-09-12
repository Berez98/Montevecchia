import { PageFlip } from 'page-flip';
import { SAMPLE_PAGES } from './utils/parser.js';
import { setupControls } from './utils/controls.js';

document.addEventListener('DOMContentLoaded', () => {
  initBook();
});

function initBook() {
  const bookElement = document.getElementById('book');
  if (!bookElement) return;

  // Generazione dinamica delle pagine demo
  const pages = SAMPLE_PAGES;
  bookElement.innerHTML = '';

  pages.forEach((page, index) => {
    const pageDiv = document.createElement('div');
    const isLeft = index % 2 === 0;
    
    // Classi editoriali e orientamento pagina
    pageDiv.className = `page ${page.type === 'cover' ? 'page-cover' : page.type === 'backcover' ? 'page-backcover' : ''} ${isLeft ? '--left' : '--right'}`;
    pageDiv.setAttribute('data-density', page.density || 'soft');
    pageDiv.innerHTML = page.html;

    bookElement.appendChild(pageDiv);
  });

  // Istanziazione di StPageFlip con proporzioni responsive
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

  // Inizializzazione della barra di navigazione e scorciatoie tastiera
  setupControls(pageFlip);

  console.log('Web Flipbook inizializzato con successo. Pagine caricate:', pages.length);
}
