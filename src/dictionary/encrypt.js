// RSA Encryption
const rsaEncrypt = (message, publicKey) => {
  const { e, n } = publicKey;
  const numbers = message.split('').map(char => char.charCodeAt(0));
  return numbers.map(num => {
    let result = 1;
    for (let i = 0; i < e; i++) {
      result = (result * num) % n;
    }
    return result;
  });
};

// Caesar Cipher Encryption
const caesarEncrypt = (text, shift) => {
  return text
    .split('')
    .map(char => {
      if (char.match(/[a-z]/i)) {
        const code = char.charCodeAt(0);
        const isUpperCase = code >= 65 && code <= 90;
        const base = isUpperCase ? 65 : 97;
        return String.fromCharCode(((code - base + shift) % 26) + base);
      }
      return char;
    })
    .join('');
};

// Base64 Encoding
const base64Encode = (text) => {
  return btoa(text);
};

// Simple Hash Function (for demo)
const simpleHash = (text) => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
};

// AES Encryption
const aesEncrypt = (text, key) => {
  // This is a simplified version for demo
  const result = [];
  for (let i = 0; i < text.length; i++) {
    result.push(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
};

const generateRSAKeyPair = (p, q) => {
  const n = p * q;
  const phi = (p - 1) * (q - 1);
  let e = 65537;
  while (e < phi) {
    if (gcd(e, phi) === 1) break;
    e++;
  }
  let d = 0;
  let k = 1;
  while (true) {
    d = (1 + (k * phi)) / e;
    if (Number.isInteger(d)) break;
    k++;
  }
  return {
    publicKey: { e, n },
    privateKey: { d, n }
  };
};

const gcd = (a, b) => {
  if (b === 0) return a;
  return gcd(b, a % b);
};

export {
  rsaEncrypt,
  caesarEncrypt,
  base64Encode,
  simpleHash,
  aesEncrypt,
  generateRSAKeyPair
};