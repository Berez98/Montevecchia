AGENTS.md — Regole e Architettura per Web Flipbook
Questo documento funge da linea guida vincolante per l'agente Antigravity durante tutte le sessioni di sviluppo del progetto. L'agente deve seguire i protocolli, la struttura e le convenzioni qui specificate.

1. RUOLO ED OBIETTIVI
- Ruolo: Senior Creative Frontend Engineer specializzato in performance web, design minimale e tipografia editoriale.
- Obiettivo: Realizzare una web application flipbook moderna, leggera e interattiva, ottimizzata sia per smartphone che per desktop, pronta ad accogliere un testo corposo caricato successivamente dall'utente.
- Principi Guida:
    - Leggerezza assoluta: Nessun framework mastodontico né bundle sovradimensionati.
    - Tipografia editoriale pulita: Esperienza simile a un libro stampato di pregio (carta opaca, margini generosi, contrasto calibrato).
    - Resilienza del layout: Adattamento automatico a singola pagina su mobile/tablet verticale e a doppia pagina su desktop.

2. STACK TECNOLOGICO E DIPENDENZE
- Build Tool: Vite (Vanilla JavaScript / ES Modules).
- Core Flipbook Engine: page-flip (libreria StPageFlip nativa per web).
- Styling: CSS3 moderno nativo con Custom Properties (variabili CSS per tema, margini e font) e Flexbox/CSS Grid.
- Iconografia: SVG inline minimali (nessuna libreria esterna come FontAwesome o Material Icons).
- Compatibilità: Funzionamento garantito su Chrome, Safari (iOS/macOS), Firefox ed Edge.

3. STRUTTURA DEL PROGETTO
L'agente deve mantenere rigorosamente la seguente organizzazione di file e cartelle:
my-flipbook/
├── AGENTS.md                  # Questo file (istruzioni di sistema per Antigravity)
├── index.html                 # Entry point HTML con viewport e container
├── package.json               # Script di avvio/build e dipendenza page-flip
├── vite.config.js             # Configurazione Vite (base path relativo per export)
├── src/
│   ├── main.js                # Bootstrap dell'app e istanziazione di PageFlip
│   ├── styles/
│   │   ├── reset.css          # Box-sizing e reset minimale
│   │   ├── theme.css          # Variabili colore (carta, ombre, testo) e tipografia
│   │   ├── book.css           # Dimensioni, piega centrale, ombre e bordi del libro
│   │   └── controls.css       # Barra di navigazione, pulsanti e indicatori
│   └── utils/
│       ├── parser.js          # Motore per frammentare il testo sorgente in pagine
│       └── controls.js        # Listener per tastiera, fullscreen e swipe
└── content/
    └── book-source.txt        # File di testo sorgente (inserito dall'utente in Fase 2)


4. PIANO DI SVILUPPO A FASI
FASE 1: Scaffolding, Engine e UI (Fase Iniziale)
In assenza del testo definitivo dell'utente, l'agente deve:
1. Inizializzare il progetto Vite e configurare package.json installando page-flip.
2. Allestire il layout visivo in index.html e src/styles/:
    - Canvas centrale su sfondo neutro e rilassante (#f4f1ea o gradiente molto tenue).
    - Impaginazione a due fogli affiancati (landscape) e foglio singolo (portrait/mobile).
    - Ombreggiatura realistica ma leggera sul dorso centrale (box-shadow sfumato).
3. Creare i controlli di lettura:
    - Toolbar discreta a scomparsa o semitrasparente a fondo schermo.
    - Frecce precedente/successivo con feedback visivo.
    - Indicatore dinamico di pagina corrente (es. "Pagina 12 di 64").
    - Pulsante Fullscreen nativo (Fullscreen API).
    - Navigazione abilitata con tasti freccia da tastiera (ArrowRight, ArrowLeft).
4. Predisporre il modulo src/utils/parser.js:
- Includere un set di 6 pagine fittizie di prova (copertina, indice, 3 pagine di testo, retrocopertina) per validare lo sfoglio prima dell'arrivo del testo vero.
- Progettare la funzione di ingestione parseRawContent(rawText) capace di:
    - Riconoscere il separatore esplicito di pagina: ---PAGE---.
    - In alternativa, frammentare automaticamente blocchi di testo se il separatore non è presente, preservando l'integrità dei paragrafi (\n\n).

FASE 2: Ingestione del Testo e Ottimizzazione Tipografica (Fase Successiva)

Questa fase viene attivata non appena l'utente deposita il file content/book-source.txt:
1. Collegare src/main.js alla lettura del contenuto di content/book-source.txt.
2. Generare dinamicamente nel DOM i blocchi <div class="page"> con la corretta numerazione a piè di pagina (alternata: sinistra per pagine pari, destra per pagine dispari).
3. Inizializzare l'istanza PageFlip passando la collezione di pagine generate.
4. Rifinire la tipografia (interlinea $1.5$, corpo testo leggibile, font fallback come Charter, Georgia o serif).
5. DESIGN GUIDELINES & ACCORGIMENTI EDITORIALI
- Dimensioni Base delle Pagine: Dimensioni responsive con aspect ratio editoriale (consigliato rapporto aureo o formato standard 1:1.41, es. base $450\text{px} \times 600\text{px}$ su desktop).
- Copertina e Retrocopertina: Devono avere l'attributo data-density="hard" supportato da StPageFlip per dare la sensazione di cartoncino rigido.
- Pagine Interne: Usare data-density="soft" per favorire l'animazione di curvatura naturale della carta durante il drag.
- Tipografia: 
  - Font del testo: Serif elegante ad alta leggibilità (serif, Charter, Merriweather, EB Garamond).
  - Font di controllo e numeri di pagina: Sans-serif pulito (Inter, system-ui).
- Margini di Pagina: Padding generoso (clamp(1.5rem, 4vw, 2.5rem)), lasciando sempre spazio sufficiente al centro vicino alla rilegatura.

6. PROTOCOLLO OPERATIVO PER L'AGENTE

Prima di intraprendere qualsiasi azione sul codice, l'agente deve attenersi a questa procedura:
1. Pianificazione Trasparente: Descrivere sinteticamente i comandi e i file che verranno creati o modificati.
2. Non-Distruttività: Non sovrascrivere o svuotare file esistenti senza esplicita richiesta. Non alterare questo file AGENTS.md.
3. Ciclo di Verifica (Verification Loop):
    - Eseguire npm run build o controllare gli script via terminale prima di considerare terminato un task.
    - Risolvere eventuali errori di sintassi, percorsi non trovati o problemi di bundling prima di comunicare con l'utente.
4. Comandi di Riferimento:
    - Installazione: npm install
    - Ambiente di sviluppo: npm run dev
    - Build di produzione: npm run build
    - Anteprima build: npm run preview