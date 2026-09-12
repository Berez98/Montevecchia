/**
 * Impaginazione basata sulla misura reale del testo: i blocchi vengono inseriti
 * in una pagina fuori schermo con gli stessi stili finché non trabocca.
 */

const PAGE_RATIO = 450 / 600;
const SPREAD_BREAKPOINT = 700;

/** Stima la dimensione di una pagina replicando la logica `size: 'stretch'` di StPageFlip. */
export function computePageBox(container) {
  if (!container) return null;
  const rect = container.getBoundingClientRect();
  if (rect.width < 10 || rect.height < 10) return null;

  const isPortrait = rect.width < SPREAD_BREAKPOINT;
  const availableWidth = isPortrait ? rect.width : rect.width / 2;

  let height = Math.min(rect.height, 850);
  let width = height * PAGE_RATIO;

  if (width > availableWidth) {
    width = availableWidth;
    height = width / PAGE_RATIO;
  }

  width = Math.max(260, Math.min(600, width));
  height = Math.max(380, Math.min(850, width / PAGE_RATIO));

  return { width: Math.round(width), height: Math.round(height), isPortrait };
}

export function createMeasurer(pageBox) {
  const host = document.createElement('div');
  host.className = 'page --right page-measure';
  host.setAttribute('aria-hidden', 'true');
  host.style.width = `${pageBox.width}px`;
  host.style.height = `${pageBox.height}px`;
  host.innerHTML = `
    <div class="page-content">
      <header class="page-header">Misurazione</header>
      <div class="page-body"></div>
      <footer class="page-footer"><span class="page-footer-content">88</span></footer>
    </div>
  `;
  document.body.appendChild(host);

  const bodyEl = host.querySelector('.page-body');
  const headerEl = host.querySelector('.page-header');
  const template = document.createElement('template');

  const overflows = () => bodyEl.scrollHeight > bodyEl.clientHeight;

  /**
   * Distribuisce i blocchi di una sezione su una o più pagine.
   * @param {Array<{html: string, keepWithNext?: boolean}>} blocks
   * @returns {Array<string>} HTML del corpo di ogni pagina
   */
  function fit(blocks, header = '') {
    headerEl.textContent = header || 'Rosario a Montevecchia';
    bodyEl.innerHTML = '';

    const pages = [];
    let current = [];

    for (const block of blocks) {
      template.innerHTML = block.html.trim();
      const node = template.content.firstElementChild;
      if (!node) continue;

      bodyEl.appendChild(node);

      if (!overflows() || current.length === 0) {
        current.push(block);
        continue;
      }

      // Trascina in pagina nuova i titoli rimasti orfani in coda
      const carried = [];
      while (current.length > 0 && current[current.length - 1].keepWithNext) {
        carried.unshift(current.pop());
      }
      if (current.length === 0) {
        current = carried.slice();
        carried.length = 0;
      }

      pages.push(current.map((b) => b.html).join(''));
      current = [...carried, block];

      bodyEl.innerHTML = '';
      current.forEach((b) => {
        template.innerHTML = b.html.trim();
        if (template.content.firstElementChild) bodyEl.appendChild(template.content.firstElementChild);
      });
    }

    if (current.length > 0) pages.push(current.map((b) => b.html).join(''));
    return pages.length > 0 ? pages : [''];
  }

  function destroy() {
    host.remove();
  }

  return { fit, destroy };
}
