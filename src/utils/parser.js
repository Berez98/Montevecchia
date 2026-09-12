/**
 * Parser e pagine demo editoriali per Web Flipbook
 */

export const SAMPLE_PAGES = [
  {
    type: 'cover',
    density: 'hard',
    html: `
      <div class="page-content cover-inner">
        <div>
          <p class="cover-author">Coppi e Berez</p>
          <div class="cover-ornament"></div>
        </div>
        <div>
          <h1 class="cover-title">Rosario a Montevecchia</h1>
          <p class="cover-subtitle">«Se noi tutti vogliamo cambiare il mondo, cominciamo con noi stessi»</p>
        </div>
        <div>
          <div class="cover-ornament"></div>
          <p style="font-size:0.8rem; letter-spacing:0.1em; opacity:0.8;">EDIZIONE WEB</p>
        </div>
      </div>
    `
  },
  {
    type: 'toc',
    density: 'soft',
    header: 'Sommario',
    html: `
      <div class="page-content page-toc">
        <div>
          <header class="page-header">Indice dei Contenuti</header>
          <h2>Sommario dell'Opera</h2>
        </div>
        <ul class="toc-list">
          <li class="toc-item">
            <span class="toc-title">I. Il richiamo della montagna</span>
            <span class="toc-dots"></span>
            <span class="toc-num">3</span>
          </li>
          <li class="toc-item">
            <span class="toc-title">II. La prima salita verso il colle</span>
            <span class="toc-dots"></span>
            <span class="toc-num">4</span>
          </li>
          <li class="toc-item">
            <span class="toc-title">III. Oltre i ghiacci eterni</span>
            <span class="toc-dots"></span>
            <span class="toc-num">5</span>
          </li>
          <li class="toc-item">
            <span class="toc-title">Note e Ringraziamenti</span>
            <span class="toc-dots"></span>
            <span class="toc-num">6</span>
          </li>
        </ul>
        <footer class="page-footer">2</footer>
      </div>
    `
  },
  {
    type: 'text',
    density: 'soft',
    header: 'Capitolo I — L\'Ascesa',
    html: `
      <div class="page-content">
        <header class="page-header">Capitolo I — Il Richiamo</header>
        <div class="page-body">
          <h2>I. Il richiamo</h2>
          <p class="dropcap">La montagna non si concede mai alla fretta: esige silenzio, respiro costante e un rispetto profondo per ogni singolo passo compiuto sul granito.</p>
          <p>All'alba, la luce cominciava a tingere di rosa le creste più alte, mentre la valle sottostante dormiva ancora avvolta da un mare compatto di nebbie argentee. Il vento recava con sé il profumo pungente della resina di pino e la purezza gelida del ghiacciaio.</p>
          <p>Preparare lo zaino alla vigilia era già parte del rito: la corda, i ramponi lucidati, la borraccia d'alluminio e quella sensazione indescrivibile allo stomaco che precede ogni grande avventura.</p>
        </div>
        <footer class="page-footer">3</footer>
      </div>
    `
  },
  {
    type: 'text',
    density: 'soft',
    header: 'Capitolo II — Il Colle',
    html: `
      <div class="page-content">
        <header class="page-header">Capitolo II — La Salita</header>
        <div class="page-body">
          <h2>II. Verso il colle</h2>
          <p>Superata la fascia boschiva, il sentiero si inerpicava ripido tra morene morenti e sfasciumi. Ogni passo richiedeva concentrazione; un piede mal posato poteva innescare una piccola frana di ghiaia.</p>
          <p>Eppure, la fatica svaniva a ogni sosta per riprendere fiato: volgendosi indietro, l'orizzonte sembrava allargarsi a dismisura, aprendo quinte su catene montuose fino ad allora invisibili.</p>
          <p>Là dove finisce la terra battuta e comincia la roccia viva, l'uomo ritrova la misura esatta delle proprie forze e l'essenza stessa della libertà.</p>
        </div>
        <footer class="page-footer">4</footer>
      </div>
    `
  },
  {
    type: 'text',
    density: 'soft',
    header: 'Capitolo III — La Vetta',
    html: `
      <div class="page-content">
        <header class="page-header">Capitolo III — La Vetta</header>
        <div class="page-body">
          <h2>III. I ghiacci</h2>
          <p>Giunti al pianoro superiore, il respiro dell'aria sottile si fece sentire con vigore. Il riverbero del sole sulla distesa bianca costringeva a socchiudere gli occhi anche dietro le lenti scure.</p>
          <p>Non c'era rumore se non lo scricchiolio ritmico dei passi e il battito accelerato delle tempie. Quando infine raggiungemmo la cresta culminante, il mondo intero parve inchinarsi in un silenzio perfetto.</p>
          <p>La vetta non è una conquista contro la natura, ma una vittoria contro le proprie paure e incertezze.</p>
        </div>
        <footer class="page-footer">5</footer>
      </div>
    `
  },
  {
    type: 'backcover',
    density: 'hard',
    html: `
      <div class="page-content backcover-inner">
        <div>
          <div class="cover-ornament"></div>
          <p style="font-family: var(--font-serif); font-style: italic; margin-bottom: 1.5rem; color: #e2e8f0;">
            "Sulle cime più alte si comprende che le cose essenziali sono pochissime e il silenzio è la musica più pura."
          </p>
          <div class="cover-ornament"></div>
        </div>
        <div style="margin-top: 2rem;">
          <p style="font-family: var(--font-sans); font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase; color: #64748b;">
            Finito di stampare nel 2026
          </p>
        </div>
      </div>
    `
  }
];

