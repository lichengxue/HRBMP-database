const fs = require('node:fs');
const path = require('node:path');

const args = process.argv.slice(2);
const outputFlag = args.indexOf('--output');
const output = outputFlag >= 0 ? args[outputFlag + 1] : 'gui/config.js';
const supabaseUrl = process.env.HRBMP_SUPABASE_URL || 'https://vnqulddrlhkftcqpekpl.supabase.co';
const publishableKey = (process.env.HRBMP_SUPABASE_PUBLISHABLE_KEY || '').trim();
let publicKey = publishableKey.startsWith('sb_publishable_');
try {
  publicKey ||= JSON.parse(Buffer.from(publishableKey.split('.')[1] || '', 'base64url').toString()).role === 'anon';
} catch {}
if (publishableKey && !publicKey) throw new Error('Use a publishable/anon key, never a secret/service-role key.');
if (!publishableKey && args.includes('--require-key')) {
  throw new Error('Set the GitHub Actions variable HRBMP_SUPABASE_PUBLISHABLE_KEY before deploying.');
}
const parsedUrl = new URL(supabaseUrl);
if (parsedUrl.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(parsedUrl.hostname)) {
  throw new Error('The Supabase URL must use HTTPS.');
}
fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
fs.writeFileSync(output, `window.HRBMP_CONFIG = ${JSON.stringify({ supabaseUrl: parsedUrl.origin, publishableKey }, null, 2)};\n`);
console.log(`Generated ${output}; ${publishableKey ? 'live archive configured' : 'publishable key not set'}.`);
