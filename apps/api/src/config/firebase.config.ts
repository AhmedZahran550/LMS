import { registerAs } from '@nestjs/config';

function loadServiceAccount() {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  let raw = b64 ? Buffer.from(b64, 'base64').toString('utf8') : json;
  if (!raw) return undefined;

  // strip accidental wrapping quotes
  raw = raw.trim();
  if (raw.startsWith('"') && raw.endsWith('"')) raw = raw.slice(1, -1);

  // turn real newlines/CRs into escaped ones so JSON.parse accepts them
  raw = raw.replace(/\r?\n/g, '\\n');

  const creds = JSON.parse(raw);
  if (typeof creds.private_key === 'string') {
    creds.private_key = creds.private_key.replace(/\\n/g, '\n');
  }
  return creds;
}

export default registerAs('firebase', () => ({
  serviceAccountJson: loadServiceAccount(),
}));