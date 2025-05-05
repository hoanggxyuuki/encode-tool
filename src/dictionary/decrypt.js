// Hàm giải mã sử dụng thuật toán RSA
const decrypt = (encryptedMessage, privateKey) => {
  // Bước 1: Chuẩn bị khóa bí mật
  const { d, n } = privateKey;
  
  if (!encryptedMessage || !Array.isArray(encryptedMessage)) {
    throw new Error('Thông điệp mã hóa không hợp lệ');
  }
  
  if (!privateKey || !d || !n) {
    throw new Error('Khóa bí mật không hợp lệ');
  }
  
  // Bước 2: Giải mã từng phần của thông điệp
  const decryptedCharacters = encryptedMessage.map(c => {
    // Bước 2.1: Kiểm tra giá trị c (thông điệp mã hóa)
    if (typeof c !== 'number') {
      throw new Error('Giá trị mã hóa phải là số');
    }
    
    // Bước 2.2: Tính m = c^d mod n (công thức giải mã RSA)
    let m = 1;
    for (let i = 0; i < d; i++) {
      m = (m * c) % n;
    }
    
    // Bước 2.3: Chuyển đổi số giải mã thành ký tự
    return String.fromCharCode(m);
  });
  
  // Bước 3: Kết hợp các ký tự đã giải mã thành thông điệp hoàn chỉnh
  const decryptedMessage = decryptedCharacters.join('');
  
  // Bước 4: Trả về thông điệp đã giải mã
  return decryptedMessage;
};

// Hàm giải mã ví dụ minh họa
const decryptExample = (c, d, n) => {
  // Ví dụ: c = 855, d = 413, n = 3233
  // Bước 1: Chuẩn bị tham số
  if (!c || !d || !n) {
    throw new Error('Vui lòng cung cấp đầy đủ c, d và n');
  }
  
  // Bước 2: Tính m = c^d mod n
  let m = 1;
  for (let i = 0; i < d; i++) {
    m = (m * c) % n;
  }
  
  // Bước 3: Trả về giá trị đã giải mã
  return m;
};

export { decrypt, decryptExample };