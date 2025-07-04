import { useState } from 'react';
import { generateKeyPair, encrypt, demonstrationExample, measureKeyGeneration, measureEncryption } from './dictionary/encrypt';
import { decrypt, measureDecryption } from './dictionary/decrypt';
import './App.css';

function App() {
  // Key generation states
  const [primeP, setPrimeP] = useState('');
  const [primeQ, setPrimeQ] = useState('');
  const [keyPair, setKeyPair] = useState(null);
  const [pError, setPError] = useState('');
  const [qError, setQError] = useState('');
  
  // Encryption states
  const [message, setMessage] = useState('');
  const [encryptedMessage, setEncryptedMessage] = useState(null);
  const [encryptError, setEncryptError] = useState('');
  
  // Decryption states
  const [decryptTab, setDecryptTab] = useState('auto');
  const [manualEncryptedInput, setManualEncryptedInput] = useState('');
  const [decryptedMessage, setDecryptedMessage] = useState('');
  const [decryptError, setDecryptError] = useState('');
  
  // Decryption step visualization states
  const [decryptionSteps, setDecryptionSteps] = useState({
    prepared: false,
    decryptedChars: [],
    combined: false,
    completed: false
  });
  
  // Example states
  const [showExample, setShowExample] = useState(false);
  const [example, setExample] = useState(null);

  // Add state for manual key input
  const [manualKeyN, setManualKeyN] = useState('');
  const [manualKeyD, setManualKeyD] = useState('');
  const [manualKeyError, setManualKeyError] = useState('');

  // Performance evaluation states
  const [performanceResults, setPerformanceResults] = useState({
    keyGen: null,
    encryption: null,
    decryption: null
  });
  const [performanceError, setPerformanceError] = useState('');
  const [iterations, setIterations] = useState(10);
  const [benchmarkType, setBenchmarkType] = useState('all'); // 'keyGen', 'encrypt', 'decrypt', 'all'
  const [runningBenchmark, setRunningBenchmark] = useState(false);

  const suggestedPrimes = [
    2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 
    401, 409, 419, 421, 431, 433, 439, 443,
449, 457, 461, 463, 467, 479, 487, 491,
499, 503, 509, 521, 523, 541, 547, 557,
563, 569, 571, 577
]
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
    if (!validatePrime(primeP, setPError) || !validatePrime(primeQ, setQError)) {
      return;
    }

    try {
      const keys = generateKeyPair(primeP, primeQ);
      setKeyPair(keys);
      // Clear any previous errors
      setEncryptError('');
      setDecryptError('');
    } catch (err) {
      setEncryptError(err.message);
    }
  };

  const loadExample = () => {
    const demoValues = demonstrationExample();
    setExample(demoValues);
    setPrimeP(demoValues.p.toString());
    setPrimeQ(demoValues.q.toString());
    setShowExample(true);
  };

  const handleEncrypt = () => {
    if (!keyPair) {
      setEncryptError('Vui lòng sinh khóa trước');
      return;
    }
    if (!message.trim()) {
      setEncryptError('Vui lòng nhập thông điệp cần mã hóa');
      return;
    }
    try {
      const encrypted = encrypt(message, keyPair.publicKey);
      setEncryptedMessage(encrypted);
      setEncryptError('');
    } catch (err) {
      setEncryptError(err.message);
    }
  };

  const processDecryption = (input, privateKey, setResult, setError) => {
    try {
      // Step 1: Prepare private key
      setDecryptionSteps({
        prepared: true,
        decryptedChars: [],
        combined: false,
        completed: false
      });
      
      setTimeout(() => {
        // Step 2: Decrypt each character
        const decryptedChars = input.map((c) => {
          let m = 1;
          for (let i = 0; i < privateKey.d; i++) {
            m = (m * c) % privateKey.n;
          }
          return { 
            original: c,
            decrypted: m,
            char: String.fromCharCode(m)
          };
        });

        setDecryptionSteps(prev => ({
          ...prev,
          decryptedChars
        }));
        
        setTimeout(() => {
          // Step 3: Combine characters
          setDecryptionSteps(prev => ({
            ...prev,
            combined: true
          }));
          
          setTimeout(() => {
            // Step 4: Return final message
            const decrypted = decrypt(input, privateKey);
            setResult(decrypted);
            setDecryptionSteps(prev => ({
              ...prev,
              completed: true
            }));
            setError('');
          }, 500);
        }, 500);
      }, 500);
    } catch (err) {
      setError(err.message);
      setDecryptionSteps({
        prepared: false,
        decryptedChars: [],
        combined: false,
        completed: false
      });
    }
  };

  const handleDecryptFromEncrypted = () => {
    if (!keyPair) {
      setDecryptError('Vui lòng sinh khóa trước');
      return;
    }
    if (!encryptedMessage || !Array.isArray(encryptedMessage)) {
      setDecryptError('Không có thông điệp mã hóa để giải mã');
      return;
    }
    
    processDecryption(encryptedMessage, keyPair.privateKey, setDecryptedMessage, setDecryptError);
  };

  const handleManualDecrypt = () => {
    try {
      // Check if we should use manually entered keys or generated keys
      let privateKey;
      if (decryptTab === 'manual' && manualKeyN && manualKeyD) {
        // Validate manual key inputs
        const n = parseInt(manualKeyN);
        const d = parseInt(manualKeyD);
        
        if (isNaN(n) || n <= 0) {
          setManualKeyError('n phải là số nguyên dương');
          return;
        }
        
        if (isNaN(d) || d <= 0) {
          setManualKeyError('d phải là số nguyên dương');
          return;
        }
        
        privateKey = { n, d };
      } else if (keyPair) {
        privateKey = keyPair.privateKey;
      } else {
        setDecryptError('Vui lòng sinh khóa hoặc nhập khóa bí mật thủ công');
        return;
      }

      // Parse the input as JSON array of numbers
      let parsedInput;
      try {
        parsedInput = JSON.parse(manualEncryptedInput);
        if (!Array.isArray(parsedInput)) {
          throw new Error();
        }
      } catch (e) {
        setDecryptError('Vui lòng nhập mảng số hợp lệ dưới dạng JSON. Ví dụ: [123, 456, 789]');
        return;
      }

      // Reset any previous errors
      setManualKeyError('');
      processDecryption(parsedInput, privateKey, setDecryptedMessage, setDecryptError);
    } catch (err) {
      setDecryptError(err.message);
    }
  };

  const resetDecryption = () => {
    setDecryptionSteps({
      prepared: false,
      decryptedChars: [],
      combined: false,
      completed: false
    });
    setDecryptedMessage('');
    setDecryptError('');
  };

  // Hàm thực hiện đánh giá hiệu suất
  const runPerformanceBenchmark = () => {
    if (!keyPair && (benchmarkType === 'all' || benchmarkType === 'encrypt' || benchmarkType === 'decrypt')) {
      setPerformanceError('Vui lòng sinh khóa trước khi đánh giá hiệu suất');
      return;
    }

    if ((benchmarkType === 'encrypt' || benchmarkType === 'all') && !message.trim()) {
      setPerformanceError('Vui lòng nhập thông điệp để đánh giá hiệu suất mã hóa');
      return;
    }

    if ((benchmarkType === 'decrypt' || benchmarkType === 'all') && !encryptedMessage) {
      setPerformanceError('Vui lòng mã hóa thông điệp trước khi đánh giá hiệu suất giải mã');
      return;
    }

    setRunningBenchmark(true);
    setPerformanceError('');

    // Tạo một bản sao của các kết quả hiện tại
    const newResults = { ...performanceResults };

    // Thực hiện các phép đo tùy thuộc vào loại đánh giá được chọn
    const runTests = async () => {
      try {
        // Đánh giá hiệu suất sinh khóa
        if (benchmarkType === 'keyGen' || benchmarkType === 'all') {
          const keyGenResults = measureKeyGeneration(primeP, primeQ, iterations);
          newResults.keyGen = keyGenResults;
        }

        // Đánh giá hiệu suất mã hóa
        if ((benchmarkType === 'encrypt' || benchmarkType === 'all') && message.trim()) {
          const encryptionResults = measureEncryption(message, keyPair.publicKey, iterations);
          newResults.encryption = encryptionResults;
        }

        // Đánh giá hiệu suất giải mã
        if ((benchmarkType === 'decrypt' || benchmarkType === 'all') && encryptedMessage) {
          const decryptionResults = measureDecryption(encryptedMessage, keyPair.privateKey, iterations);
          newResults.decryption = decryptionResults;
        }

        setPerformanceResults(newResults);
      } catch (err) {
        setPerformanceError(`Lỗi khi thực hiện đánh giá hiệu suất: ${err.message}`);
      } finally {
        setRunningBenchmark(false);
      }
    };

    runTests();
  };

  // Hàm định dạng thời gian hiển thị
  const formatTime = (timeMs) => {
    if (timeMs < 1) {
      return `${(timeMs * 1000).toFixed(2)} µs`;
    }
    return `${timeMs.toFixed(2)} ms`;
  };

  return (
    <div className="container">
      <h1>Mã Hóa RSA</h1>
      
      <div className="tool-sections">
        {/* Key Generation Section */}
        <div className="tool-section">
          <h2>Sinh Khóa</h2>
          <div className="tool-content">
            <h3>Chọn hai số nguyên tố p và q</h3>
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
              <div className="key-details">
                <h3>Tính n = p * q</h3>
                <p className="value">n = {keyPair.publicKey.n}</p>

                <h3>Tính hàm Carmichael λ(n)</h3>
                <p className="value">λ(n) = {keyPair.debug.lambda}</p>

                <h3>Chọn số mũ công khai (e)</h3>
                <p className="value">e = {keyPair.publicKey.e}</p>

                <h3>Tính số mũ bí mật (d)</h3>
                <p className="value">d = {keyPair.privateKey.d}</p>

                <div className="key-result">
                  <div className="public-key">
                    <h3>Khóa Công Khai (n, e)</h3>
                    <p>n = {keyPair.publicKey.n}</p>
                    <p>e = {keyPair.publicKey.e}</p>
                  </div>
                  <div className="private-key">
                    <h3>Khóa Bí Mật (n, d)</h3>
                    <p>n = {keyPair.privateKey.n}</p>
                    <p>d = {keyPair.privateKey.d}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Encryption Section */}
        <div className="tool-section">
          <h2>Mã Hóa</h2>
          <div className="tool-content">
            <h3>Nhập thông điệp cần mã hóa</h3>
            <div className="input-group">
              <textarea
                placeholder="Nhập thông điệp..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ color: pError ? 'red' : 'black' }}
              />
              <button onClick={handleEncrypt} disabled={!keyPair}>Mã Hóa</button>
            </div>
            {encryptedMessage && (
              <div className="result">
                <h3>Thông Điệp Đã Mã Hóa</h3>
                <p className="value">{JSON.stringify(encryptedMessage)}</p>
              </div>
            )}
            {encryptError && <div className="error">{encryptError}</div>}
          </div>
        </div>

        {/* Decryption Section */}
        <div className="tool-section">
          <h2>Giải Mã</h2>
          <div className="tool-content">
            {/* Replace tab buttons with toggle switch */}
            <div className="toggle-container">
              <span className={`toggle-label ${decryptTab === 'auto' ? 'active' : ''}`}>
                Từ kết quả mã hóa
              </span>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={decryptTab === 'manual'} 
                  onChange={() => {
                    setDecryptTab(decryptTab === 'auto' ? 'manual' : 'auto');
                    resetDecryption();
                  }}
                />
                <span className="toggle-slider"></span>
              </label>
              <span className={`toggle-label ${decryptTab === 'manual' ? 'active' : ''}`}>
                Nhập thủ công
              </span>
            </div>

            {decryptTab === 'auto' && (
              <div className="auto-decrypt">
                <button 
                  onClick={handleDecryptFromEncrypted} 
                  disabled={!keyPair || !encryptedMessage || decryptionSteps.prepared}
                >
                  Giải Mã
                </button>
              </div>
            )}

            {decryptTab === 'manual' && (
              <div className="manual-decrypt">
                <h3>Nhập thông điệp đã mã hóa</h3>
                <div className="input-group">
                  <textarea
                    placeholder='Nhập dạng mảng số. Ví dụ: [123, 456, 789]'
                    value={manualEncryptedInput}
                    onChange={(e) => setManualEncryptedInput(e.target.value)}
                    style={{ color: pError ? 'red' : 'black' }}
                  />
                </div>
                
                <h3>Nhập khóa bí mật (hoặc sử dụng khóa đã sinh)</h3>
                <div className="key-input-group">
                  <div className="key-input">
                    <label>n:</label>
                    <input 
                      type="number" 
                      placeholder="Nhập n" 
                      value={manualKeyN}
                      onChange={(e) => setManualKeyN(e.target.value)}
                      style={{ color: pError ? 'red' : 'black' }}
                    />
                  </div>
                  <div className="key-input">
                    <label>d:</label>
                    <input 
                      type="number" 
                      placeholder="Nhập d" 
                      value={manualKeyD}
                      onChange={(e) => setManualKeyD(e.target.value)}
                      style={{ color: pError ? 'red' : 'black' }}
                    />
                  </div>
                </div>
                
                {manualKeyError && <div className="error">{manualKeyError}</div>}
                
                <button 
                  onClick={handleManualDecrypt}
                  disabled={decryptionSteps.prepared || (!manualEncryptedInput)}
                >
                  Giải Mã
                </button>
              </div>
            )}
            
            {decryptError && (
              <div className="error">{decryptError}</div>
            )}
            
            {/* Display decryption steps */}
            {decryptionSteps.prepared && (
              <div className="decryption-steps">
                <h3>Bước 1: Chuẩn bị khóa bí mật</h3>
                <div className="key-details">
                  <p>d = {keyPair?.privateKey.d}</p>
                  <p>n = {keyPair?.privateKey.n}</p>
                </div>
                
                {decryptionSteps.decryptedChars.length > 0 && (
                  <div className="decrypt-step">
                    <h3>Bước 2: Giải mã từng phần của thông điệp</h3>
                    <div className="decryption-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Mã đã mã hóa (c)</th>
                            <th>Giá trị giải mã (m)</th>
                            <th>Ký tự</th>
                          </tr>
                        </thead>
                        <tbody>
                          {decryptionSteps.decryptedChars.map((item, i) => (
                            <tr key={i}>
                              <td>{item.original}</td>
                              <td>{item.decrypted}</td>
                              <td>{item.char}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {decryptionSteps.combined && (
                  <div className="decrypt-step">
                    <h3>Bước 3: Kết hợp các ký tự đã giải mã</h3>
                    <p>
                      Kết hợp các ký tự: {decryptionSteps.decryptedChars.map(c => c.char).join('')}
                    </p>
                  </div>
                )}
                
                {decryptionSteps.completed && (
                  <div className="decrypt-step">
                    <h3>Bước 4: Thông điệp đã giải mã hoàn chỉnh</h3>
                    <div className="result">
                      <p className="value">{decryptedMessage}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* If already decrypted but not showing steps */}
            {!decryptionSteps.prepared && decryptedMessage && (
              <div className="result">
                <h3>Thông Điệp Đã Giải Mã</h3>
                <p className="value">{decryptedMessage}</p>
              </div>
            )}
          </div>
        </div>

        {/* Performance Evaluation Section - NEW */}
        <div className="tool-section">
          <h2>Đánh Giá Hiệu Suất</h2>
          <div className="tool-content">
            <h3>Chọn loại đánh giá</h3>
            <div className="benchmark-options">
              <select 
                value={benchmarkType} 
                onChange={(e) => setBenchmarkType(e.target.value)}
                className="benchmark-select"
              >
                <option value="all">Tất cả</option>
                <option value="keyGen">Sinh khóa</option>
                <option value="encrypt">Mã hóa</option>
                <option value="decrypt">Giải mã</option>
              </select>

              <div className="iterations-input">
                <label>Số lần lặp lại:</label>
                <input 
                  type="number" 
                  min="1" 
                  max="100"
                  value={iterations} 
                  onChange={(e) => setIterations(Math.max(1, parseInt(e.target.value) || 1))} 
                  style={{ color: pError ? 'red' : 'black' }}

                />
              </div>

              <button 
                onClick={runPerformanceBenchmark} 
                disabled={runningBenchmark}
                className="benchmark-button"
              >
                {runningBenchmark ? 'Đang đánh giá...' : 'Chạy đánh giá'}
              </button>
            </div>

            {performanceError && <div className="error">{performanceError}</div>}

            {/* Hiển thị kết quả đánh giá hiệu suất */}
            <div className="performance-results">
              {/* Kết quả sinh khóa */}
              {performanceResults.keyGen && (
                <div className="performance-result-section">
                  <h3>Kết quả đánh giá hiệu suất sinh khóa</h3>
                  <div className="performance-card">
                    <p><strong>Kích thước khóa:</strong> {performanceResults.keyGen.keySize}</p>
                    <p><strong>Thời gian trung bình:</strong> {formatTime(performanceResults.keyGen.averageTime)}</p>
                    <p><strong>Thời gian nhanh nhất:</strong> {formatTime(performanceResults.keyGen.minTime)}</p>
                    <p><strong>Thời gian chậm nhất:</strong> {formatTime(performanceResults.keyGen.maxTime)}</p>
                    <p><strong>Số lần lặp lại:</strong> {performanceResults.keyGen.iterations}</p>
                  </div>
                </div>
              )}

              {/* Kết quả mã hóa */}
              {performanceResults.encryption && (
                <div className="performance-result-section">
                  <h3>Kết quả đánh giá hiệu suất mã hóa</h3>
                  <div className="performance-card">
                    <p><strong>Độ dài thông điệp:</strong> {performanceResults.encryption.messageLength} ký tự</p>
                    <p><strong>Kích thước khóa (n):</strong> {performanceResults.encryption.keySize}</p>
                    <p><strong>Thời gian trung bình:</strong> {formatTime(performanceResults.encryption.averageTime)}</p>
                    <p><strong>Thời gian nhanh nhất:</strong> {formatTime(performanceResults.encryption.minTime)}</p>
                    <p><strong>Thời gian chậm nhất:</strong> {formatTime(performanceResults.encryption.maxTime)}</p>
                    <p><strong>Số lần lặp lại:</strong> {performanceResults.encryption.iterations}</p>
                  </div>
                </div>
              )}

              {/* Kết quả giải mã */}
              {performanceResults.decryption && (
                <div className="performance-result-section">
                  <h3>Kết quả đánh giá hiệu suất giải mã</h3>
                  <div className="performance-card">
                    <p><strong>Độ dài thông điệp mã hóa:</strong> {performanceResults.decryption.messageLength} phần tử</p>
                    <p><strong>Kích thước khóa (n):</strong> {performanceResults.decryption.keySize}</p>
                    <p><strong>Thời gian trung bình:</strong> {formatTime(performanceResults.decryption.averageTime)}</p>
                    <p><strong>Thời gian nhanh nhất:</strong> {formatTime(performanceResults.decryption.minTime)}</p>
                    <p><strong>Thời gian chậm nhất:</strong> {formatTime(performanceResults.decryption.maxTime)}</p>
                    <p><strong>Số lần lặp lại:</strong> {performanceResults.decryption.iterations}</p>
                  </div>
                </div>
              )}

              {/* So sánh thời gian (nếu có cả mã hóa và giải mã) */}
              {performanceResults.encryption && performanceResults.decryption && (
                <div className="performance-comparison">
                  <h3>So sánh thời gian mã hóa và giải mã</h3>
                  <div className="comparison-chart">
                    <div 
                      className="chart-bar encrypt-bar" 
                      style={{ width: `${Math.min(100, performanceResults.encryption.averageTime * 5)}%` }}
                    >
                      <span>Mã hóa: {formatTime(performanceResults.encryption.averageTime)}</span>
                    </div>
                    <div 
                      className="chart-bar decrypt-bar" 
                      style={{ width: `${Math.min(100, performanceResults.decryption.averageTime * 5)}%` }}
                    >
                      <span>Giải mã: {formatTime(performanceResults.decryption.averageTime)}</span>
                    </div>
                  </div>

                  <p className="performance-note">
                    <strong>Ghi chú:</strong> Thời gian giải mã thường {performanceResults.decryption.averageTime > performanceResults.encryption.averageTime ? 
                      `lâu hơn mã hóa khoảng ${(performanceResults.decryption.averageTime / performanceResults.encryption.averageTime).toFixed(1)} lần` : 
                      'tương đương với mã hóa'} vì số mũ bí mật (d) thường lớn hơn số mũ công khai (e).
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Example Section */}
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
    </div>
  );
}

export default App;
