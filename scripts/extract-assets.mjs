import fs from 'node:fs';

let html = fs.readFileSync('Sharofov school 7.11.2026.html', 'utf8');

// Also save the 4 images to public/assets/ so Next.js can serve them cleanly and fast!
const imgs = [...html.matchAll(/<img[^>]+src=["'](data:[^"']+)["'][^>]*>/gi)];
fs.mkdirSync('public/assets', { recursive: true });

const filenames = [
  'hero-students.jpg',
  'banner-students.jpg',
  'books-special.jpg',
  'certificate-sample.jpg'
];

imgs.forEach((img, i) => {
  const dataUri = img[1];
  const base64Data = dataUri.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  const targetPath = `public/assets/${filenames[i]}`;
  fs.writeFileSync(targetPath, buffer);
  console.log(`Saved ${targetPath} (${buffer.length} bytes)`);
});

// Create a clean readable version of the HTML with replaced image paths
let cleanHtml = html;
imgs.forEach((img, i) => {
  cleanHtml = cleanHtml.replace(img[1], `/assets/${filenames[i]}`);
});

fs.writeFileSync('scripts/clean-structure.html', cleanHtml);
console.log('Saved clean structure HTML (size:', cleanHtml.length, 'bytes)');

