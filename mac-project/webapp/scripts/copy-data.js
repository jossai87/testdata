import { createWriteStream, copyFileSync, mkdirSync, existsSync, unlink } from 'fs';
import { resolve, dirname } from 'path';
import { get } from 'https';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __dirname = dirname(fileURLToPath(import.meta.url));

function copyFile(src, dest) {
  const sourceFile = resolve(__dirname, '..', src);
  const destFile = resolve(__dirname, '..', dest);
  
  const destDir = dirname(destFile);
  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }

  copyFileSync(sourceFile, destFile);
  console.log(`Copied ${src} to ${dest}`);
}

const files = [
  {
    src: 'public/data/personalize_agent/structured/sample.customers_preferences.csv',
    dest: 'public/data/personalize_agent/structured/customers_preferences.csv'
  },
  {
    src: 'public/data/personalize_agent/unstructured/sample.browse_history.txt',
    dest: 'public/data/personalize_agent/unstructured/browse_history.txt'
  }
];

async function downloadFile(url, dest) {
  const dir = dirname(dest);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    get(url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${url} to ${dest}`);
        resolve();
      });
    }).on('error', err => {
      unlink(dest, () => {});
      reject(err);
    });
  });
}

function copyData() {
  try {
    files.forEach(({ src, dest }) => copyFile(src, dest));
    console.log('All files copied successfully');
  } catch (error) {
    console.error('Error copying files:', error);
    process.exit(1);
  }
}

copyData();
