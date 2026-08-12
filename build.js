const fs = require("fs");
const path = require("path");

const root = __dirname;
const www = path.join(root, "www");

const files = [
  "index.html",
  "styles.css",
  "config.js",
  "backend.js",
  "app.js"
];

if (fs.existsSync(www)) {
  fs.rmSync(www, { recursive: true, force: true });
}

fs.mkdirSync(www, { recursive: true });

for (const file of files) {
  const source = path.join(root, file);
  const destination = path.join(www, file);

  if (!fs.existsSync(source)) {
    throw new Error(`Missing required file: ${file}`);
  }

  fs.copyFileSync(source, destination);
}

console.log("SwiftDrop web bundle created successfully in www/");