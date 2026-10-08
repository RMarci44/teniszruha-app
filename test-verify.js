import { execSync } from 'child_process';

try {
  execSync('npx tsx test-verify.ts', { stdio: 'inherit' });
  execSync('npx tsx test-gestures-theme.ts', { stdio: 'inherit' });
  execSync('npx tsx test-deep-gestures.ts', { stdio: 'inherit' });
  execSync('node test-browser-e2e.js', { stdio: 'inherit' });
} catch (err) {
  process.exit(1);
}
