/** Pagine dimostrative usate come fallback quando il sorgente è vuoto o illeggibile. */

export const SAMPLE_PAGES = [
  {
    type: 'cover',
    density: 'hard',
    title: 'Copertina',
    header: 'Copertina',
    html: `
      <div class="page-content cover-inner">
        <div class="cover-top">
          <p class="cover-edition">EDIZIONE WEB</p>
          <div class="cover-ornament"></div>
        </div>
        <div class="cover-middle">
          <h1 class="cover-title">Rosario a Montevecchia</h1>
          <p class="cover-subtitle">«Se noi tutti vogliamo cambiare il mondo, cominciamo con noi stessi»</p>
        </div>
        <div class="cover-bottom">
          <div class="cover-ornament"></div>
          <p class="cover-location">Coppi e Berez</p>
        </div>
      </div>
    `
  },
  {
    type: 'toc',
    density: 'soft',
    title: 'Sommario',
    header: 'Sommario',
    html: `
      <div class="page-content page-toc">
        <header class="page-header">Indice dei Contenuti</header>
        <div class="page-body">
          <h2>Sommario dell'Opera</h2>
          <ul class="toc-list">
            <li class="toc-item"><span class="toc-title">I. Il richiamo della montagna</span><span class="toc-dots"></span><span class="toc-num">3</span></li>
            <li class="toc-item"><span class="toc-title">II. La prima salita verso il colle</span><span class="toc-dots"></span><span class="toc-num">4</span></li>
            <li class="toc-item"><span class="toc-title">III. Oltre i ghiacci eterni</span><span class="toc-dots"></span><span class="toc-num">5</span></li>
          </ul>
        </div>
        <footer class="page-footer"><span class="page-footer-content">2</span></footer>
      </div>
    `
  },
  {
    type: 'text',
    density: 'soft',
    title: 'Il richiamo',
    header: 'Capitolo I — Il Richiamo',
    html: `
      <div class="page-content">
        <header class="page-header">Capitolo I — Il Richiamo</header>
        <div class="page-body">
          <h2>I. Il richiamo</h2>
          <p class="dropcap">La montagna non si concede mai alla fretta: esige silenzio, respiro costante e un rispetto profondo per ogni singolo passo compiuto sul granito.</p>
          <p>All'alba, la luce cominciava a tingere di rosa le creste più alte, mentre la valle sottostante dormiva ancora avvolta da un mare compatto di nebbie argentee.</p>
        </div>
        <footer class="page-footer"><span class="page-footer-content">3</span></footer>
      </div>
    `
  },
  {
    type: 'text',
    density: 'soft',
    title: 'Verso il colle',
    header: 'Capitolo II — La Salita',
    html: `
      <div class="page-content">
        <header class="page-header">Capitolo II — La Salita</header>
        <div class="page-body">
          <h2>II. Verso il colle</h2>
          <p class="dropcap">Superata la fascia boschiva, il sentiero si inerpicava ripido tra morene e sfasciumi. Ogni passo richiedeva concentrazione.</p>
          <p>Eppure la fatica svaniva a ogni sosta: volgendosi indietro, l'orizzonte sembrava allargarsi a dismisura.</p>
        </div>
        <footer class="page-footer"><span class="page-footer-content">4</span></footer>
      </div>
    `
  },
  {
    type: 'text',
    density: 'soft',
    title: 'I ghiacci',
    header: 'Capitolo III — La Vetta',
    html: `
      <div class="page-content">
        <header class="page-header">Capitolo III — La Vetta</header>
        <div class="page-body">
          <h2>III. I ghiacci</h2>
          <p class="dropcap">Giunti al pianoro superiore, il respiro dell'aria sottile si fece sentire con vigore.</p>
          <p>La vetta non è una conquista contro la natura, ma una vittoria contro le proprie paure.</p>
        </div>
        <footer class="page-footer"><span class="page-footer-content">5</span></footer>
      </div>
    `
  },
  {
    type: 'backcover',
    density: 'hard',
    title: 'Quarta di copertina',
    header: 'Quarta di copertina',
    html: `
      <div class="page-content backcover-inner">
        <div class="cover-ornament"></div>
        <div class="backcover-quote">
          <p class="backcover-text">Sulle cime più alte si comprende che le cose essenziali sono pochissime e il silenzio è la musica più pura.</p>
        </div>
        <div class="cover-ornament"></div>
        <div class="backcover-imprint"><p>Edizione web • 2026</p></div>
      </div>
    `
  }
];
