import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
const en = read('../dist/index.html');
const pl = read('../dist/pl/index.html');

const fail = [];
const must = (cond, msg) => { if (!cond) fail.push(msg); };

must(en.includes('Marcin Wojciechowski'), 'EN: name missing');
must(pl.includes('Marcin Wojciechowski'), 'PL: name missing');
must(en.includes('mailto:marcinwojciechowski7@icloud.com'), 'EN: mailto missing');
must(en.includes('tel:+48507705977'), 'EN: tel href must have spaces stripped');
must(en.includes('/Marcin-Wojciechowski-CV.pdf'), 'EN: CV link missing/wrong path');
must(/rel="noopener"/.test(en), 'EN: external link rel="noopener" missing');
must(en.includes('Experience'), 'EN: nav label "Experience" missing');
must(pl.includes('Doświadczenie'), 'PL: nav label "Doświadczenie" missing');
for (const id of ['id="skills"', 'id="certs"', 'id="experience"', 'id="contact"']) {
  must(en.includes(id), `EN: anchor ${id} missing`);
  must(pl.includes(id), `PL: anchor ${id} missing`);
}

if (fail.length) {
  console.error('Build check FAILED:\n' + fail.join('\n'));
  process.exit(1);
}
console.log('Build check passed: routes, i18n, links, and anchors all present.');
