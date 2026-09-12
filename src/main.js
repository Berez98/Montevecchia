import { PageFlip } from 'page-flip';
import bookSource from '../content/book-source.txt?raw';
import roseImage from '../content/Rose.jpeg';
import { buildPages } from './parser/index.js';
import { computePageBox, createMeasurer } from './parser/measure.js';
import { setupControls } from './ui/controls.js';
import { renderReader, setupReaderControls } from './ui/reader.js';
import { getState, setState, subscribe, restorePersistedState } from './state/store.js';

const REBUILD_THRESHOLD_PX = 16;
const RESIZE_DEBOUNCE_MS = 200;

let pageFlip = null;
let lastBox = null;
let resizeTimer = null;

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const nextFrame = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));

function el(id) {
  return document.getElementById(id);
}

// ---------------------------------------------------------------- costruzione
function renderPages(bookElement, pages) {
  bookElement.innerHTML = '';
  const fragment = document.createDocumentFragment();

  pages.forEach((page, index) => {
    const isLeft = index % 2 === 1;
    const isCover = index === 0;
    const isBackCover = index === pages.length - 1;

    let typeClass = '';
    if (page.type === 'cover' || isCover) typeClass = 'page-cover';
    else if (page.type === 'backcover' || isBackCover) typeClass = 'page-backcover';
    else if (page.type === 'endpaper') typeClass = 'page-endpaper';

    const node = document.createElement('div');
    node.className = `page ${typeClass} ${isLeft ? '--left' : '--right'}`.replace(/\s+/g, ' ').trim();
    node.setAttribute('data-density', page.density || (isCover || isBackCover ? 'hard' : 'soft'));
    node.setAttribute('role', 'group');
    node.setAttribute('aria-roledescription', 'pagina');
    node.setAttribute('aria-label', page.title || `Pagina ${index + 1}`);
    node.innerHTML = page.html;
    fragment.appendChild(node);
  });

  bookElement.appendChild(fragment);
}

function createFlipEngine(bookElement) {
  const flip = new PageFlip(bookElement, {
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
    // PageFlip rifiuta il valore 0: con reduced-motion si usa la durata minima
    flippingTime: prefersReducedMotion() ? 1 : 600,
    useMouseEvents: true
  });

  flip.loadFromHTML(bookElement.querySelectorAll('.page'));
  return flip;
}

function buildBook({ preservePage = true } = {}) {
  const container = el('book-container');
  if (!container) throw new Error('Contenitore del libro non trovato.');

  const box = computePageBox(container);
  const measurer = box ? createMeasurer(box) : null;

  let pages;
  try {
    pages = buildPages(bookSource, { coverImageUrl: roseImage, measurer });
  } finally {
    measurer?.destroy();
  }

  const previousRatio =
    preservePage && getState().total > 1 ? getState().currentPage / (getState().total - 1) : null;

  // StPageFlip avvolge il nodo che riceve: si riparte sempre da un contenitore pulito
  pageFlip?.destroy();
  pageFlip = null;
  container.innerHTML = '';
  const bookElement = document.createElement('div');
  bookElement.id = 'book';
  bookElement.className = 'flipbook';
  container.appendChild(bookElement);

  renderPages(bookElement, pages);
  pageFlip = createFlipEngine(bookElement);

  const total = pageFlip.getPageCount();
  setState({ pages, total });

  const syncPage = () => setState({ currentPage: pageFlip.getCurrentPageIndex() });
  pageFlip.on('flip', syncPage);
  pageFlip.on('changeState', syncPage);

  const target =
    previousRatio !== null
      ? Math.round(previousRatio * (total - 1))
      : Math.min(getState().currentPage, total - 1);

  if (target > 0) pageFlip.turnToPage(target);
  setState({ currentPage: pageFlip.getCurrentPageIndex() });

  renderReader(pages);
  setupReaderControls();

  lastBox = box;
}

// ------------------------------------------------------------------- viste
function applyMode(mode) {
  const bookContainer = el('book-container');
  const reader = el('mobile-reader');
  const isReader = mode === 'reader';

  if (bookContainer) bookContainer.hidden = isReader;
  if (reader) reader.hidden = !isReader;
  const progress = el('reading-progress');
  if (progress) progress.hidden = isReader;

  if (isReader) {
    reader?.scrollTo({ top: 0, behavior: 'auto' });
  } else {
    nextFrame(() => {
      try {
        pageFlip?.update();
      } catch {
        /* l'engine può non essere pronto durante una ricostruzione */
      }
    });
  }
}

function showError(message) {
  el('app')?.classList.remove('is-loading');
  const loading = el('app-loading');
  if (loading) loading.hidden = true;
  const box = el('app-error');
  const detail = el('app-error-detail');
  if (detail) detail.textContent = message;
  if (box) box.hidden = false;
}

// ------------------------------------------------------------------- resize
function handleResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (getState().mode !== 'flipbook') return;

    const box = computePageBox(el('book-container'));
    if (!box) return;

    const changed =
      !lastBox ||
      Math.abs(box.width - lastBox.width) > REBUILD_THRESHOLD_PX ||
      Math.abs(box.height - lastBox.height) > REBUILD_THRESHOLD_PX ||
      box.isPortrait !== lastBox.isPortrait;

    if (changed) {
      // La capienza della pagina è cambiata: va rifatta l'impaginazione
      try {
        buildBook({ preservePage: true });
      } catch (error) {
        showError(error.message);
      }
    } else {
      pageFlip?.update();
    }
  }, RESIZE_DEBOUNCE_MS);
}

// ---------------------------------------------------------------- bootstrap
async function start() {
  restorePersistedState();
  subscribe((state, changed) => {
    if (changed.includes('mode')) applyMode(state.mode);
  });

  try {
    // I font devono essere caricati prima di misurare, altrimenti l'impaginazione è falsata
    await document.fonts?.ready;
  } catch {
    /* font API non disponibile: si procede con i fallback di sistema */
  }

  try {
    buildBook({ preservePage: false });
    setupControls({ getFlip: () => pageFlip });
    applyMode(getState().mode);

    el('app')?.classList.remove('is-loading');
    const loading = el('app-loading');
    if (loading) loading.hidden = true;
  } catch (error) {
    console.error(error);
    showError('Il testo del libro non è stato caricato correttamente. Riprova a ricaricare la pagina.');
    return;
  }

  const container = el('book-container');
  if (container && 'ResizeObserver' in window) {
    new ResizeObserver(handleResize).observe(container);
  } else {
    window.addEventListener('resize', handleResize);
  }
  window.addEventListener('orientationchange', handleResize);
}

el('app-error-retry')?.addEventListener('click', () => window.location.reload());

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}
