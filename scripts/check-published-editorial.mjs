import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { courses } from '../content/courses.mjs';

const files = ['index.html', 'about.html', 'privacy-policy.html', 'site-pages.css',
  'sitemap.xml', 'robots.txt', 'guides/plan-revision.html', 'guides/analyser-resultats.html',
  'cours/index.html', ...courses.map(({ slug }) => `cours/${slug}.html`)];
const normalize = (value) => value.replace(/\r\n/g, '\n').trim();
for (const file of files) {
  const response = await fetch(`https://prep-testcivique.fr/${file === 'index.html' ? '' : file}`, {
    signal: AbortSignal.timeout(20000), cache: 'no-store',
  });
  assert.equal(response.status, 200, `${file}: HTTP ${response.status}`);
  assert.equal(normalize(await response.text()), normalize(await readFile(`dist/${file}`, 'utf8')),
    `${file}: published content differs from the tested build`);
  console.log(`PASS published: ${file}`);
}
console.log(`Verified ${files.length} published files against the local build. This does not certify AdSense approval.`);
