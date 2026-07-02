import { readFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('../src/data/content.json', import.meta.url), 'utf8'));
const errors = [];

const isLocalized = (v) => v && typeof v === 'object' && ('en' in v || 'pl' in v);

function walk(v, path) {
  if (isLocalized(v)) {
    for (const l of ['en', 'pl']) {
      if (typeof v[l] !== 'string' || v[l].trim() === '') errors.push(`${path}.${l} missing/empty`);
    }
    return;
  }
  if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`));
  else if (v && typeof v === 'object') for (const k of Object.keys(v)) walk(v[k], `${path}.${k}`);
}

walk(data, 'content');

if (errors.length) {
  console.error('Content check FAILED:\n' + errors.join('\n'));
  process.exit(1);
}
console.log('Content check passed: every localized string has non-empty en + pl.');
