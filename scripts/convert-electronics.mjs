/**
 * One-time converter: Electronics .docx -> clean markdown split into topic files.
 * Run locally with `node scripts/convert-electronics.mjs`. The resulting .md files
 * are committed, so the CI build never needs docx tooling (mammoth/turndown are
 * installed with --no-save and are NOT build dependencies).
 *
 * Images are extracted to public/electronics/ and referenced with the site base
 * path so they resolve on GitHub Pages.
 */
import mammoth from 'mammoth';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BASE = '/Interview-Prep';
const SRC = 'Electronics/Electronics_Diodes_Rectifiers_Clippers_Clampers.docx';

const imgDir = join(ROOT, 'public/electronics');
mkdirSync(imgDir, { recursive: true });

let imgCount = 0;
const { value: html } = await mammoth.convertToHtml(
  { path: join(ROOT, SRC) },
  {
    convertImage: mammoth.images.imgElement(async (image) => {
      const buf = await image.read('base64');
      const ext = (image.contentType || 'image/png').split('/')[1].replace('jpeg', 'jpg');
      const name = `fig-${++imgCount}.${ext}`;
      writeFileSync(join(imgDir, name), Buffer.from(buf, 'base64'));
      return { src: `${BASE}/electronics/${name}`, alt: `Electronics figure ${imgCount}` };
    }),
  }
);

// --- Convert tables to clean single-line-cell GFM BEFORE turndown ---
// (turndown mangles mammoth's multi-paragraph cells; we handle tables ourselves)
const decode = (s) =>
  s.replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ').trim().replace(/\|/g, '\\|');

const tableStrings = [];
const htmlNoTables = html.replace(/<table[\s\S]*?<\/table>/g, (tbl) => {
  const rows = [...tbl.matchAll(/<tr[\s\S]*?<\/tr>/g)]
    .map((r) => [...r[0].matchAll(/<t[dh][\s\S]*?<\/t[dh]>/g)].map((c) => decode(c[0])))
    .filter((cells) => cells.length);
  if (!rows.length) return '';
  const ncol = Math.max(...rows.map((r) => r.length));
  const pad = (r) => { while (r.length < ncol) r.push(''); return r; };
  const header = pad(rows[0]);
  const lines = [
    '| ' + header.join(' | ') + ' |',
    '| ' + header.map(() => '---').join(' | ') + ' |',
    ...rows.slice(1).map((r) => '| ' + pad(r).map((c) => c || '-').join(' | ') + ' |'),
  ];
  tableStrings.push(lines.join('\n'));
  return `<p>@@TABLE${tableStrings.length - 1}@@</p>`;
});

const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' });
td.use(gfm);
let md = td.turndown(htmlNoTables);
// Restore clean tables, collapse blank lines, drop stray escaped brackets.
md = md.replace(/@@TABLE(\d+)@@/g, (_, n) => '\n' + tableStrings[+n] + '\n');
md = md.replace(/\n{3,}/g, '\n\n').replace(/\\([[\]])/g, '$1');

// --- Split by "# **Part N**" H1 headings into grouped topic files ---
// (headings are bold, matching the Google-Docs export style of the other notes)
const parts = md.split(/\n(?=# \*\*Part \d)/);
const byNum = {};
for (const p of parts) {
  const m = p.match(/^# \*\*Part (\d)/);
  if (m) byNum[+m[1]] = p.trim();
}

// Grouping: source file -> [part numbers]
const groups = [
  { file: 'Electronics1_Diode_Basics.md', parts: [0, 1] },
  { file: 'Electronics2_Diode_Circuits.md', parts: [2] },
  { file: 'Electronics3_Rectifiers.md', parts: [3] },
  { file: 'Electronics4_Clippers.md', parts: [4] },
  { file: 'Electronics5_Clampers.md', parts: [5, 6] },
];

for (const g of groups) {
  const body = g.parts.map((n) => byNum[n]).filter(Boolean).join('\n\n');
  writeFileSync(join(ROOT, 'Electronics', g.file), body + '\n');
  console.log(`✓ ${g.file}  (${body.length} chars)`);
}
console.log(`✓ extracted ${imgCount} images to public/electronics/`);
