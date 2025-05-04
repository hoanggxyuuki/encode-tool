import { useState } from 'react';
import { generateKeyPair, encrypt, demonstrationExample, measureKeyGeneration, measureEncryption, compareKeyPerformance } from './dictionary/encrypt';
import { decrypt, decryptExample } from './dictionary/decrypt';
import './App.css';

function App() {
  const [step, setStep] = useState(1);
  const [primeP, setPrimeP] = useState('');
  const [primeQ, setPrimeQ] = useState('');
  const [keyPair, setKeyPair] = useState(null);
  const [message, setMessage] = useState('');
  const [encryptedMessage, setEncryptedMessage] = useState(null);
  const [decryptedMessage, setDecryptedMessage] = useState('');
  const [error, setError] = useState('');
  const [showExample, setShowExample] = useState(false);
  const [example, setExample] = useState(null);
  const [pError, setPError] = useState('');
  const [qError, setQError] = useState('');

  const suggestedPrimes = [
    2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 
    43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97
  ];

  const validatePrime = (num, setter) => {
    if (!num) {
      setter('Vui lòng nhập số');
      return false;
    }
    const value = parseInt(num);
    if (isNaN(value)) {
      setter('Vui lòng nhập số hợp lệ');
      return false;
    }
    if (value <= 1) {
      setter('Số phải lớn hơn 1');
      return false;
    }
    for (let i = 2; i <= Math.sqrt(value); i++) {
      if (value % i === 0) {
        setter('Số này không phải số nguyên tố');
        return false;
      }
    }
    setter('');
    return true;
  };

  const handlePrimeInputChange = (value, type) => {
    if (type === 'p') {
      setPrimeP(value);
      validatePrime(value, setPError);
    } else {
      setPrimeQ(value);
      validatePrime(value, setQError);
    }
  };

  const handleGenerateKeys = () => {
    setError('');
    if (!validatePrime(primeP, setPError) || !validatePrime(primeQ, setQError)) {
      return;
    }

    try {
      const keys = generateKeyPair(primeP, primeQ);
      setKeyPair(keys);
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEncrypt = () => {
    if (!keyPair) {
      setError('Vui lòng sinh khóa trước');
      return;
    }
    if (!message.trim()) {
      setError('Vui lòng nhập thông điệp cần mã hóa');
      return;
    }
    try {
      const encrypted = encrypt(message, keyPair.publicKey);
      setEncryptedMessage(encrypted);
      setError('');
      setStep(3);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDecrypt = () => {
    if (!encryptedMessage || !keyPair) {
      setError('Vui lòng mã hóa thông điệp trước');
      return;
    }
    try {
      const decrypted = decrypt(encryptedMessage, keyPair.privateKey);
      setDecryptedMessage(decrypted);
      setError('');
      setStep(4);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadExample = () => {
    const demoValues = demonstrationExample();
    setExample(demoValues);
    setPrimeP(demoValues.p.toString());
    setPrimeQ(demoValues.q.toString());
    setShowExample(true);
  };

  return (
    <div className="container">
      <h1>Mã Hóa RSA</h1>
      
      <div className="process-steps">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>
          <h2>Bước 1: Sinh Khóa</h2>
          <div className="step-content">
            <h3>1.1 Chọn hai số nguyên tố p và q</h3>
            <div className="input-section">
              <div className="input-group">
                <div className="input-with-error">
                  <input
                    type="number"
                    placeholder="Nhập số nguyên tố p"
                    value={primeP}
                    onChange={(e) => handlePrimeInputChange(e.target.value, 'p')}
                    className={pError ? 'error' : ''}
                    style={{ color: pError ? 'red' : 'black' }}
                  />
                  {pError && <div className="input-error">{pError}</div>}
                </div>
                <div className="input-with-error">
                  <input
                    type="number"
                    placeholder="Nhập số nguyên tố q"
                    value={primeQ}
                    onChange={(e) => handlePrimeInputChange(e.target.value, 'q')}
                    className={qError ? 'error' : ''}
                    style={{ color: pError ? 'red' : 'black' }}
                  />
                  {qError && <div className="input-error">{qError}</div>}
                </div>
                <button onClick={handleGenerateKeys}>Sinh Khóa</button>
              </div>
              <div className="prime-suggestions">
                <h4>Các số nguyên tố gợi ý:</h4>
                <div className="prime-numbers">
                  {suggestedPrimes.map(prime => (
                    <button
                      key={prime}
                      className="prime-number"
                      onClick={() => !primeP ? setPrimeP(prime.toString()) : setPrimeQ(prime.toString())}
                    >
                      {prime}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {keyPair && (
              <>
                <h3>1.2 Tính n = p * q</h3>
                <p className="value">n = {keyPair.publicKey.n}</p>

                <h3>1.3 Tính hàm Carmichael λ(n)</h3>
                <p className="value">λ(n) = {keyPair.debug.lambda}</p>

                <h3>1.4 Chọn số mũ công khai (e)</h3>
                <p className="value">e = {keyPair.publicKey.e}</p>

                <h3>1.5 Tính số mũ bí mật (d)</h3>
                <p className="value">d = {keyPair.privateKey.d}</p>

                <div className="key-result">
                  <div className="public-key">
                    <h3>1.6 Khóa Công Khai (n, e)</h3>
                    <p>n = {keyPair.publicKey.n}</p>
                    <p>e = {keyPair.publicKey.e}</p>
                  </div>
                  <div className="private-key">
                    <h3>1.7 Khóa Bí Mật (n, d)</h3>
                    <p>n = {keyPair.privateKey.n}</p>
                    <p>d = {keyPair.privateKey.d}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className={`step ${step >= 2 ? 'active' : ''}`}>
          <h2>Bước 2: Mã Hóa</h2>
          <div className="step-content">
            <h3>Nhập thông điệp cần mã hóa</h3>
            <div className="input-group">
              <textarea
                placeholder="Nhập thông điệp..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ color: pError ? 'red' : 'black' }}
              />
              <button onClick={handleEncrypt}>Mã Hóa</button>
            </div>
            {encryptedMessage && (
              <div className="result">
                <h3>Thông Điệp Đã Mã Hóa</h3>
                <p className="value">{JSON.stringify(encryptedMessage)}</p>
              </div>
            )}
          </div>
        </div>

        <div className={`step ${step >= 3 ? 'active' : ''}`}>
          <h2>Bước 3: Giải Mã</h2>
          <div className="step-content">
            <button onClick={handleDecrypt}>Giải Mã</button>
            {decryptedMessage && (
              <div className="result">
                <h3>Thông Điệp Đã Giải Mã</h3>
                <p className="value">{decryptedMessage}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="example-section">
        <h2>Ví Dụ Minh Họa</h2>
        <button onClick={loadExample} className="example-button">
          Xem ví dụ (p=61, q=53)
        </button>
        {showExample && example && (
          <div className="example-content">
            <h3>Các giá trị trong ví dụ:</h3>
            <ul>
              <li>p = {example.p}</li>
              <li>q = {example.q}</li>
              <li>n = {example.n}</li>
              <li>λ(n) = {example.lambda}</li>
              <li>e = {example.e}</li>
              <li>d = {example.d}</li>
            </ul>
            <p>Kết quả khóa:</p>
            <ul>
              <li>Khóa công khai: (3233, 17)</li>
              <li>Khóa bí mật: (3233, 413)</li>
            </ul>
          </div>
        )}
      </div>

      {error && <div className="error">{error}</div>}
    </div>
  );
}

export default App;
