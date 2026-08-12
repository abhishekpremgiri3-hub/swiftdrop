const fs = require('fs');
const path = require('path');

const root = __dirname;
const web = path.join(root, 'www');

fs.rmSync(web, { recursive: true, force: true });
fs.mkdirSync(web, { recursive: true });

for (const file of ['index.html', 'styles.css', 'config.js', 'backend.js', 'app.js']) {
  fs.copyFileSync(path.join(root, file), path.join(web, file));
}

console.log('SwiftDrop V10 build complete: ./www');
