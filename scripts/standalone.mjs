// Turn one prerendered kb page into a single HTML file: CSS inlined, no scripts.
//   node scripts/standalone.mjs <build-dir> <route> <out.html>
import fs from 'node:fs';
import path from 'node:path';

const [buildDir, route, out] = process.argv.slice(2);
let html = fs.readFileSync(path.join(buildDir, route, 'index.html'), 'utf8');
html = html.replace(/<link(?=[^>]*rel="stylesheet")[^>]*href="([^"]+)"[^>]*>/g, (_, href) => {
  const css = fs.readFileSync(path.join(buildDir, new URL(href, `http://x/${route}/`).pathname), 'utf8');
  return `<style>${css}</style>`;
});
html = html
  .replace(/<link[^>]+rel="modulepreload"[^>]*>/g, '')
  .replace(/<script[\s\S]*?<\/script>/g, '');
fs.writeFileSync(out, html);
console.log(`${out}: ${html.length} bytes, ${(html.match(/<style>/g) ?? []).length} style blocks inlined`);
