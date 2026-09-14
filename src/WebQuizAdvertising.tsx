import { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { canServeWebAds, isLocalAdPreview, webAdsConfig } from './lib/web-ads-config';

type Placement = keyof typeof webAdsConfig.slots;
const requestedPlacements = new Set<Placement>();
let scriptPromise: Promise<void> | undefined;

function loadAdSense() {
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${webAdsConfig.publisher}`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('AdSense unavailable'));
    document.head.append(script);
  });
  return scriptPromise;
}

export function WebQuizAd({ placement }: { placement: Placement }) {
  const adRef = useRef<HTMLModElement>(null);
  const [failed, setFailed] = useState(false);
  const [available] = useState(() => !Capacitor.isNativePlatform() &&
    !requestedPlacements.has(placement) &&
    (placement !== 'rail' || window.matchMedia('(min-width: 1600px)').matches));
  const preview = isLocalAdPreview(location.hostname, location.search);
  const enabled = available && (preview || canServeWebAds(location.hostname));

  useEffect(() => {
    const element = adRef.current;
    if (!enabled || preview || !element) return;
    let cancelled = false;
    let loading = false;
    // Request only visible inventory, once per placement and document, never per question.
    const observer = new IntersectionObserver((entries) => {
      if (loading || !entries.some((entry) => entry.isIntersecting)) return;
      if (document.visibilityState !== 'visible' || element.clientWidth < 250) return;
      loading = true;
      void loadAdSense().then(() => {
        if (cancelled || !element.isConnected || requestedPlacements.has(placement)) return;
        const rect = element.getBoundingClientRect();
        if (document.visibilityState !== 'visible' || rect.bottom <= 0 || rect.top >= innerHeight) {
          loading = false;
          return;
        }
        requestedPlacements.add(placement);
        const adsWindow = window as typeof window & { adsbygoogle?: object[] };
        (adsWindow.adsbygoogle ??= []).push({});
        observer.disconnect();
      }).catch(() => { if (!cancelled) setFailed(true); });
    }, { threshold: 0.1 });
    observer.observe(element);
    return () => { cancelled = true; observer.disconnect(); };
  }, [enabled, placement, preview]);

  if (!enabled || failed) return null;
  return (
    <aside className={`web-quiz-ad web-quiz-ad-${placement}`} aria-label={preview ? 'Aperçu publicitaire local' : 'Publicité'}>
      <span className="web-quiz-ad-label">{preview ? 'Aperçu local · aucune annonce réelle' : 'Publicité'}</span>
      {preview ? <div className="web-quiz-ad-preview">{placement === 'rail' ? 'Emplacement latéral' : 'Emplacement après le guide'}</div> :
        <ins ref={adRef} className="adsbygoogle" style={{ display: 'block' }}
          data-ad-client={webAdsConfig.publisher} data-ad-slot={webAdsConfig.slots[placement]}
          data-ad-format="rectangle" data-full-width-responsive="false" />}
    </aside>
  );
}

export function QuizRevisionGuide() {
  return (
    <section className="quiz-revision-guide" aria-labelledby="quiz-revision-title">
      <article>
        <p className="section-kicker">Apprendre avec ses erreurs</p>
        <h2 id="quiz-revision-title">Comment tirer parti de cet entraînement</h2>
        <p>Une réponse juste ne suffit pas toujours à vérifier qu’une notion est comprise.
          Si tu as hésité entre plusieurs propositions, reprends aussi cette question dans la correction.
          Le but est de pouvoir expliquer ton choix avec tes propres mots, sans retenir seulement la lettre de la réponse.</p>
        <div className="quiz-revision-columns">
          <section>
            <h3>Pendant le quiz</h3>
            <p>Lis d’abord la question entière. Identifie ce qui est demandé : une définition,
              une institution, un droit ou une situation concrète. Compare ensuite toutes les propositions.
              Une phrase peut être vraie en général sans répondre à la question posée.</p>
            <p>Dans une simulation, garde les questions difficiles pour un second passage si nécessaire.
              Avant de terminer, vérifie les questions laissées sans réponse. Ne change pas un choix
              uniquement parce que la même lettre revient plusieurs fois.</p>
          </section>
          <section>
            <h3>Après la correction</h3>
            <p>Classe chaque erreur : notion inconnue, confusion entre deux notions ou lecture trop rapide.
              Pour une notion inconnue, lis le cours correspondant. Pour une confusion, écris la différence
              en une phrase. Pour une erreur de lecture, repère le mot qui a changé le sens de la question.</p>
            <p>Refais ensuite quelques questions du thème concerné, puis reviens à un entraînement mélangé.
              Le score par thème sert à orienter tes révisions ; un petit nombre de questions ne suffit pas
              à mesurer tout ton niveau. Cette préparation indépendante ne garantit pas la réussite à un examen officiel.</p>
          </section>
        </div>
        <p>Pour approfondir, retrouve nos <a href="/cours/">cours expliqués par thème</a> et
          le <a href="/guides/plan-revision.html">plan de révision</a>. Les cours indiquent les sources
          publiques utilisées pour vérifier les notions.</p>
      </article>
      <WebQuizAd placement="afterGuide" />
    </section>
  );
}
