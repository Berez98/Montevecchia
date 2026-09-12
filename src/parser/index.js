/**
 * Pipeline di ingestione: testo grezzo -> sezioni -> blocchi -> pagine impaginate.
 */

import { cleanSourceText, isOnlyTemplateComments, splitSections, paginateChunk } from './tokenize.js';
import { renderBlocks, detectPageHeader, wrapBodyPage, formatCoverPage, formatBackcoverPage } from './render.js';
import { SAMPLE_PAGES } from './samples.js';

export { SAMPLE_PAGES };

const DEFAULT_HEADER = 'Rosario a Montevecchia';
const BACKCOVER_MIN_LENGTH = 400;

/**
 * @param {string} rawText contenuto di content/book-source.txt
 * @param {{coverImageUrl?: string, measurer?: {fit: Function}, maxCharsPerPage?: number}} options
 */
export function buildPages(rawText, options = {}) {
  const { coverImageUrl = null, measurer = null, maxCharsPerPage = 620 } = options;

  if (!rawText || typeof rawText !== 'string') return SAMPLE_PAGES;

  const trimmed = cleanSourceText(rawText).trim();
  if (!trimmed || isOnlyTemplateComments(rawText)) return SAMPLE_PAGES;

  const sections = splitSections(trimmed);
  if (sections.length === 0) return SAMPLE_PAGES;

  const pages = [];
  let runningHeader = DEFAULT_HEADER;

  const pushBody = (sectionText) => {
    const detected = detectPageHeader(sectionText);
    if (detected) runningHeader = detected;

    const blocks = renderBlocks(sectionText);
    const bodies = measurer
      ? measurer.fit(blocks, runningHeader)
      : paginateChunk(sectionText, maxCharsPerPage).map((chunk) => renderBlocks(chunk).map((b) => b.html).join(''));

    bodies.forEach((bodyHtml, i) => {
      const pageNumber = pages.length + 1;
      pages.push({
        type: 'text',
        density: 'soft',
        pageNumber,
        isSectionStart: i === 0,
        title: detected || runningHeader,
        header: runningHeader,
        html: wrapBodyPage(bodyHtml, pageNumber, runningHeader)
      });
    });
  };

  sections.forEach((sectionText, index) => {
    const isFirst = index === 0;
    const isLast = index === sections.length - 1;

    if (isFirst) {
      pages.push({
        type: 'cover',
        density: 'hard',
        pageNumber: 1,
        isSectionStart: true,
        title: 'Recita del Santo Rosario',
        header: 'Copertina',
        html: formatCoverPage(sectionText, coverImageUrl)
      });
      return;
    }

    if (isLast) {
      // Una sezione finale corposa va letta come pagina interna, poi si aggiunge la quarta cartonata
      if (sectionText.length > BACKCOVER_MIN_LENGTH) pushBody(sectionText);
      pages.push({
        type: 'backcover',
        density: 'hard',
        pageNumber: pages.length + 1,
        isSectionStart: true,
        title: 'Quarta di Copertina',
        header: 'Quarta di Copertina',
        html: formatBackcoverPage(sectionText)
      });
      return;
    }

    pushBody(sectionText);
  });

  // StPageFlip con showCover richiede un numero pari di fogli per chiudere il libro correttamente
  if (pages.length % 2 !== 0) {
    pages.splice(pages.length - 1, 0, {
      type: 'endpaper',
      density: 'soft',
      pageNumber: pages.length,
      title: 'Risguardo',
      header: '',
      html: `
        <div class="page-content">
          <div class="endpaper-inner">
            <div class="endpaper-ornament">✦</div>
            <p class="endpaper-text">Montevecchia</p>
          </div>
        </div>
      `
    });
  }

  return pages;
}
