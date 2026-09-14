# Content audit - 14 September 2026

## Scope and evidence

- Latest user-supplied AdSense notice: low-value content. Ownership verified; no evidence of a Ready status.
- Checked the existing homepage, five course sources and generated pages, five guides, about/privacy pages, robots and sitemap.
- Direct HTTP requests confirmed that the course collection is already published. Search-tool extraction of the homepage showed older copy; do not use that cached extract to conclude a deployment is missing.
- Course content and its fifteen explained exercises are static HTML, available without JavaScript, sign-in or a quiz session.
- Existing internal-link checks are technical checks, not Google's assessment of originality or quality. There is no approval guarantee based on a word count or page count.

## Improvements in this revision

- Added a substantive guide on interpreting results: two worked examples, unequal theme sample sizes, error classification and a printable revision worksheet.
- Linked it from the homepage, revision plan and all five lessons; added it to the sitemap.
- Qualified misleading shortcuts about track selection and simulation scores. Shared knowledge is useful, but does not replace the selected mention's preparation.
- Clarified publisher identity, editorial method, independence, corrections and advertising funding on the about page.
- Added the public support address confirmed by the owner: toufik.apps@gmail.com, including privacy contact. No private documents are requested.
- Added canonical/indexability checks, validation of the sample calculation and a deployed-content comparison script.
- Kept quiz ad serving disabled. No native application changes and no new AdSense review request.
- The new guide has no advertising script in this revision; adding useful content is distinct from activating ads.

## Verification

- Build, editorial/link checks and advertising guards must pass before publication.
- Browser inspection of the new guide at desktop and mobile widths; table and article remain within the viewport.
- After deployment, run `node scripts/check-published-editorial.mjs` to compare the published files with the tested build.
- Print styling is provided; physical printing is not tested.

## Remaining account checks before ad activation

- Confirm current site status and any remaining reasons in AdSense. Only Google can approve the site.
- Verify that the Google consent message is actually published and works for relevant visitors; historical selection alone is insufficient.
- Verify saved Auto ads exclusions for app.html before enabling manual quiz ads. Earlier attempts to save these settings were inconclusive.
- Keep the quiz's enabled, autoAdsExcluded and consentMessageVerified gates false until verified. An approval does not automatically change these code settings.
- Do not mark a compliance declaration or submit a review automatically on the owner's behalf.

## References

- https://support.google.com/adsense/answer/7299563?hl=fr - original, relevant content and clear navigation.
- https://support.google.com/adsense/answer/12176698?hl=en - site not ready and review process.
- https://support.google.com/adsense/answer/12131223?hl=en - site must reach Ready before serving ads.
- https://www.immigration.interieur.gouv.fr/limmigration-en-france/sejour-des-etrangers/lexamen-civique-pour-demander-titre-de-sejour - official exam format, verified during this audit.

These changes address identifiable usability and content weaknesses. They are not proof that the full site meets every policy or that Google will reverse the low-value-content decision.
