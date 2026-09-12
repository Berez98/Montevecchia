/** Escaping e formattazione inline del testo sorgente. */

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Applica grassetto/corsivo Markdown su testo GIÀ passato da escapeHtml. */
export function formatInline(escaped) {
  return escaped
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/«(.*?)»/g, '&laquo;$1&raquo;');
}

/** Scorciatoia per i casi più comuni: escape + inline. */
export function inline(text) {
  return formatInline(escapeHtml(text));
}
