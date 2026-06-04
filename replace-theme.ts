import fs from 'fs';
import path from 'path';

function walk(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('#1db954')) {
         fs.writeFileSync(fullPath, content.replace(/#1db954/g, 'var(--theme-color)'));
         console.log('Updated ' + fullPath);
      }
    }
  }
}
walk('src');
