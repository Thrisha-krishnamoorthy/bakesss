// @ts-check
// Add "type": "module" to package.json or rename this file to .mjs
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import selfsigned from 'selfsigned';
import chalk from 'chalk';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create certs directory if it doesn't exist
const certsDir = path.join(__dirname, 'certs');
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir);
}

console.log(chalk.blue('Generating self-signed certificates...'));

// Generate self-signed certificate
const attrs = [{ name: 'commonName', value: 'localhost' }];
const pems = selfsigned.generate(attrs, {
  keySize: 2048,
  days: 365,
  algorithm: 'sha256'
});

// Write certificate files
fs.writeFileSync(path.join(certsDir, 'cert.pem'), pems.cert);
fs.writeFileSync(path.join(certsDir, 'key.pem'), pems.private);

console.log(chalk.green('✓ Self-signed certificates generated successfully!'));
console.log(chalk.yellow('Certificate files created in the certs/ directory'));
console.log(chalk.yellow('cert.pem - SSL Certificate'));
console.log(chalk.yellow('key.pem - SSL Private Key'));

console.log(chalk.blue('\nYou may need to add this certificate to your trusted certificates.'));
console.log(chalk.blue('When accessing the site, you can click "Advanced" and "Proceed" to accept the certificate.'));
