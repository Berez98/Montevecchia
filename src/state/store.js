/**
 * Stato applicativo condiviso fra flipbook, reader e controlli.
 * Le viste si sottoscrivono invece di manipolarsi a vicenda.
 */

const STORAGE_KEY = 'monteflipbook:v1';
const PERSISTED_KEYS = ['mode', 'currentPage', 'fontScale'];

const state = {
  pages: [],
  total: 0,
  mode: 'flipbook', // 'flipbook' | 'reader'
  currentPage: 0,
  fontScale: 1.05,
  isFullscreen: false,
  status: 'loading' // 'loading' | 'ready' | 'error'
};

const listeners = new Set();

function readStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    // localStorage può lanciare in navigazione privata su Safari
    return null;
  }
}

function writeStorage() {
  try {
    const payload = {};
    PERSISTED_KEYS.forEach((k) => { payload[k] = state[k]; });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota o accesso negato: la persistenza è opzionale */
  }
}

export function restorePersistedState() {
  const saved = readStorage();
  if (!saved) return;
  if (saved.mode === 'reader' || saved.mode === 'flipbook') state.mode = saved.mode;
  if (Number.isInteger(saved.currentPage) && saved.currentPage >= 0) state.currentPage = saved.currentPage;
  if (typeof saved.fontScale === 'number' && saved.fontScale >= 0.85 && saved.fontScale <= 1.45) {
    state.fontScale = saved.fontScale;
  }
}

export function getState() {
  return { ...state };
}

export function setState(patch) {
  const changed = [];
  for (const [key, value] of Object.entries(patch)) {
    if (state[key] !== value) {
      state[key] = value;
      changed.push(key);
    }
  }
  if (changed.length === 0) return;

  if (changed.some((k) => PERSISTED_KEYS.includes(k))) writeStorage();
  const snapshot = getState();
  listeners.forEach((fn) => fn(snapshot, changed));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
