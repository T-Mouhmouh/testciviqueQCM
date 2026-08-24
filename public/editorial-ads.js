(() => {
  const config = window.TEST_CIVIQUE_ADS || {};
  const client = String(config.client || '').trim();
  const containers = Array.from(document.querySelectorAll('[data-editorial-ad]'));
  const defaultSlotNames = ['articleTop', 'articleMiddle', 'articleBottom'];
  const isValidSlot = (value) => /^\d+$/.test(String(value || '').trim());

  if (!client.startsWith('ca-pub-')) {
    containers.forEach((container) => container.remove());
    return;
  }

  const activeContainers = [];
  containers.forEach((container, index) => {
    const slotName = container.dataset.slotName || defaultSlotNames[index] || '';
    const slot = String(config[slotName] || '').trim();
    if (!isValidSlot(slot)) {
      container.remove();
      return;
    }
    container.dataset.adSlot = slot;
    activeContainers.push(container);
  });

  if (config.autoAds !== true && activeContainers.length === 0) return;

  if (!document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) {
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
    document.head.appendChild(script);
  }

  activeContainers.forEach((container) => {
    const ad = document.createElement('ins');
    ad.className = 'adsbygoogle';
    ad.style.display = 'block';
    ad.dataset.adClient = client;
    ad.dataset.adSlot = container.dataset.adSlot;
    ad.dataset.adFormat = 'auto';
    ad.dataset.fullWidthResponsive = 'true';
    container.appendChild(ad);
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.push({});
  });
})();
