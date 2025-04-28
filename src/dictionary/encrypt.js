// Function to calculate GCD using Euclidean algorithm
const gcd = (a, b) => {
  if (b === 0) return a;
  return gcd(b, a % b);
};

// Function to calculate LCM
const lcm = (a, b) => {
  return Math.abs(a * b) / gcd(a, b);
};

// Function to calculate modular multiplicative inverse
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

// Function to check if a number is prime
const isPrime = (num) => {
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return num > 1;
};

// Function to generate key pair following RSA algorithm
const generateKeyPair = (p, q) => {
  if (!isPrime(p) || !isPrime(q)) {
    throw new Error('Both numbers must be prime.');
  }

  // Step 2: Calculate n = p * q
  const n = p * q;

  // Step 3: Calculate Carmichael's function λ(n)
  const lambda = lcm(p - 1, q - 1);

  // Step 4: Choose e (public exponent)
  let e = 65537; // Common value for e
  while (e < lambda) {
    if (gcd(e, lambda) === 1) break;
    e++;
  }

  // Step 5: Calculate d (private exponent)
  const d = modInverse(e, lambda);

  // Step 6 & 7: Return public and private keys
  return {
    publicKey: { n, e },     // Public key (n, e)
    privateKey: { n, d },    // Private key (n, d)
    debug: {                 // For demonstration
      p,
      q,
      lambda
    }
  };
};

// Function to encrypt a message
const encrypt = (message, publicKey) => {
  const { e, n } = publicKey;
  
  // Convert message to numbers and encrypt each character
  const encrypted = message.split('').map(char => {
    const m = char.charCodeAt(0);
    if (m >= n) {
      throw new Error('Message value is too large for the chosen key.');
    }
    
    // Encryption formula: c = m^e mod n
    let c = 1;
    for (let i = 0; i < e; i++) {
      c = (c * m) % n;
    }
    return c;
  });

  return encrypted;
};

// Example demonstration function
const demonstrationExample = () => {
  const p = 61;
  const q = 53;
  const keys = generateKeyPair(p, q);
  
  // Should match the example values:
  // n = 3233
  // e = 17
  // d = 413
  return {
    p,
    q,
    n: keys.publicKey.n,
    e: keys.publicKey.e,
    d: keys.privateKey.d,
    lambda: keys.debug.lambda
  };
};

export { generateKeyPair, encrypt, demonstrationExample };