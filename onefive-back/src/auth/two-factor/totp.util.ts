import { createHmac, randomBytes } from 'crypto';

/**
 * TOTP (RFC 6238) + base32 (RFC 4648), sans dépendance externe.
 * Testé contre les vecteurs officiels de la RFC 6238 (voir totp.util.spec).
 */

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

export function base32Decode(input: string): Buffer {
  const clean = input.replace(/=+$/, '').toUpperCase().replace(/\s/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of clean) {
    const idx = BASE32_ALPHABET.indexOf(char);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/** Génère un secret TOTP aléatoire (base32, 20 octets). */
export function generateSecret(): string {
  return base32Encode(randomBytes(20));
}

/** Génère le token TOTP pour un secret base32 à un instant donné (ms epoch). */
export function generateToken(
  secretBase32: string,
  forTimeMs: number = Date.now(),
  digits = 6,
  periodSec = 30,
): string {
  const counter = Math.floor(forTimeMs / 1000 / periodSec);
  const counterBuf = Buffer.alloc(8);
  // big-endian 64 bits (les 32 bits hauts sont 0 en pratique)
  counterBuf.writeUInt32BE(Math.floor(counter / 2 ** 32), 0);
  counterBuf.writeUInt32BE(counter >>> 0, 4);

  const hmac = createHmac('sha1', base32Decode(secretBase32))
    .update(counterBuf)
    .digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const binCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return (binCode % 10 ** digits).toString().padStart(digits, '0');
}

/**
 * Vérifie un token contre un secret, avec une fenêtre de tolérance (±window
 * périodes) pour absorber le décalage d'horloge.
 */
export function verifyToken(
  secretBase32: string,
  token: string,
  window = 1,
  atTimeMs: number = Date.now(),
): boolean {
  const cleaned = (token || '').replace(/\s/g, '');
  if (!/^\d{6}$/.test(cleaned)) return false;
  for (let errorWindow = -window; errorWindow <= window; errorWindow++) {
    const t = atTimeMs + errorWindow * 30 * 1000;
    if (generateToken(secretBase32, t) === cleaned) return true;
  }
  return false;
}

/** URL otpauth:// pour les apps d'authentification. */
export function otpauthUrl(
  secretBase32: string,
  accountLabel: string,
  issuer = 'OneFive',
): string {
  const label = encodeURIComponent(`${issuer}:${accountLabel}`);
  const params = new URLSearchParams({
    secret: secretBase32,
    issuer,
    algorithm: 'SHA1',
    digits: '6',
    period: '30',
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

/** Codes de secours (anti-lockout) : n codes hex de 8 caractères. */
export function generateBackupCodes(n = 8): string[] {
  return Array.from({ length: n }, () =>
    randomBytes(4).toString('hex').toUpperCase(),
  );
}
