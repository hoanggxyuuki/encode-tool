// Function to decrypt using RSA algorithm
const decrypt = (encryptedMessage, privateKey) => {
  const { d, n } = privateKey;
  
  // Decrypt each number using the formula: m = c^d mod n
  return encryptedMessage.map(c => {
    let m = 1;
    for (let i = 0; i < d; i++) {
      m = (m * c) % n;
    }
    return String.fromCharCode(m);
  }).join('');
};

// Example decryption function for demonstration
const decryptExample = (c, d, n) => {
  // Example: c = 855, d = 413, n = 3233
  // Should return 123
  let m = 1;
  for (let i = 0; i < d; i++) {
    m = (m * c) % n;
  }
  return m;
};

export { decrypt, decryptExample };