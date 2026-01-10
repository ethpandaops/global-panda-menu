const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const releaseDir = path.resolve(rootDir, 'release');

// Read version from package.json
const packageJson = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'package.json'), 'utf8'));
const version = packageJson.version;

console.log(`Building panda-menu v${version}...`);

// Build in production mode
execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });

// Ensure release directory exists
if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true });
}

// Read the built file
const sourceFile = path.resolve(distDir, 'panda-menu.js');
const destFile = path.resolve(releaseDir, `panda-menu-${version}.js`);

if (!fs.existsSync(sourceFile)) {
  console.error('Build failed: panda-menu.js not found in dist/');
  process.exit(1);
}

const fileContent = fs.readFileSync(sourceFile);

// Copy to release directory
fs.copyFileSync(sourceFile, destFile);
console.log(`Copied to release/panda-menu-${version}.js`);

// Generate integrity hashes
function generateHash(content, algorithm) {
  const hash = crypto.createHash(algorithm);
  hash.update(content);
  return `${algorithm}-${hash.digest('base64')}`;
}

const sha256 = generateHash(fileContent, 'sha256');
const sha384 = generateHash(fileContent, 'sha384');
const sha512 = generateHash(fileContent, 'sha512');

// Create metadata object for this version
const metadata = {
  version,
  filename: `panda-menu-${version}.js`,
  size: fileContent.length,
  integrity: {
    sha256,
    sha384,
    sha512,
  },
  buildDate: new Date().toISOString(),
};

// Write versioned metadata file
const metadataFile = path.resolve(releaseDir, `metadata-${version}.json`);
fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
console.log(`Created release/metadata-${version}.json`);

// Update versions.json index
const versionsFile = path.resolve(releaseDir, 'versions.json');
let versions = [];
if (fs.existsSync(versionsFile)) {
  versions = JSON.parse(fs.readFileSync(versionsFile, 'utf8'));
}
if (!versions.includes(version)) {
  versions.push(version);
  // Sort by semver descending (latest first)
  versions.sort((a, b) => {
    const [aMajor, aMinor, aPatch] = a.split('.').map(Number);
    const [bMajor, bMinor, bPatch] = b.split('.').map(Number);
    if (bMajor !== aMajor) return bMajor - aMajor;
    if (bMinor !== aMinor) return bMinor - aMinor;
    return bPatch - aPatch;
  });
  fs.writeFileSync(versionsFile, JSON.stringify(versions, null, 2));
  console.log(`Updated release/versions.json`);
}

console.log('\nRelease complete!');
console.log(`\nTo include with SRI, use:`);
console.log(`<script src="panda-menu-${version}.js" integrity="${sha384}" crossorigin="anonymous"></script>`);
