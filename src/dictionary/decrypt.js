// RSA Decryption
const rsaDecrypt = (encryptedMessage, privateKey) => {
  const { d, n } = privateKey;
  return encryptedMessage.map(num => {
    let result = 1;
    for (let i = 0; i < d; i++) {
      result = (result * num) % n;
    }
    return String.fromCharCode(result);
  }).join('');
};

// Caesar Cipher Decryption
const caesarDecrypt = (text, shift) => {
  return text
    .split('')
    .map(char => {
      if (char.match(/[a-z]/i)) {
        const code = char.charCodeAt(0);
        const isUpperCase = code >= 65 && code <= 90;
        const base = isUpperCase ? 65 : 97;
        return String.fromCharCode(((code - base - shift + 26) % 26) + base);
      }
      return char;
    })
    .join('');
};

// Base64 Decoding
const base64Decode = (encodedText) => {
  try {
    return atob(encodedText);
  } catch (e) {
    throw new Error('Invalid Base64 string');
  }
};

// AES Decryption
const aesDecrypt = (encryptedData, key) => {
  // This is a simplified version for demo
  const result = [];
  for (let i = 0; i < encryptedData.length; i++) {
    result.push(String.fromCharCode(encryptedData[i] ^ key.charCodeAt(i % key.length)));
  }
  return result.join('');
};

export {
  rsaDecrypt,
  caesarDecrypt,
  base64Decode,
  aesDecrypt
};