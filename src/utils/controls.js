/**
 * Gestione dei controlli di navigazione, tastiera e fullscreen per il Flipbook
 */

export function setupControls(pageFlip) {
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const pageCurrentEl = document.getElementById('page-current');
  const pageTotalEl = document.getElementById('page-total');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const iconExpand = fullscreenBtn?.querySelector('.icon-expand');
  const iconCompress = fullscreenBtn?.querySelector('.icon-compress');

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
    // Ignora gli eventi se l'utente sta scrivendo in un input
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
}
