# Quiz advertising

Two responsive Display units were created in AdSense on 2026-09-14:

- Quiz - colonne de lecture: 5015789383
- Quiz - apres le guide de revision: 8645886512
- Publisher: ca-pub-2101066490685216

## Activation checklist

Serving remains OFF in src/lib/web-ads-config.ts while the site is rejected.
Before changing enabled to true:

1. Confirm that AdSense Sites reports this domain as ready.
2. Enable Auto ads on the domain and exclude prep-testcivique.fr/app.html (this page only).
   Verify persistence after reopening the settings. A preview alone is not proof of saving.
3. Verify the published Google CMP, privacy policy and ability to revisit consent choices.
4. Set autoAdsExcluded and consentMessageVerified only after these checks.
5. Build, deploy and check the actual page. No placement guarantees policy approval.

## Behaviour

- Auto ads code stays on the existing editorial pages, not in app.html.
- Manual script loads only for an enabled, visible quiz placement on the production domain.
- No units on portal, dashboard, empty sessions, results or native Android/iOS.
- At most one request per placement per document; changing questions does not refresh ads.
- Desktop rail is eligible at initial widths of at least 1600px, 150px from the question column.
- A second placement follows the revision guide, separated from its links by 150px.
- On smaller screens only the after-guide placement is eligible.
- No sticky ads, interstitials or ad-triggered quiz delays.
- Preview locally at /app.html?adPreview=1; placeholders never request Google ads.

## References

- https://support.google.com/adsense/answer/1346295
- https://support.google.com/publisherpolicies/answer/11112688
- https://support.google.com/adsense/answer/9262311

Spacing and editorial additions reduce placement risks; they are not a certification
of content quality or a substitute for resolving the low-value-content rejection.
