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

/** Elementi il cui contenuto può essere spezzato su più pagine. */
const SPLITTABLE = new Set(['P', 'BLOCKQUOTE', 'DIV']);

/**
 * Posizioni di inizio frase, senza alterare il testo (a differenza di
 * `splitSentences`, che normalizza gli spazi).
 */
function sentenceStarts(text) {
  const terminators = '.?!»';
  const starts = [];

  for (let i = 0; i < text.length - 1; i++) {
    if (!terminators.includes(text[i])) continue;
    let j = i + 1;
    while (j < text.length && /\s/.test(text[j])) j++;
    if (j === i + 1 || j >= text.length) continue;
    starts.push(j);
    i = j - 1;
  }

  return starts;
}

/** Sposta l'ultima unità (elemento o frase) dalla fine di `from` all'inizio di `to`. */
function moveLastUnit(from, to) {
  const last = from.lastChild;
  if (!last) return false;

  if (last.nodeType === Node.TEXT_NODE) {
    const starts = sentenceStarts(last.data);
    if (starts.length > 0) {
      const cut = starts[starts.length - 1];
      const tail = last.data.slice(cut);
      last.data = last.data.slice(0, cut);
      to.insertBefore(document.createTextNode(tail), to.firstChild);
      return true;
    }
  }

  to.insertBefore(last, to.firstChild);
  return true;
}

export function createMeasurer(pageBox) {  const host = document.createElement('div');
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

  const appendHtml = (html) => {
    template.innerHTML = html.trim();
    const node = template.content.firstElementChild;
    if (node) bodyEl.appendChild(node);
    return node;
  };

  /**
   * Riduce un blocco più alto dell'intera pagina finché non entra e restituisce
   * la coda da riportare sulla pagina successiva (null se non è divisibile).
   */
  function splitOverflowing(node) {
    if (!SPLITTABLE.has(node.tagName)) return null;

    const rest = node.cloneNode(false);
    rest.classList.remove('dropcap');
    let guard = 500;

    while (overflows() && guard-- > 0) {
      if (!moveLastUnit(node, rest)) break;
      if (!node.childNodes.length) break;
    }

    if (overflows() || !node.childNodes.length || !rest.childNodes.length) return null;
    return rest;
  }

  /**
   * Distribuisce i blocchi di una sezione su una o più pagine.
   * @param {Array<{html: string, keepWithNext?: boolean}>} blocks
   * @returns {Array<string>} HTML del corpo di ogni pagina
   */
  function fit(blocks, header = '') {
    headerEl.textContent = header || 'Rosario a Montevecchia';
    bodyEl.innerHTML = '';

    const pages = [];
    const queue = blocks.slice();
    let current = [];

    while (queue.length > 0) {
      const block = queue.shift();
      const node = appendHtml(block.html);
      if (!node) continue;

      if (!overflows()) {
        current.push(block);
        continue;
      }

      // Un blocco più alto di una pagina intera va spezzato, altrimenti verrebbe tagliato
      if (current.length === 0) {
        const rest = splitOverflowing(node);
        if (!rest) {
          current.push(block);
          continue;
        }
        pages.push(node.outerHTML);
        queue.unshift({ ...block, html: rest.outerHTML, keepWithNext: false });
        bodyEl.innerHTML = '';
        continue;
      }

      node.remove();

      // Trascina in pagina nuova i titoli rimasti orfani in coda
      const carried = [];
      while (current.length > 1 && current[current.length - 1].keepWithNext) {
        carried.unshift(current.pop());
      }

      pages.push(current.map((b) => b.html).join(''));
      current = [];
      bodyEl.innerHTML = '';
      queue.unshift(...carried, block);
    }

    if (current.length > 0) pages.push(current.map((b) => b.html).join(''));
    return pages.length > 0 ? pages : [''];
  }

  function destroy() {
    host.remove();
  }

  return { fit, destroy };
}
