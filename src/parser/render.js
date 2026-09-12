/** Rendering dei blocchi editoriali in HTML. */

import { escapeHtml, formatInline, inline } from './inline.js';
import { splitParagraphs } from './tokenize.js';

const DEFAULT_HEADER = 'Rosario a Montevecchia';

export function detectPageHeader(text) {
  const mistero = text.match(/(Primo|Secondo|Terzo|Quarto|Quinto)\s+Mistero\s+Glorioso/i);
  if (mistero) return `${mistero[1]} Mistero Glorioso`;
  if (/Intenzioni tratte|L’amore è la forza|San Giovanni Paolo/i.test(text)) return 'Intenzioni di Preghiera';
  if (/Canto finale|Ave Maria, splendore/i.test(text)) return 'Canto Finale';
  if (/Quos redemisti|Giussani|C’è un nulla che non viene perduto/i.test(text)) return 'Riflessione Conclusiva';

  const heading = text.match(/^#{1,3}\s+(.+)$/m);
  if (heading && !/foto|immagine/i.test(heading[1])) return heading[1].trim();
  return null;
}

function verses(paragraph) {
  return paragraph.split('\n').map((line) => escapeHtml(line.trim())).join('<br>');
}

/**
 * Converte una sezione di testo in blocchi HTML indipendenti.
 * `keepWithNext` segnala i titoli, che non devono restare orfani a fine pagina.
 */
export function renderBlocks(sectionText) {
  let dropcapUsed = false;

  return splitParagraphs(sectionText).map((p) => {
    const mystery = p.match(/^(Primo|Secondo|Terzo|Quarto|Quinto)\s+Mistero\s+Glorioso:\s*(.*)/i);
    if (mystery) {
      return {
        keepWithNext: true,
        html: `<div class="mystery-heading"><span class="mystery-number">${escapeHtml(mystery[1])} Mistero Glorioso</span><h2 class="mystery-name">${escapeHtml(mystery[2])}</h2></div>`
      };
    }

    if (/^Canto finale/i.test(p)) {
      return { keepWithNext: true, html: `<h2 class="section-title">${escapeHtml(p)}</h2>` };
    }
    if (p.startsWith('### ')) {
      return { keepWithNext: true, html: `<h3>${escapeHtml(p.replace(/^###\s+/, ''))}</h3>` };
    }
    if (p.startsWith('## ') || p.startsWith('# ')) {
      return { keepWithNext: true, html: `<h2>${escapeHtml(p.replace(/^#+\s+/, ''))}</h2>` };
    }
    if (p === 'Ave Maria, splendore del mattino') {
      return { keepWithNext: true, html: `<h2 class="hymn-title">${escapeHtml(p)}</h2>` };
    }

    if (/^In questo mistero/i.test(p)) {
      return { html: `<p class="mystery-reflection"><em>${escapeHtml(p)}</em></p>` };
    }
    if (/^Maria Regina della Pace/i.test(p)) {
      return { html: `<p class="prayer-response"><em>${escapeHtml(p)}</em></p>` };
    }
    if (/^(O Gesù mio|Padre Nostro|Ave Maria|Gloria al padre)/i.test(p) && !p.startsWith('Ave Maria, splendore')) {
      return { html: `<div class="prayer-stanza">${verses(p)}</div>` };
    }
    if (/^(Ave Maria, splendore|Madre non sono degno|Madre tu che soccorri|Protegga il nostro popolo)/i.test(p)) {
      return { html: `<div class="hymn-stanza">${verses(p)}</div>` };
    }
    if (/^Intenzioni tratte/i.test(p)) {
      return { html: `<p class="source-note"><em>${escapeHtml(p)}</em></p>` };
    }
    if (/^PREGHIAMO/i.test(p)) {
      return { html: `<div class="prayer-intention"><p>${inline(p)}</p></div>` };
    }
    if (/^Tratto da/i.test(p)) {
      return { html: `<p class="source-credit"><em>${escapeHtml(p)}</em></p>` };
    }
    if (p === '…' || p === '...') {
      return { html: '<div class="editorial-divider"></div>' };
    }
    if (p.startsWith('> ')) {
      return { html: `<blockquote>${formatInline(escapeHtml(p.replace(/^>\s*/gm, '')))}</blockquote>` };
    }

    const isNarrative = !dropcapUsed && p.length > 80 && !p.startsWith('«') && !p.startsWith('"');
    dropcapUsed = true;
    const body = p.split('\n').map((line) => inline(line.trim())).join('<br>');
    return { html: `<p${isNarrative ? ' class="dropcap"' : ''}>${body}</p>` };
  });
}

export function wrapBodyPage(blocksHtml, pageNum, runningHeader) {
  return `
    <div class="page-content">
      <header class="page-header">${escapeHtml(runningHeader || DEFAULT_HEADER)}</header>
      <div class="page-body">${blocksHtml}</div>
      <footer class="page-footer"><span class="page-footer-content">${pageNum}</span></footer>
    </div>
  `;
}

export function formatCoverPage(text, coverImageUrl = null) {
  let title = 'Recita del Santo Rosario';
  let subtitle = 'Domenica 13 settembre 2026 – Montevecchia';
  let photoNote = '';

  text.split(/\n+/).map((l) => l.trim()).filter(Boolean).forEach((line) => {
    const clean = line.replace(/^#+\s*/, '').trim();
    if (/foto|immagine/i.test(clean)) photoNote = clean;
    else if (/Rosario/i.test(clean)) title = clean;
    else if (/Montevecchia|settembre|Domenica/i.test(clean)) subtitle = clean;
  });

  let media = '';
  if (coverImageUrl) {
    media = `
      <div class="cover-photo-wrapper">
        <img src="${escapeHtml(coverImageUrl)}" alt="Rosa Mistica" class="cover-photo" width="145" height="145" decoding="async" />
      </div>`;
  } else if (photoNote) {
    media = `
      <div class="cover-photo-frame">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
        <span class="photo-caption">${escapeHtml(photoNote)}</span>
      </div>`;
  }

  return `
    <div class="page-content cover-inner">
      <div class="cover-top">
        <p class="cover-edition">EDIZIONE SPECIALE</p>
        <div class="cover-ornament"></div>
      </div>
      <div class="cover-middle">
        <h1 class="cover-title">${escapeHtml(title)}</h1>
        ${subtitle ? `<p class="cover-subtitle">${escapeHtml(subtitle)}</p>` : ''}
        ${media}
      </div>
      <div class="cover-bottom">
        <div class="cover-ornament"></div>
        <p class="cover-location">Santuario Beata Vergine del Carmelo</p>
      </div>
    </div>
  `;
}

const FALLBACK_BACKCOVER_QUOTE =
  '«Quos redemisti, tu conserva, Christe»: quelli che tu hai redenti - quelli che tu hai voluto, progettati per te -, tu salvali, tu conservali, Cristo. La gioia è la sicurezza che avviene nel mondo per il fatto di essere stati toccati dal Mistero, nel possesso di Cristo.';

export function formatBackcoverPage(text) {
  const paragraphs = splitParagraphs(text.replace(/^#+\s*/, '').trim());
  const source = paragraphs.find((p) => p.startsWith('Tratto da')) || 'Tratto da L. Giussani, 30/4/2000';
  let quote = paragraphs.filter((p) => !p.startsWith('Tratto da')).join('\n\n');
  if (quote.length > 250) quote = FALLBACK_BACKCOVER_QUOTE;

  return `
    <div class="page-content backcover-inner">
      <div class="cover-ornament"></div>
      <div class="backcover-quote">
        <p class="backcover-text">${inline(quote)}</p>
        <p class="backcover-source">${escapeHtml(source)}</p>
      </div>
      <div class="cover-ornament"></div>
      <div class="backcover-imprint">
        <p>Montevecchia • 2026</p>
      </div>
    </div>
  `;
}
