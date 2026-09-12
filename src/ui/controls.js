/**
 * Controlli di navigazione, tastiera, fullscreen e "vai a pagina".
 * Tutti i listener sono registrati con un AbortController unico e rimossi in teardown.
 */

import { getState, setState, subscribe } from '../state/store.js';

const IDLE_HIDE_MS = 3200;

let teardown = null;

export function setupControls({ getFlip }) {
  teardown?.();

  const controller = new AbortController();
  const { signal } = controller;
  const on = (target, type, handler, opts) =>
    target?.addEventListener(type, handler, { ...opts, signal });

  const $ = (id) => document.getElementById(id);
  const prevBtn = $('prev-btn');
  const nextBtn = $('next-btn');
  const pageCurrentEl = $('page-current');
  const pageTotalEl = $('page-total');
  const indicatorBtn = $('page-indicator');
  const fullscreenBtn = $('fullscreen-btn');
  const viewModeBtn = $('view-mode-btn');
  const controlsBar = $('controls');
  const announcer = $('sr-announcer');
  const progressFill = $('reading-progress-fill');
  const popover = $('goto-popover');
  const range = $('goto-range');
  const rangeValue = $('goto-value');

  const iconExpand = fullscreenBtn?.querySelector('.icon-expand');
  const iconCompress = fullscreenBtn?.querySelector('.icon-compress');
  const iconMobile = viewModeBtn?.querySelector('.icon-mobile');
  const iconBook = viewModeBtn?.querySelector('.icon-book');

  // ---------------------------------------------------------------- rendering
  function renderIndicator({ currentPage, total }) {
    if (pageCurrentEl) pageCurrentEl.textContent = String(currentPage + 1);
    if (pageTotalEl) pageTotalEl.textContent = String(total);
    if (prevBtn) prevBtn.disabled = currentPage <= 0;
    if (nextBtn) nextBtn.disabled = total > 0 && currentPage >= total - 1;
    if (progressFill) {
      const ratio = total > 1 ? currentPage / (total - 1) : 0;
      progressFill.style.transform = `scaleX(${ratio})`;
    }
    if (announcer && total > 0) announcer.textContent = `Pagina ${currentPage + 1} di ${total}`;
  }

  function renderMode({ mode }) {
    const isReader = mode === 'reader';
    if (controlsBar) controlsBar.hidden = isReader;
    if (iconMobile) iconMobile.hidden = isReader;
    if (iconBook) iconBook.hidden = !isReader;
    viewModeBtn?.setAttribute('aria-label', isReader ? 'Passa a Sfoglio 3D' : 'Passa a Modalità Smartphone');
  }

  function renderFullscreen({ isFullscreen }) {
    if (iconExpand) iconExpand.hidden = isFullscreen;
    if (iconCompress) iconCompress.hidden = !isFullscreen;
    fullscreenBtn?.setAttribute('aria-label', isFullscreen ? 'Esci da schermo intero' : 'Schermo intero');
  }

  function renderFontScale({ fontScale }) {
    document.documentElement.style.setProperty('--reader-font-size', `${fontScale.toFixed(2)}rem`);
  }

  const unsubscribe = subscribe((state, changed) => {
    if (changed.some((k) => k === 'currentPage' || k === 'total')) renderIndicator(state);
    if (changed.includes('mode')) renderMode(state);
    if (changed.includes('isFullscreen')) renderFullscreen(state);
    if (changed.includes('fontScale')) renderFontScale(state);
  });

  // ------------------------------------------------------------------ comandi
  const flipTo = (index) => {
    const flip = getFlip();
    const { total } = getState();
    if (!flip || total === 0) return;
    flip.flip(Math.max(0, Math.min(total - 1, index)));
  };

  on(prevBtn, 'click', () => getFlip()?.flipPrev());
  on(nextBtn, 'click', () => getFlip()?.flipNext());
  on(viewModeBtn, 'click', () => {
    setState({ mode: getState().mode === 'flipbook' ? 'reader' : 'flipbook' });
  });

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      const request = document.documentElement.requestFullscreen?.();
      request?.catch(() => {
        if (announcer) announcer.textContent = 'Schermo intero non disponibile su questo dispositivo.';
      });
    } else {
      document.exitFullscreen?.();
    }
  }

  on(fullscreenBtn, 'click', toggleFullscreen);
  on(document, 'fullscreenchange', () => setState({ isFullscreen: !!document.fullscreenElement }));

  // -------------------------------------------------------------- vai a pagina
  function openGoto() {
    if (!popover || !range) return;
    const { currentPage, total } = getState();
    range.max = String(Math.max(1, total));
    range.value = String(currentPage + 1);
    if (rangeValue) rangeValue.textContent = range.value;
    popover.hidden = false;
    indicatorBtn?.setAttribute('aria-expanded', 'true');
    range.focus();
  }

  function closeGoto({ restoreFocus = true } = {}) {
    if (!popover || popover.hidden) return;
    popover.hidden = true;
    indicatorBtn?.setAttribute('aria-expanded', 'false');
    if (restoreFocus) indicatorBtn?.focus();
  }

  on(indicatorBtn, 'click', () => (popover?.hidden ? openGoto() : closeGoto()));
  on(range, 'input', () => {
    if (rangeValue && range) rangeValue.textContent = range.value;
  });
  on($('goto-confirm'), 'click', () => {
    flipTo(Number(range?.value ?? 1) - 1);
    closeGoto();
  });
  on($('goto-cancel'), 'click', () => closeGoto());
  on(document, 'pointerdown', (e) => {
    if (popover && !popover.hidden && !popover.contains(e.target) && !indicatorBtn?.contains(e.target)) {
      closeGoto({ restoreFocus: false });
    }
  });

  // ----------------------------------------------------------------- tastiera
  on(window, 'keydown', (e) => {
    const tag = e.target?.tagName;
    const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable;

    if (e.key === 'Escape') {
      closeGoto();
      return;
    }
    if (isTyping || e.metaKey || e.ctrlKey || e.altKey) return;

    const { mode, total } = getState();

    if (e.key.toLowerCase() === 'f') {
      e.preventDefault();
      toggleFullscreen();
      return;
    }
    if (e.key.toLowerCase() === 'm') {
      e.preventDefault();
      setState({ mode: mode === 'flipbook' ? 'reader' : 'flipbook' });
      return;
    }
    if (mode !== 'flipbook') return;

    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
        e.preventDefault();
        getFlip()?.flipNext();
        break;
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault();
        getFlip()?.flipPrev();
        break;
      case 'Home':
        e.preventDefault();
        flipTo(0);
        break;
      case 'End':
        e.preventDefault();
        flipTo(total - 1);
        break;
      default:
        break;
    }
  });

  // -------------------------------------------------- auto-hide della toolbar
  let idleTimer = null;
  const wake = () => {
    controlsBar?.classList.remove('is-idle');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      const popoverOpen = popover && !popover.hidden;
      const hasFocus = controlsBar?.contains(document.activeElement);
      if (!popoverOpen && !hasFocus) controlsBar?.classList.add('is-idle');
    }, IDLE_HIDE_MS);
  };

  ['pointermove', 'pointerdown', 'keydown', 'focusin'].forEach((type) =>
    on(window, type, wake, { passive: true })
  );
  wake();

  const initial = getState();
  renderIndicator(initial);
  renderMode(initial);
  renderFullscreen(initial);
  renderFontScale(initial);

  teardown = () => {
    controller.abort();
    unsubscribe();
    clearTimeout(idleTimer);
    teardown = null;
  };

  return teardown;
}
