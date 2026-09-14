import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { canServeWebAds, isLocalAdPreview, webAdsConfig } from '../src/lib/web-ads-config';

assert.equal(canServeWebAds('prep-testcivique.fr'), false, 'Rejected site must stay disabled');
assert.equal(canServeWebAds('localhost'), false);
assert.equal(canServeWebAds('other.example'), false);
assert.equal(isLocalAdPreview('localhost', '?adPreview=1'), true);
assert.equal(isLocalAdPreview('prep-testcivique.fr', '?adPreview=1'), false);
assert.equal(new Set(Object.values(webAdsConfig.slots)).size, 2);
assert.ok(Object.values(webAdsConfig.slots).every((slot) => /^\d{10}$/.test(slot)));
const component = readFileSync('src/WebQuizAdvertising.tsx', 'utf8');
assert.ok(component.includes('requestedPlacements.add(placement)'));
assert.ok(component.includes('Capacitor.isNativePlatform()'));
assert.ok(!component.includes('setInterval('));
assert.ok(!component.includes('currentIndex'));
assert.ok(!readFileSync('app.html', 'utf8').includes('adsbygoogle'));
console.log('PASS: disabled pending approval, production preview blocked, native excluded, unique placements and no question refresh.');
