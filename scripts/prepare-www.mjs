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
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const [major, minor] = pkg.version.split('.');
const version = `${major}.${minor}.${buildNo}`;   // name of the downloadable web bundle (unique per build)
// "web" is the app's own version number (APP_VERSION in index.html). The in-app update notice compares THIS,
// so it keeps working even if GitHub's build counter ever restarts. "minApk" is the oldest installed app FILE
// (APK) that can still take web updates; raise minApkVersion in package.json only when a release needs native
// changes (new plugin, permission, icon). Older app files are then told to download the new APK.
const minApk = String(pkg.minApkVersion || '');

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
const web = (html.match(/const APP_VERSION = '(\d+\.\d+\.\d+)'/) || [])[1];
if (!web) throw new Error('Could not read APP_VERSION from www/index.html');
if (web !== pkg.version) console.warn(`::warning::APP_VERSION in index.html (${web}) and package.json (${pkg.version}) differ. Bump both together.`);
fs.writeFileSync(`${www}/version.json`, JSON.stringify({ build: buildNo, version, web, minApk }) + '\n');
console.log(`prepared ${www}: build ${buildNo}, bundle ${version}, app version ${web}, minApk ${minApk || '(none)'}, repo ${repo || '(not set)'}`);
