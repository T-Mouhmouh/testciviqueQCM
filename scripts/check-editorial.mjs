import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { load } from 'cheerio';
import { courses } from '../content/courses.mjs';

const root = 'dist';
const pages = ['index.html', 'cours/index.html', ...courses.map((course) => `cours/${course.slug}.html`),
  'guides/carte-resident.html', 'guides/carte-sejour-pluriannuelle.html', 'guides/naturalisation.html',
  'guides/examen-civique-2026.html', 'guides/plan-revision.html', 'guides/analyser-resultats.html', 'about.html'];
const documents = new Map();
async function document(path) {
  if (!documents.has(path)) documents.set(path, load(await readFile(join(root, path), 'utf8')));
  return documents.get(path);
}
let checkedLinks = 0;
for (const path of pages) {
  const $ = await document(path);
  assert.equal($('h1').length, 1, `${path}: one h1 required`);
  assert.equal($('link[rel=canonical]').attr('href'), `https://prep-testcivique.fr/${path.replace(/index\.html$/, '')}`, `${path}: canonical URL`);
  assert.ok(!($('meta[name=robots]').attr('content') || '').includes('noindex'), `${path}: editorial page must be indexable`);
  for (const element of $('a[href]').toArray()) {
    const url = new URL($(element).attr('href'), `https://prep-testcivique.fr/${path}`);
    if (url.origin !== 'https://prep-testcivique.fr') continue;
    let target = decodeURIComponent(url.pathname).slice(1);
    if (!target || target.endsWith('/')) target += 'index.html';
    await access(join(root, target));
    if (url.hash) {
      const destination = await document(target);
      assert.ok(destination('[id]').toArray().some((el) => destination(el).attr('id') === decodeURIComponent(url.hash.slice(1))), `${path}: missing ${url.href}`);
    }
    checkedLinks++;
  }
}
for (const course of courses) {
  const $ = await document(`cours/${course.slug}.html`);
  assert.equal($('.worked-question').length, 3);
  assert.equal($('.answer-explanation li').length, 12);
  assert.ok($('.source-list a').length >= 2);
  assert.ok($('article').text().split(/\s+/).length > 450, `${course.slug}: missing lesson content`);
  assert.equal($('link[rel=canonical]').attr('href'), `https://prep-testcivique.fr/cours/${course.slug}.html`);
}
for (const path of ['app.html', 'about.html', 'privacy-policy.html', 'cours/index.html']) {
  const $ = await document(path);
  assert.equal($('script[src*="adsbygoogle"], meta[name="google-adsense-account"], ins.adsbygoogle').length, 0, `${path}: unexpected ads`);
}
const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
for (const course of courses) assert.ok(sitemap.includes(`/cours/${course.slug}.html`));
assert.ok(sitemap.includes('/guides/analyser-resultats.html'));
const guide = await document('guides/analyser-resultats.html');
assert.equal(guide('.study-table tbody tr').length, 5);
let right = 0, total = 0;
for (const row of guide('.study-table tbody tr').toArray()) {
  const [correct, count] = guide(row).find('td').first().text().split('/').map(Number);
  right += correct; total += count;
}
assert.equal(right, 32);
assert.equal(total, 40);
assert.ok(guide('.study-sheet').length, 'Printable revision worksheet missing');
console.log(`PASS: ${pages.length} editorial pages, ${checkedLinks} internal links, 15 corrected exercises and ad exclusions.`);
