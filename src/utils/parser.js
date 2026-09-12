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
export function parseRawContent(rawText, maxCharsPerPage = 1200) {
  if (!rawText || typeof rawText !== 'string') {
    return SAMPLE_PAGES;
  }

  const trimmed = rawText.trim();
  if (!trimmed) {
    return SAMPLE_PAGES;
  }

  // 1. Verifica se è presente il delimitatore esplicito ---PAGE---
  if (trimmed.includes('---PAGE---')) {
    const rawPages = trimmed
      .split(/---PAGE---/g)
      .map(p => p.trim())
      .filter(Boolean);

    return rawPages.map((pageText, index) => {
      const isFirst = index === 0;
      const isLast = index === rawPages.length - 1;
      const density = (isFirst || isLast) ? 'hard' : 'soft';
      const pageNum = index + 1;

      return {
        type: isFirst ? 'cover' : isLast ? 'backcover' : 'text',
        density,
        pageNumber: pageNum,
        html: formatPageContent(pageText, pageNum, isFirst, isLast)
      };
    });
  }

  // 2. Frammentazione automatica rispettando i paragrafi (\n\n)
  const paragraphs = trimmed
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);

  const pages = [];
  let currentParagraphs = [];
  let currentLength = 0;

  paragraphs.forEach((p) => {
    if (currentLength + p.length > maxCharsPerPage && currentParagraphs.length > 0) {
      pages.push(currentParagraphs);
      currentParagraphs = [p];
      currentLength = p.length;
    } else {
      currentParagraphs.push(p);
      currentLength += p.length;
    }
  });

  if (currentParagraphs.length > 0) {
    pages.push(currentParagraphs);
  }

  return pages.map((paraGroup, index) => {
    const isFirst = index === 0;
    const isLast = index === pages.length - 1;
    const density = (isFirst || isLast) ? 'hard' : 'soft';
    const pageNum = index + 1;
    const pageContent = paraGroup.join('\n\n');

    return {
      type: isFirst ? 'cover' : isLast ? 'backcover' : 'text',
      density,
      pageNumber: pageNum,
      html: formatPageContent(pageContent, pageNum, isFirst, isLast)
    };
  });
}

/**
 * Formatta un blocco di testo in HTML con classi editoriali
 */
function formatPageContent(text, pageNum, isFirst, isLast) {
  if (isFirst) {
    return `
      <div class="page-content cover-inner">
        <div>
          <p class="cover-author">Opera Inedita</p>
          <div class="cover-ornament"></div>
        </div>
        <div>
          <h1 class="cover-title">${escapeHtml(text.slice(0, 60))}</h1>
        </div>
        <div>
          <div class="cover-ornament"></div>
        </div>
      </div>
    `;
  }

  if (isLast) {
    return `
      <div class="page-content backcover-inner">
        <div class="cover-ornament"></div>
        <p style="font-family: var(--font-serif); font-style: italic;">${escapeHtml(text)}</p>
        <div class="cover-ornament"></div>
      </div>
    `;
  }

  const paragraphs = text
    .split(/\n+/)
    .map(p => p.trim())
    .filter(Boolean);

  const formattedParas = paragraphs.map((p, i) => {
    const isDropcap = i === 0 ? 'class="dropcap"' : '';
    return `<p ${isDropcap}>${escapeHtml(p)}</p>`;
  }).join('');

  return `
    <div class="page-content">
      <header class="page-header">Pagina ${pageNum}</header>
      <div class="page-body">
        ${formattedParas}
      </div>
      <footer class="page-footer">${pageNum}</footer>
    </div>
  `;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
