const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
  { match: /brand-purple-dark/g, replace: 'brand-green-dark' },
  { match: /brand-purple/g, replace: 'brand-green' },
  { match: /brand-rose/g, replace: 'brand-gold' },
  { match: /bg-slate-50/g, replace: 'bg-brand-cream' },
  { match: /bg-slate-900/g, replace: 'bg-brand-green-dark' }, // Sidebar
  { match: /bg-slate-800/g, replace: 'bg-brand-green' }, // Sidebar hover
];

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;

      replacements.forEach(({ match, replace }) => {
        content = content.replace(match, replace);
      });

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  });
}

processDirectory(directoryPath);
console.log('Bulk replace completed.');
