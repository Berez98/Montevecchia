/** Pulizia e segmentazione del testo sorgente grezzo. */

const PAGE_DELIMITER = /[-]{2,}\s*PAGE\s*[-]{2,}/i;
const PAGE_DELIMITER_GLOBAL = /[-]{2,}\s*PAGE\s*[-]{2,}/gi;

const TEMPLATE_HINTS = [
  '# Incolla qui',
  '# Puoi separare',
  '# ---PAGE---',
  '# Se non inserisci',
  '# il testo rispettando'
];

export function isOnlyTemplateComments(text) {
  return text
    .split('\n')
    .every((line) => {
      const l = line.trim();
      return l.length === 0 || l.startsWith('#');
    });
}

export function cleanSourceText(text) {
  const lines = text.split('\n');
  const firstContentIndex = lines.findIndex((line) => {
    const l = line.trim();
    if (l.length === 0) return false;
    return !TEMPLATE_HINTS.some((hint) => l.startsWith(hint));
  });

  return firstContentIndex === -1 ? '' : lines.slice(firstContentIndex).join('\n');
}

export function hasExplicitDelimiter(text) {
  return PAGE_DELIMITER.test(text);
}

export function splitParagraphs(text) {
  return text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

/**
 * Divide il testo in sezioni logiche: sul delimitatore esplicito se presente,
 * altrimenti raggruppando i paragrafi fino a una soglia di caratteri.
 */
export function splitSections(text, fallbackChunkSize = 900) {
  if (hasExplicitDelimiter(text)) {
    return text.split(PAGE_DELIMITER_GLOBAL).map((s) => s.trim()).filter(Boolean);
  }

  const sections = [];
  let group = [];
  let length = 0;

  splitParagraphs(text).forEach((para) => {
    if (length + para.length > fallbackChunkSize && group.length > 0) {
      sections.push(group.join('\n\n'));
      group = [para];
      length = para.length;
    } else {
      group.push(para);
      length += para.length;
    }
  });

  if (group.length > 0) sections.push(group.join('\n\n'));
  return sections;
}

/**
 * Divide un paragrafo in frasi senza lookbehind:
 * la regex `(?<=[.?!»])\s+` non è supportata da Safari < 16.4.
 */
export function splitSentences(text) {
  const terminators = '.?!»';
  const sentences = [];
  let buffer = '';

  for (let i = 0; i < text.length; i++) {
    buffer += text[i];
    if (!terminators.includes(text[i])) continue;

    let j = i + 1;
    while (j < text.length && /\s/.test(text[j])) j++;
    if (j === i + 1) continue; // nessuno spazio dopo: non è fine frase

    sentences.push(buffer.trim());
    buffer = '';
    i = j - 1;
  }

  if (buffer.trim()) sentences.push(buffer.trim());
  return sentences;
}

/** Fallback a caratteri, usato quando la misurazione del DOM non è disponibile. */
export function paginateChunk(text, maxChars = 620) {
  if (text.length <= maxChars) return [text];

  const chunks = [];
  let group = [];
  let length = 0;

  const flush = () => {
    if (group.length > 0) {
      chunks.push(group.join('\n\n'));
      group = [];
      length = 0;
    }
  };

  for (const para of splitParagraphs(text)) {
    if (para.length > maxChars) {
      flush();
      let sentenceGroup = [];
      let sentenceLength = 0;
      for (const sentence of splitSentences(para)) {
        if (sentenceLength + sentence.length > maxChars && sentenceGroup.length > 0) {
          chunks.push(sentenceGroup.join(' '));
          sentenceGroup = [sentence];
          sentenceLength = sentence.length;
        } else {
          sentenceGroup.push(sentence);
          sentenceLength += sentence.length;
        }
      }
      if (sentenceGroup.length > 0) {
        group.push(sentenceGroup.join(' '));
        length = sentenceLength;
      }
    } else if (length + para.length > maxChars && group.length > 0) {
      chunks.push(group.join('\n\n'));
      group = [para];
      length = para.length;
    } else {
      group.push(para);
      length += para.length;
    }
  }

  flush();
  return chunks;
}
