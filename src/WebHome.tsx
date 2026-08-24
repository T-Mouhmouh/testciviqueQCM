import { useEffect, useRef } from 'react';
import './web-home.css';

type PublicAdConfig = {
  client?: string;
  autoAds?: boolean;
  homeGuide?: string;
  homeResources?: string;
};

function getAdConfig() {
  const config = (window as Window & { TEST_CIVIQUE_ADS?: PublicAdConfig }).TEST_CIVIQUE_ADS;
  return {
    client: String(config?.client ?? '').trim(),
    autoAds: config?.autoAds !== false,
    homeGuide: String(config?.homeGuide ?? '').trim(),
    homeResources: String(config?.homeResources ?? '').trim(),
  };
}

function ensureAdSenseScript(client: string) {
  if (!client.startsWith('ca-pub-') || document.getElementById('adsbygoogle-editorial-script')) {
    return;
  }

  const script = document.createElement('script');
  script.id = 'adsbygoogle-editorial-script';
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
  document.head.appendChild(script);
}

function EditorialAd({ slot, label }: { slot: string; label: string }) {
  const adRef = useRef<HTMLModElement | null>(null);
  const requestedRef = useRef(false);
  const { client } = getAdConfig();
  const enabled = Boolean(client.startsWith('ca-pub-') && /^\d+$/.test(slot));

  useEffect(() => {
    if (!enabled || requestedRef.current || !adRef.current) return;
    ensureAdSenseScript(client);
    requestedRef.current = true;
    const timeoutId = window.setTimeout(() => {
      const win = window as Window & { adsbygoogle?: unknown[] };
      win.adsbygoogle = win.adsbygoogle || [];
      win.adsbygoogle.push({});
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <aside className="home-ad" aria-label={label}>
      <span>Publicités</span>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}

export default function WebHome() {
  const { client, autoAds, homeGuide: firstSlot, homeResources: secondSlot } = getAdConfig();

  useEffect(() => {
    if (autoAds) {
      ensureAdSenseScript(client);
    }
  }, [autoAds, client]);

  return (
    <div className="site-home">
      <header className="site-header">
        <a className="site-logo" href="/" aria-label="Accueil Test Civique QCM">
          <span>TC</span>
          <strong>Test Civique QCM</strong>
        </a>
        <nav aria-label="Navigation principale">
          <a href="#parcours">Parcours</a>
          <a href="#methode">Methode</a>
          <a href="/guides.html">Guides</a>
          <a href="/about.html">A propos</a>
        </nav>
        <a className="header-action" href="/app.html">S'entrainer</a>
      </header>

      <main>
        <section className="site-hero">
          <img src="/web-hero-community.png" alt="Des adultes revisent ensemble le test civique" />
          <div className="site-hero-shade" />
          <div className="site-hero-content">
            <p className="site-kicker">Preparation independante et gratuite</p>
            <h1>Preparer le test civique francais</h1>
            <p>
              Des explications claires, des questions d'entrainement et des simulations pour la
              carte de sejour, la carte de resident et la naturalisation.
            </p>
            <a className="hero-action" href="/app.html">Commencer un entrainement</a>
            <small>Service non officiel, sans affiliation avec l'administration francaise.</small>
          </div>
        </section>

        <section className="exam-facts" aria-label="Format de la simulation">
          <div><strong>40</strong><span>questions</span></div>
          <div><strong>45</strong><span>minutes</span></div>
          <div><strong>32</strong><span>bonnes reponses visees</span></div>
          <p>Choisissez votre parcours puis mesurez votre niveau dans les conditions de l'examen.</p>
        </section>

        <section className="site-section" id="parcours">
          <div className="section-heading">
            <p className="site-kicker">Trois objectifs</p>
            <h2>Un parcours adapte a votre demarche</h2>
            <p>Les banques et les statistiques restent separees afin de travailler uniquement les connaissances utiles a votre situation.</p>
          </div>
          <div className="path-grid">
            <article><span>01</span><h3>Carte de resident</h3><p>Questions et revisions pour preparer le parcours lie a la carte de resident.</p><a href="/app.html">Ouvrir le parcours</a></article>
            <article><span>02</span><h3>Sejour pluriannuel</h3><p>Entrainement cible pour une premiere carte de sejour pluriannuelle.</p><a href="/app.html">Ouvrir le parcours</a></article>
            <article><span>03</span><h3>Naturalisation</h3><p>Questions de connaissance et explications pour la demande de nationalite francaise.</p><a href="/app.html">Ouvrir le parcours</a></article>
          </div>
        </section>

        <EditorialAd slot={firstSlot} label="Annonce entre les articles" />

        <section className="method-band" id="methode">
          <div className="section-heading">
            <p className="site-kicker">Methode de revision</p>
            <h2>Comprendre, pratiquer, corriger</h2>
          </div>
          <ol>
            <li><strong>Faire un diagnostic</strong><p>Une premiere simulation revele les themes deja connus et les priorites.</p></li>
            <li><strong>Reviser par theme</strong><p>Les explications relient chaque reponse aux principes, institutions et situations concretes.</p></li>
            <li><strong>Reprendre ses erreurs</strong><p>Les questions fragiles restent disponibles pour une revision ciblee.</p></li>
            <li><strong>Simuler a nouveau</strong><p>Un nouvel examen blanc permet de mesurer les progres dans la duree.</p></li>
          </ol>
        </section>

        <section className="editorial-layout">
          <article>
            <p className="site-kicker">Bien reviser</p>
            <h2>Ne pas apprendre uniquement la position des reponses</h2>
            <p>Les propositions sont melangees pendant les sessions. Pour progresser, il faut savoir expliquer la notion avec ses propres mots et reconnaitre son application dans une situation differente.</p>
            <p>Une reponse correcte obtenue par hasard doit rester dans les points a revoir. Consultez l'explication et rattachez-la a un exemple concret.</p>
          </article>
          <aside>
            <h3>Ressources utiles</h3>
            <a href="/guides.html">Guide complet de preparation</a>
            <a href="https://formation-civique.interieur.gouv.fr/examen-civique/" rel="noreferrer">Informations du ministere de l'Interieur</a>
            <a href="https://www.service-public.fr/" rel="noreferrer">Fiches Service-Public.fr</a>
          </aside>
        </section>

        <EditorialAd slot={secondSlot} label="Annonce apres l'article" />

        <section className="final-cta">
          <div><p className="site-kicker">Passez a la pratique</p><h2>Mesurez votre niveau maintenant</h2><p>Votre progression reste enregistree localement sur votre appareil, sans creation de compte.</p></div>
          <a href="/app.html">Lancer Test Civique QCM</a>
        </section>
      </main>

      <footer className="site-footer">
        <div><strong>Test Civique QCM</strong><p>Plateforme independante de preparation au test civique francais.</p></div>
        <nav aria-label="Informations legales"><a href="/guides.html">Guides</a><a href="/about.html">A propos</a><a href="/privacy-policy.html">Confidentialite</a></nav>
      </footer>
    </div>
  );
}