/**
 * Funzione per processare e frammentare testo sorgente grezzo.
 * Supporta la separazione esplicita con '---PAGE---' oppure
 * la frammentazione automatica preservando l'integrità dei paragrafi.
 * 
 * @param {string} rawText - Testo sorgente in arrivo da book-source.txt
 * @param {number} maxCharsPerPage - Soglia caratteri per pagina in modalità automatica
 * @returns {Array<{type: string, density: string, html: string, pageNumber: number}>}
 */
export function parseRawContent(rawText, maxCharsPerPage = 1100) {
  if (!rawText || typeof rawText !== 'string') {
    return SAMPLE_PAGES;
  }

  // Rimuovi eventuali istruzioni iniziali di commento dal template
  const cleanedText = cleanSourceText(rawText);
  const trimmed = cleanedText.trim();

  // Se non c'è testo reale oltre ai commenti del template, restituisci le pagine di prova
  if (!trimmed || isOnlyTemplateComments(rawText)) {
    return SAMPLE_PAGES;
  }

  // 1. Verifica se è presente il delimitatore esplicito (-- PAGE --, ---PAGE---, ecc.)
  let rawPages = [];
  const pageDelimiterRegex = /[-]{2,}\s*PAGE\s*[-]{2,}/i;
  if (pageDelimiterRegex.test(trimmed)) {
    rawPages = trimmed
      .split(/[-]{2,}\s*PAGE\s*[-]{2,}/gi)
      .map(p => p.trim())
      .filter(Boolean);
  } else {
    // 2. Frammentazione automatica rispettando i paragrafi (\n\n)
    const paragraphs = trimmed
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(Boolean);

    let currentParagraphs = [];
    let currentLength = 0;

    paragraphs.forEach((p) => {
      if (currentLength + p.length > maxCharsPerPage && currentParagraphs.length > 0) {
        pages_push(rawPages, currentParagraphs);
        currentParagraphs = [p];
        currentLength = p.length;
      } else {
        currentParagraphs.push(p);
        currentLength += p.length;
      }
    });

    if (currentParagraphs.length > 0) {
      pages_push(rawPages, currentParagraphs);
    }
  }

  if (rawPages.length === 0) {
    return SAMPLE_PAGES;
  }

  // Se abbiamo pagine, calcoliamo testatine dinamiche e layout editoriale
  let currentHeader = 'Rosario a Montevecchia';

  return rawPages.map((pageText, index) => {
    const isFirst = index === 0;
    const isLast = index === rawPages.length - 1;
    const density = (isFirst || isLast) ? 'hard' : 'soft';
    const pageNum = index + 1;

    // Rileva testatina contestuale per la pagina corrente
    const detectedHeader = detectPageHeader(pageText);
    if (detectedHeader) {
      currentHeader = detectedHeader;
    }

    return {
      type: isFirst ? 'cover' : isLast ? 'backcover' : 'text',
      density,
      pageNumber: pageNum,
      html: formatPageContent(pageText, pageNum, isFirst, isLast, currentHeader)
    };
  });
}

