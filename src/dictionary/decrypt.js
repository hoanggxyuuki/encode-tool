// Hàm giải mã sử dụng thuật toán RSA
const decrypt = (encryptedMessage, privateKey) => {
  const { d, n } = privateKey;
  
  // Giải mã từng số sử dụng công thức: m = c^d mod n
  return encryptedMessage.map(c => {
    let m = 1;
    for (let i = 0; i < d; i++) {
      m = (m * c) % n;
    }
    return String.fromCharCode(m);
  }).join('');
};

// Hàm giải mã ví dụ minh họa
const decryptExample = (c, d, n) => {
  // Ví dụ: c = 855, d = 413, n = 3233
  // Kết quả mong đợi: 123
  let m = 1;
  for (let i = 0; i < d; i++) {
    m = (m * c) % n;
  }
  return m;
};

export { decrypt, decryptExample };