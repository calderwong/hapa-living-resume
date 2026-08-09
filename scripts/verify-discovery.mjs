import { readFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';

const site = 'https://calderwong.github.io/hapa-living-resume/';
const requiredFiles = [
  'index.html',
  'robots.txt',
  'sitemap.xml',
  'profile.json',
  'agent-discovery.json',
  'llms.txt',
  'assets/living-resume-social-preview.png',
  'case-studies/cardapp-prototype/index.html',
];

for (const file of requiredFiles) await access(file, constants.R_OK);

const [html, robots, sitemap, profile, discovery, caseStudy] = await Promise.all([
  readFile('index.html', 'utf8'),
  readFile('robots.txt', 'utf8'),
  readFile('sitemap.xml', 'utf8'),
  readFile('profile.json', 'utf8'),
  readFile('agent-discovery.json', 'utf8'),
  readFile('case-studies/cardapp-prototype/index.html', 'utf8'),
]);

JSON.parse(profile);
JSON.parse(discovery);

const checks = [
  ['profile canonical', html.includes(`rel="canonical" href="${site}"`)],
  ['Open Graph canonical', html.includes(`property="og:url" content="${site}"`)],
  ['Open Graph image', html.includes('property="og:image"') && html.includes('property="og:image:alt"')],
  ['Twitter image', html.includes('name="twitter:image"') && html.includes('name="twitter:image:alt"')],
  ['agent discovery link', html.includes('title="Agent discovery index" href="./agent-discovery.json"')],
  ['robots sitemap', robots.includes(`Sitemap: ${site}sitemap.xml`)],
  ['profile sitemap entry', sitemap.includes(`<loc>${site}</loc>`)],
  ['case-study sitemap entry', sitemap.includes(`<loc>${site}case-studies/cardapp-prototype/</loc>`)],
  ['case-study canonical', caseStudy.includes(`rel="canonical" href="${site}case-studies/cardapp-prototype/"`)],
  ['no obsolete resume canonical', !html.includes('hapa-node-atlas/living-resume') && !robots.includes('hapa-node-atlas/living-resume') && !sitemap.includes('hapa-node-atlas/living-resume')],
];

const failed = checks.filter(([, passed]) => !passed).map(([name]) => name);
if (failed.length) throw new Error(`Discovery verification failed: ${failed.join(', ')}`);
console.log(`Discovery verification passed: ${checks.length} checks.`);
