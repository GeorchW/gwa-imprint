export interface CaptchaProtectedData {
  cipherText: string;
  cipherSalt: string;
  cipherIv: string;
}

function bufferToHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, "0")).join("");
}
function hexToBuffer(hex: string) {
  const numbers = hex
    .match(/[\da-f]{2}/gi)
    ?.map(h => parseInt(h, 16));
  if (numbers === undefined)
    return undefined;
  return new Uint8Array(numbers);
}

async function importKeyFromPassphrase(key: string, salt: Uint8Array) {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(key),
    { name: "PBKDF2" },
    false,
    ["deriveKey", "deriveBits"]
  );
  const cipherKey = await crypto.subtle.deriveKey({
    name: "PBKDF2",
    hash: "SHA-256",
    salt: salt,
    iterations: 100_000
  },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]);
  return cipherKey;
}

export async function createCapcha(answer: string, message: string): Promise<CaptchaProtectedData> {
  const messageData = new TextEncoder().encode(message);

  const salt = await crypto.getRandomValues(new Uint8Array(16));
  const derivedKey = await importKeyFromPassphrase(answer, salt);

  const iv = crypto.getRandomValues(new Uint8Array(16));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv, length: 256 }, derivedKey, messageData);
  return { cipherSalt: bufferToHex(salt), cipherIv: bufferToHex(iv), cipherText: bufferToHex(ciphertext) };
}

export async function solveCaptcha(captcha: CaptchaProtectedData, answer: string): Promise<string | null> {
  const decryptKey = await importKeyFromPassphrase(answer, hexToBuffer(captcha.cipherSalt)!);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", length: 256, iv: hexToBuffer(captcha.cipherIv) }, decryptKey, hexToBuffer(captcha.cipherText)!).catch(() => null);
  if (decrypted === null) return null;
  return new TextDecoder().decode(decrypted);
}