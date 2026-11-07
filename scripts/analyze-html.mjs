import fs from 'node:fs';

const html = fs.readFileSync('Sharofov school 7.11.2026.html', 'utf8');

console.log('Title match:', html.match(/<title>[\s\S]*?<\/title>/i)?.[0]);
const imgs = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)];
console.log('Total images:', imgs.length);
imgs.forEach((img, i) => {
  const src = img[1];
  const isB64 = src.startsWith('data:');
  const alt = img[0].match(/alt=["']([^"']*)["']/i)?.[1] || '';
  console.log(`Image ${i+1}: isBase64=${isB64}, length=${src.length}, alt=${alt}`);
});

const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
console.log('Total scripts:', scripts.length);
scripts.forEach((s, i) => {
  console.log(`--- Script ${i+1} (length: ${s[1].length}) ---`);
  console.log(s[1].slice(0, 400) + '...');
});

const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
console.log('Total styles:', styles.length);
styles.forEach((st, i) => {
  console.log(`--- Style ${i+1} (length: ${st[1].length}) ---`);
});

