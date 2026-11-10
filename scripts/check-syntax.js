// Cross-platform syntax verifier for server, client, and script JS/JSX files
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const targetDirs = ['server', 'scripts', path.join('client', 'public', 'js'), path.join('client', 'tests')];

function collectJsFiles(dir) {
  const absDir = path.join(rootDir, dir);
  if (!fs.existsSync(absDir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
    const full = path.join(absDir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectJsFiles(path.join(dir, entry.name)));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      results.push(full);
    }
  }
  return results;
}

const files = targetDirs.flatMap(collectJsFiles);
let failures = 0;

for (const file of files) {
  const res = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (res.status !== 0) {
    console.error(`Syntax error in ${path.relative(rootDir, file)}:\n${res.stderr}`);
    failures++;
  }
}

if (failures > 0) {
  console.error(`Syntax check failed (${failures} file(s)).`);
  process.exit(1);
}

console.log(`Syntax check passed (${files.length} JS files verified).`);
