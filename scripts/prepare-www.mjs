// Run by the build workflow (and safe to run locally) BEFORE `cap sync`. It turns the copy of the
// website in www/ into the app's version of it:
//   1. bundles the Supabase library locally   -> the app starts with no internet (the website
//      loads it from esm.sh at runtime, which can't work offline)
//   2. bundles the native plugins             -> Google sign-in return, in-app updates
//   3. stamps the build number + GitHub repo  -> lets the app know whether a newer build exists
// Idempotent: running it twice is harmless.
import { build } from 'esbuild';
import fs from 'node:fs';

const www = process.env.WWW_DIR || 'www';
const buildNo = Number(process.env.BUILD_NUMBER || 0);
const repo = process.env.GITHUB_REPOSITORY || '';
const [major, minor] = JSON.parse(fs.readFileSync('package.json', 'utf8')).version.split('.');
const version = `${major}.${minor}.${buildNo}`;

fs.mkdirSync(`${www}/vendor`, { recursive: true });
const common = { bundle: true, minify: true, platform: 'browser', target: 'es2020', logLevel: 'warning' };
await build({ ...common, format: 'esm', outfile: `${www}/vendor/supabase.js`,
  stdin: { contents: "export { createClient } from '@supabase/supabase-js';", resolveDir: process.cwd() } });
await build({ ...common, format: 'iife', entryPoints: ['scripts/native-entry.mjs'], outfile: `${www}/vendor/native.js` });

let html = fs.readFileSync(`${www}/index.html`, 'utf8');
const ESM = 'https://esm.sh/@supabase/supabase-js@2';
if (html.includes(ESM)) html = html.replace(ESM, './vendor/supabase.js');
else if (!html.includes('./vendor/supabase.js')) throw new Error('Could not find the Supabase import in www/index.html');
if (!html.includes('vendor/native.js')) {
  if (!html.includes('<script type="module">')) throw new Error('Could not find the module script in www/index.html');
  html = html.replace('<script type="module">', '<script src="./vendor/native.js"></script>\n<script type="module">');
}
if (repo) html = html.replace("'__GITHUB_REPO__'", JSON.stringify(repo));
fs.writeFileSync(`${www}/index.html`, html);
fs.writeFileSync(`${www}/version.json`, JSON.stringify({ build: buildNo, version }) + '\n');
console.log(`prepared ${www}: build ${buildNo}, version ${version}, repo ${repo || '(not set)'}`);
