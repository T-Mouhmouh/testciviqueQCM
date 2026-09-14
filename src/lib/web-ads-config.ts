export const webAdsConfig = {
  publisher: 'ca-pub-2101066490685216',
  // Enable only after AdSense approval and verification of the CMP and page exclusion.
  enabled: false,
  autoAdsExcluded: false,
  consentMessageVerified: false,
  slots: { rail: '5015789383', afterGuide: '8645886512' },
} as const;

export function canServeWebAds(hostname: string): boolean {
  return webAdsConfig.enabled && webAdsConfig.autoAdsExcluded &&
    webAdsConfig.consentMessageVerified &&
    ['prep-testcivique.fr', 'www.prep-testcivique.fr'].includes(hostname);
}

export function isLocalAdPreview(hostname: string, search: string): boolean {
  return ['localhost', '127.0.0.1'].includes(hostname) &&
    new URLSearchParams(search).get('adPreview') === '1';
}
