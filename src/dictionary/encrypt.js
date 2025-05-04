const isPrime = (num) => {
  num = parseInt(num);
  
  // Kiểm tra đầu vào có hợp lệ
  if (isNaN(num) || !Number.isInteger(num)) {
    throw new Error('Vui lòng nhập một số hợp lệ');
  }

  // Kiểm tra số dương
  if (num <= 1) {
    throw new Error('Số phải lớn hơn 1');
  }

  // Kiểm tra số nguyên tố
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) {
      throw new Error(`${num} không phải là số nguyên tố`);
    }
  }
  return true;
};

// Hàm tính ƯCLN sử dụng thuật toán Euclid
const gcd = (a, b) => {
  if (b === 0) return a;
  return gcd(b, a % b);
};

// Hàm tính BCNN
const lcm = (a, b) => {
  return Math.abs(a * b) / gcd(a, b);
};

// Hàm tính nghịch đảo modulo
const modInverse = (e, lambda) => {
  let m0 = lambda;
  let y = 0;
  let x = 1;

  if (lambda === 1) return 0;

  while (e > 1) {
    const q = Math.floor(e / lambda);
    let t = lambda;

    lambda = e % lambda;
    e = t;
    t = y;

    y = x - q * y;
    x = t;
  }

  if (x < 0) x += m0;

  return x;
};

// Hàm kiểm tra đầu vào sinh khóa
const validateInputs = (p, q) => {
  // Kiểm tra có đủ hai số
  if (!p || !q) {
    throw new Error('Vui lòng nhập đầy đủ p và q');
  }

  // Chuyển đổi sang số và kiểm tra
  const primeP = parseInt(p);
  const primeQ = parseInt(q);

  if (isNaN(primeP) || isNaN(primeQ)) {
    throw new Error('Vui lòng nhập số hợp lệ');
  }

  // Kiểm tra số quá lớn
  if (primeP > 1000000 || primeQ > 1000000) {
    throw new Error('Số quá lớn. Vui lòng sử dụng số nhỏ hơn');
  }

  // Kiểm tra số nguyên tố
  try {
    isPrime(primeP);
  } catch (err) {
    throw new Error(`p: ${err.message}`);
  }

  try {
    isPrime(primeQ);
  } catch (err) {
    throw new Error(`q: ${err.message}`);
  }

  // Kiểm tra hai số khác nhau
  if (primeP === primeQ) {
    throw new Error('p và q phải là hai số nguyên tố khác nhau');
  }

  return { p: primeP, q: primeQ };
};

// Hàm sinh cặp khóa RSA
const generateKeyPair = (p, q) => {
  // Kiểm tra đầu vào
  const validatedInputs = validateInputs(p, q);
  p = validatedInputs.p;
  q = validatedInputs.q;

  // Bước 2: Tính n = p * q
  const n = p * q;

  // Bước 3: Tính hàm Carmichael λ(n)
  const lambda = lcm(p - 1, q - 1);

  // Bước 4: Chọn e (số mũ công khai)
  let e = 65537; // Giá trị thông dụng cho e
  while (e < lambda) {
    if (gcd(e, lambda) === 1) break;
    e++;
  }

  // Bước 5: Tính d (số mũ bí mật)
  const d = modInverse(e, lambda);

  // Bước 6 & 7: Trả về khóa công khai và bí mật
  return {
    publicKey: { n, e },     // Khóa công khai (n, e)
    privateKey: { n, d },    // Khóa bí mật (n, d)
    debug: {                 // Để kiểm tra
      p,
      q,
      lambda
    }
  };
};

// Hàm mã hóa thông điệp
const encrypt = (message, publicKey) => {
  const { e, n } = publicKey;
  
  if (!message) {
    throw new Error('Vui lòng nhập thông điệp cần mã hóa');
  }
  
  // Chuyển thông điệp thành số và mã hóa từng ký tự
  const encrypted = message.split('').map(char => {
    const m = char.charCodeAt(0);
    if (m >= n) {
      throw new Error('Giá trị thông điệp quá lớn cho khóa đã chọn');
    }
    
    // Công thức mã hóa: c = m^e mod n
    let c = 1;
    for (let i = 0; i < e; i++) {
      c = (c * m) % n;
    }
    return c;
  });

  return encrypted;
};

// Hàm minh họa ví dụ
const demonstrationExample = () => {
  const p = 61;
  const q = 53;
  const keys = generateKeyPair(p, q);
  
  return {
    p,
    q,
    n: keys.publicKey.n,
    e: keys.publicKey.e,
    d: keys.privateKey.d,
    lambda: keys.debug.lambda
  };
};
const measureKeyGeneration = (p, q, iterations = 10) => {
  // Kiểm tra đầu vào
  try {
    validateInputs(p, q);
  } catch (err) {
    return { error: err.message };
  }

  const results = [];
  let totalTime = 0;

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    generateKeyPair(p, q);
    const endTime = performance.now();
    
    const elapsedTime = endTime - startTime;
    results.push(elapsedTime);
    totalTime += elapsedTime;
  }

  return {
    averageTime: totalTime / iterations,
    minTime: Math.min(...results),
    maxTime: Math.max(...results),
    totalTime,
    iterations,
    keySize: `p=${p}, q=${q}, n=${p*q}`,
    results
  };
};

// Hàm đo hiệu suất mã hóa
const measureEncryption = (message, publicKey, iterations = 10) => {
  if (!message) {
    return { error: 'Vui lòng nhập thông điệp cần mã hóa' };
  }
  
  if (!publicKey || !publicKey.e || !publicKey.n) {
    return { error: 'Khóa công khai không hợp lệ' };
  }

  const results = [];
  let totalTime = 0;

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    encrypt(message, publicKey);
    const endTime = performance.now();
    
    const elapsedTime = endTime - startTime;
    results.push(elapsedTime);
    totalTime += elapsedTime;
  }

  return {
    averageTime: totalTime / iterations,
    minTime: Math.min(...results),
    maxTime: Math.max(...results),
    totalTime,
    iterations,
    messageLength: message.length,
    keySize: publicKey.n,
    results
  };
};

// Hàm đo hiệu suất với các kích thước khóa khác nhau
const compareKeyPerformance = (keySizes = [{ p: 17, q: 19 }, { p: 61, q: 53 }, { p: 101, q: 103 }]) => {
  const results = [];
  
  for (const keySize of keySizes) {
    try {
      const { p, q } = keySize;
      const performanceData = measureKeyGeneration(p, q, 5);
      const keys = generateKeyPair(p, q);
      
      results.push({
        p,
        q,
        n: p * q,
        keyGenerationTime: performanceData.averageTime,
        encryptionTime: measureEncryption("Test message for performance", keys.publicKey, 5).averageTime
      });
    } catch (err) {
      results.push({
        p: keySize.p,
        q: keySize.q,
        error: err.message
      });
    }
  }
  
  return results;
};

export { generateKeyPair, encrypt, demonstrationExample, measureKeyGeneration, measureEncryption, compareKeyPerformance };