function detectPageHeader(text) {
  const misteroMatch = text.match(/(Primo|Secondo|Terzo|Quarto|Quinto)\s+Mistero\s+Glorioso/i);
  if (misteroMatch) {
    return `${misteroMatch[1]} Mistero Glorioso`;
  }
  if (/Intenzioni tratte dal discorso/i.test(text)) {
    return 'Intenzioni di Preghiera';
  }
  if (/Canto finale/i.test(text)) {
    return 'Canto Finale';
  }
  if (/^#{1,3}\s+(.+)$/m.test(text)) {
    const titleMatch = text.match(/^#{1,3}\s+(.+)$/m);
    if (titleMatch && !/foto|immagine/i.test(titleMatch[1])) {
      return titleMatch[1].trim();
    }
  }
  return null;
}

function pages_push(pagesArray, paraList) {
  pagesArray.push(paraList.join('\n\n'));
}

function isOnlyTemplateComments(text) {
  const lines = text.split('\n');
  const nonCommentLines = lines.filter(line => {
    const l = line.trim();
    return l.length > 0 && !l.startsWith('#');
  });
  return nonCommentLines.length === 0;
}

function cleanSourceText(text) {
  const lines = text.split('\n');
  let firstContentIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('# Incolla qui') ||
        line.startsWith('# Puoi separare') ||
        line.startsWith('# ---PAGE---') ||
        line.startsWith('# Se non inserisci') ||
        line.startsWith('# il testo rispettando')) {
      continue;
    }
    if (line.length > 0) {
      firstContentIndex = i;
      break;
    }
  }

  if (firstContentIndex === -1) {
    return '';
  }

  return lines.slice(firstContentIndex).join('\n');
}

/**
 * Formatta un blocco di testo in HTML con classi editoriali
 */
function formatPageContent(text, pageNum, isFirst, isLast, runningHeader = '') {
  if (isFirst) {
    return formatCoverPage(text);
  }

  if (isLast) {
    return formatBackcoverPage(text);
  }

  return formatBodyPage(text, pageNum, runningHeader);
}

