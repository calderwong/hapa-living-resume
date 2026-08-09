import { readFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';

const site = 'https://calderwong.github.io/hapa-living-resume/';
const requiredFiles = [
  'index.html',
  'robots.txt',
  'sitemap.xml',
  'profile.json',
  'claims.json',
  'PUBLIC-BOUNDARIES.md',
  'RELEASE-NOTES.md',
  'agent-economics.json',
  'briefing-packets.json',
  'retrieval-taxonomy.json',
  'agent-discovery.json',
  'llms.txt',
  'assets/living-resume-social-preview.png',
  'case-studies/cardapp-prototype/index.html',
];

for (const file of requiredFiles) await access(file, constants.R_OK);

const [html, robots, sitemap, profile, claims, publicBoundaries, releaseNotes, economics, briefings, discovery, taxonomy, caseStudy] = await Promise.all([
  readFile('index.html', 'utf8'),
  readFile('robots.txt', 'utf8'),
  readFile('sitemap.xml', 'utf8'),
  readFile('profile.json', 'utf8'),
  readFile('claims.json', 'utf8'),
  readFile('PUBLIC-BOUNDARIES.md', 'utf8'),
  readFile('RELEASE-NOTES.md', 'utf8'),
  readFile('agent-economics.json', 'utf8'),
  readFile('briefing-packets.json', 'utf8'),
  readFile('agent-discovery.json', 'utf8'),
  readFile('retrieval-taxonomy.json', 'utf8'),
  readFile('case-studies/cardapp-prototype/index.html', 'utf8'),
]);

JSON.parse(profile);
const claimIndex = JSON.parse(claims);
const discoveryIndex = JSON.parse(discovery);
const retrievalTaxonomy = JSON.parse(taxonomy);
const economicGuide = JSON.parse(economics);
const briefingPackets = JSON.parse(briefings);
const jsonLd = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)?.[1] || 'null');

const checks = [
  ['profile canonical', html.includes(`rel="canonical" href="${site}"`)],
  ['Open Graph canonical', html.includes(`property="og:url" content="${site}"`)],
  ['Open Graph image', html.includes('property="og:image"') && html.includes('property="og:image:alt"')],
  ['Twitter image', html.includes('name="twitter:image"') && html.includes('name="twitter:image:alt"')],
  ['agent discovery link', html.includes('title="Agent discovery index" href="./agent-discovery.json"')],
  ['claim index link', html.includes('title="Public claim index" href="./claims.json"')],
  ['claim index has sources', Array.isArray(claimIndex.claims) && claimIndex.claims.every((claim) => claim.sources?.length)],
  ['public-boundaries resource is linked', discoveryIndex.entrypoints.publicBoundaries === './PUBLIC-BOUNDARIES.md' && publicBoundaries.toLowerCase().includes('local filesystem paths')],
  ['release note describes supported behavior', discoveryIndex.entrypoints.releaseNotes === './RELEASE-NOTES.md' && releaseNotes.includes('does not expose a live A2A or MCP endpoint')],
  ['economic guidance has bounded authority', discoveryIndex.entrypoints.economicGuide === './agent-economics.json' && economicGuide.authorityBoundary.includes('Humans approve') && economicGuide.scenarioModel.nonClaims.length >= 2],
  ['briefing packets cover opportunity contexts', discoveryIndex.entrypoints.briefingPackets === './briefing-packets.json' && briefingPackets.packets.length >= 4 && briefingPackets.packets.every((packet) => packet.productionProof?.length && packet.hapaProof?.length && packet.boundary && packet.questions?.length)],
  ['no local paths in public discovery resources', ![profile, claims, discovery, taxonomy, publicBoundaries].some((resource) => resource.includes('/Users/'))],
  ['profile structured data parses as a profile', jsonLd?.['@type'] === 'ProfilePage' && jsonLd?.mainEntity?.['@type'] === 'Person'],
  ['retrieval taxonomy is linked', discoveryIndex.entrypoints.retrievalTaxonomy === './retrieval-taxonomy.json' && JSON.parse(profile).retrieval.resources.includes('./retrieval-taxonomy.json')],
  ['retrieval taxonomy has bounded proof mappings', Array.isArray(retrievalTaxonomy.terms) && retrievalTaxonomy.terms.every((term) => term.labels?.length && term.proof?.length && term.caveat)],
  ['dense catalog has direct pagination', html.includes('id="media-catalog-page"') && html.includes('id="media-catalog-prev"') && html.includes('id="media-catalog-next"')],
  ['large catalog is deferred', html.includes("IntersectionObserver' in window") && html.includes("observer.observe($('#media-catalog'))")],
  ['professional proof is clear in the first view', html.includes('Proof at a glance · production outcomes and prototypes are labeled separately below')],
  ['robots sitemap', robots.includes(`Sitemap: ${site}sitemap.xml`)],
  ['profile sitemap entry', sitemap.includes(`<loc>${site}</loc>`)],
  ['case-study sitemap entry', sitemap.includes(`<loc>${site}case-studies/cardapp-prototype/</loc>`)],
  ['case-study canonical', caseStudy.includes(`rel="canonical" href="${site}case-studies/cardapp-prototype/"`)],
  ['no obsolete resume canonical', !html.includes('hapa-node-atlas/living-resume') && !robots.includes('hapa-node-atlas/living-resume') && !sitemap.includes('hapa-node-atlas/living-resume')],
];

const failed = checks.filter(([, passed]) => !passed).map(([name]) => name);
if (failed.length) throw new Error(`Discovery verification failed: ${failed.join(', ')}`);
console.log(`Discovery verification passed: ${checks.length} checks.`);
