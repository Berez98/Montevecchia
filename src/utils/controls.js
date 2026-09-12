/**
 * Gestione dei controlli di navigazione, tastiera, fullscreen e modalità smartphone
 */

export function setupControls(pageFlip) {
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const pageCurrentEl = document.getElementById('page-current');
  const pageTotalEl = document.getElementById('page-total');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const viewModeBtn = document.getElementById('view-mode-btn');
  const iconExpand = fullscreenBtn?.querySelector('.icon-expand');
  const iconCompress = fullscreenBtn?.querySelector('.icon-compress');
  const iconMobile = viewModeBtn?.querySelector('.icon-mobile');
  const iconBook = viewModeBtn?.querySelector('.icon-book');

  const bookContainer = document.getElementById('book-container');
  const mobileReader = document.getElementById('mobile-reader');
  const controlsBar = document.getElementById('controls');

  let currentMode = 'flipbook'; // 'flipbook' | 'reader'

  const totalPages = pageFlip.getPageCount();
  if (pageTotalEl) {
    pageTotalEl.textContent = totalPages;
  }

  // Aggiorna l'indicatore di pagina e lo stato dei bottoni
  function updateIndicator(currentPageIndex) {
    const displayPage = currentPageIndex + 1;
    if (pageCurrentEl) {
      pageCurrentEl.textContent = displayPage;
    }

    if (prevBtn) {
      prevBtn.disabled = currentPageIndex <= 0;
    }
    if (nextBtn) {
      nextBtn.disabled = currentPageIndex >= totalPages - 1;
    }
  }

  // Listener pulsanti Toolbar
  prevBtn?.addEventListener('click', () => {
    pageFlip.flipPrev();
  });

  nextBtn?.addEventListener('click', () => {
    pageFlip.flipNext();
  });

  // Navigazione da tastiera
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault();
      pageFlip.flipNext();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      pageFlip.flipPrev();
    }
  });

  // Gestione Fullscreen
  fullscreenBtn?.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn(`Errore durante l'attivazione del fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  });

  document.addEventListener('fullscreenchange', () => {
    const isFs = !!document.fullscreenElement;
    if (iconExpand && iconCompress) {
      iconExpand.style.display = isFs ? 'none' : 'block';
      iconCompress.style.display = isFs ? 'block' : 'none';
    }
  });

  // Sincronizzazione con gli eventi della libreria PageFlip
  pageFlip.on('flip', (e) => {
    updateIndicator(e.data);
  });

  pageFlip.on('changeState', () => {
    updateIndicator(pageFlip.getCurrentPageIndex());
  });

  // Inizializzazione stato iniziale
  updateIndicator(pageFlip.getCurrentPageIndex());

  // =========================================================================
  // Switch tra Modalità Flipbook 3D e Modalità Smartphone (Lettura Continua)
  // =========================================================================
  function setViewMode(mode) {
    currentMode = mode;
    if (mode === 'reader') {
      if (bookContainer) bookContainer.style.display = 'none';
      if (mobileReader) mobileReader.style.display = 'flex';
      if (controlsBar) controlsBar.style.display = 'none';

      if (iconMobile && iconBook) {
        iconMobile.style.display = 'none';
        iconBook.style.display = 'block';
      }
      viewModeBtn?.setAttribute('title', 'Passa a Sfoglio 3D (Flipbook)');
      viewModeBtn?.setAttribute('aria-label', 'Passa a Sfoglio 3D');

      // Scroll all'inizio del mobile reader
      mobileReader?.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      if (bookContainer) bookContainer.style.display = 'flex';
      if (mobileReader) mobileReader.style.display = 'none';
      if (controlsBar) controlsBar.style.display = 'flex';

      if (iconMobile && iconBook) {
        iconMobile.style.display = 'block';
        iconBook.style.display = 'none';
      }
      viewModeBtn?.setAttribute('title', 'Modalità Smartphone (Scorrimento)');
      viewModeBtn?.setAttribute('aria-label', 'Passa a Modalità Smartphone');

      // Ricalcola layout PageFlip se necessario
      setTimeout(() => {
        try {
          pageFlip.update();
        } catch (_) {}
      }, 50);
    }
  }

  viewModeBtn?.addEventListener('click', () => {
    setViewMode(currentMode === 'flipbook' ? 'reader' : 'flipbook');
  });

  // Eventi specifici del Mobile Reader (inizializzati dopo la generazione del DOM)
  setupReaderControls(setViewMode);
}

function setupReaderControls(setViewMode) {
  const switchFlipBtn = document.getElementById('reader-switch-flip-btn');
  const tocToggleBtn = document.getElementById('reader-toc-toggle-btn');
  const drawer = document.getElementById('reader-drawer');
  const fontDecBtn = document.getElementById('reader-font-dec');
  const fontIncBtn = document.getElementById('reader-font-inc');
  const backToTopBtn = document.getElementById('reader-back-to-top');
  const mobileReader = document.getElementById('mobile-reader');

  // Torna allo sfoglio 3D dal topbar del reader
  switchFlipBtn?.addEventListener('click', () => {
    setViewMode('flipbook');
  });

  // Toggle cassetto indice
  tocToggleBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    drawer?.classList.toggle('is-open');
  });

  document.addEventListener('click', (e) => {
    if (drawer && !drawer.contains(e.target) && e.target !== tocToggleBtn) {
      drawer.classList.remove('is-open');
    }
  });

  // Link indice: scorrimento fluido alla sezione selezionata
  const tocLinks = document.querySelectorAll('.reader-toc-link');
  tocLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetEl = document.querySelector(targetId);
      if (targetEl && mobileReader) {
        drawer?.classList.remove('is-open');
        const offsetTop = targetEl.offsetTop - 60;
        mobileReader.scrollTo({ top: offsetTop, behavior: 'smooth' });
      }
    });
  });

  // Regolazione dimensione carattere
  let currentFontSize = 1.05;
  fontIncBtn?.addEventListener('click', () => {
    if (currentFontSize < 1.45) {
      currentFontSize += 0.1;
      document.documentElement.style.setProperty('--reader-font-size', `${currentFontSize.toFixed(2)}rem`);
    }
  });

  fontDecBtn?.addEventListener('click', () => {
    if (currentFontSize > 0.85) {
      currentFontSize -= 0.1;
      document.documentElement.style.setProperty('--reader-font-size', `${currentFontSize.toFixed(2)}rem`);
    }
  });

  // Torna in cima
  mobileReader?.addEventListener('scroll', () => {
    if (backToTopBtn) {
      if (mobileReader.scrollTop > 300) {
        backToTopBtn.classList.add('is-visible');
      } else {
        backToTopBtn.classList.remove('is-visible');
      }
    }
  });

  backToTopBtn?.addEventListener('click', () => {
    mobileReader?.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