function formatCoverPage(text) {
  const lines = text
    .split(/\n+/)
    .map(l => l.trim())
    .filter(Boolean);

  let title = 'Recita del Santo Rosario';
  let subtitle = 'Domenica 13 settembre 2026 – Montevecchia';
  let hasPhotoNote = false;
  let photoNoteText = '';

  lines.forEach(line => {
    const clean = line.replace(/^#+\s*/, '').trim();
    if (/foto|immagine/i.test(clean)) {
      hasPhotoNote = true;
      photoNoteText = clean;
    } else if (/Rosario/i.test(clean)) {
      title = clean;
    } else if (/Montevecchia|settembre|Domenica/i.test(clean)) {
      subtitle = clean;
    }
  });

  return `
    <div class="page-content cover-inner">
      <div class="cover-top">
        <p class="cover-edition">EDIZIONE SPECIALE</p>
        <div class="cover-ornament"></div>
      </div>
      <div class="cover-middle">
        <h1 class="cover-title">${escapeHtml(title)}</h1>
        ${subtitle ? `<p class="cover-subtitle">${escapeHtml(subtitle)}</p>` : ''}
        ${hasPhotoNote ? `
          <div class="cover-photo-frame" title="${escapeHtml(photoNoteText)}">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <span class="photo-caption">${escapeHtml(photoNoteText)}</span>
          </div>
        ` : ''}
      </div>
      <div class="cover-bottom">
        <div class="cover-ornament"></div>
        <p class="cover-location">Santuario Beata Vergine del Carmelo</p>
      </div>
    </div>
  `;
}

function formatBackcoverPage(text) {
  const clean = text.replace(/^#+\s*/, '').trim();
  const paragraphs = clean
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);

  const quotePara = paragraphs.filter(p => !p.startsWith('Tratto da')).join('\n\n');
  const sourcePara = paragraphs.find(p => p.startsWith('Tratto da'));

  return `
    <div class="page-content backcover-inner">
      <div class="cover-ornament"></div>
      <div class="backcover-quote">
        <p style="font-family: var(--font-serif); font-style: italic; line-height: 1.5; font-size: 0.92rem; color: #e2e8f0;">
          ${formatInline(escapeHtml(quotePara))}
        </p>
        ${sourcePara ? `
          <p class="backcover-source" style="font-family: var(--font-sans); font-size: 0.75rem; letter-spacing: 0.05em; color: var(--text-cover-gold); margin-top: 1rem;">
            ${escapeHtml(sourcePara)}
          </p>
        ` : ''}
      </div>
      <div class="cover-ornament"></div>
      <div style="margin-top: 1.5rem;">
        <p style="font-family: var(--font-sans); font-size: 0.72rem; letter-spacing: 0.15em; text-transform: uppercase; color: #64748b;">
          Montevecchia • 2026
        </p>
      </div>
    </div>
  `;
}

function formatBodyPage(text, pageNum, runningHeader) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);

  let firstTextSeen = false;

  const formattedElements = paragraphs.map((p) => {
    // Intestazioni mistero glorioso
    const mysteryMatch = p.match(/^(Primo|Secondo|Terzo|Quarto|Quinto)\s+Mistero\s+Glorioso:\s*(.*)/i);
    if (mysteryMatch) {
      return `
        <div class="mystery-heading">
          <span class="mystery-number">${escapeHtml(mysteryMatch[1])} Mistero Glorioso</span>
          <h2 class="mystery-name">${escapeHtml(mysteryMatch[2])}</h2>
        </div>
      `;
    }

    if (/^Canto finale/i.test(p)) {
      return `<h2 class="section-title">${escapeHtml(p)}</h2>`;
    }

    if (p.startsWith('### ')) {
      return `<h3>${escapeHtml(p.replace(/^###\s+/, ''))}</h3>`;
    }
    if (p.startsWith('## ') || p.startsWith('# ')) {
      return `<h2>${escapeHtml(p.replace(/^#+\s+/, ''))}</h2>`;
    }

    // Preghiere stanziali in versi (O Gesù mio, Padre Nostro...)
    if (/^(O Gesù mio|Padre Nostro|Ave Maria|Gloria al padre)/i.test(p)) {
      const verseHtml = p
        .split('\n')
        .map(line => escapeHtml(line.trim()))
        .join('<br>');
      return `<div class="prayer-stanza">${verseHtml}</div>`;
    }

    // Intenzioni di preghiera
    if (/^PREGHIAMO/i.test(p)) {
      return `
        <div class="prayer-intention">
          <span class="intention-marker">✦</span>
          <p>${formatInline(escapeHtml(p))}</p>
        </div>
      `;
    }

    // Citazioni fonte (es. Tratto da...)
    if (/^Tratto da/i.test(p)) {
      return `<p class="source-credit"><em>${escapeHtml(p)}</em></p>`;
    }

    // Ellissi o separatori
    if (p === '…' || p === '...') {
      return `<div class="text-ellipsis">❦</div>`;
    }

    // Citazioni / Epigrafi con >
    if (p.startsWith('> ')) {
      const quoteText = p.replace(/^>\s*/gm, '');
      return `<blockquote>${formatInline(escapeHtml(quoteText))}</blockquote>`;
    }

    // Paragrafo standard con drop cap iniziale se è il primo paragrafo
    const isDropcap = !firstTextSeen ? 'class="dropcap"' : '';
    firstTextSeen = true;

    // Se ci sono ritorni a capo singoli all'interno del paragrafo, preservali
    const contentWithBreaks = p
      .split('\n')
      .map(line => formatInline(escapeHtml(line.trim())))
      .join('<br>');

    return `<p ${isDropcap}>${contentWithBreaks}</p>`;
  }).join('');

  const displayHeader = runningHeader || 'Rosario a Montevecchia';

  return `
    <div class="page-content">
      <header class="page-header">${escapeHtml(displayHeader)}</header>
      <div class="page-body">
        ${formattedElements}
      </div>
      <footer class="page-footer">
        <span class="page-footer-content">${pageNum}</span>
      </footer>
    </div>
  `;
}

function formatInline(str) {
  return str
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/«(.*?)»/g, '&laquo;$1&raquo;');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
