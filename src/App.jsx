import { useState } from 'react';
import { generateKeyPair, encrypt, demonstrationExample } from './dictionary/encrypt';
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

  const handleGenerateKeys = () => {
    try {
      const p = parseInt(primeP);
      const q = parseInt(primeQ);
      const keys = generateKeyPair(p, q);
      setKeyPair(keys);
      setError('');
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEncrypt = () => {
    if (!keyPair) {
      setError('Please generate keys first');
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
      setError('Please encrypt a message first');
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
    setShowExample(true);
  };

  return (
    <div className="container">
      <h1>RSA Encryption Process</h1>
      
      <div className="process-steps">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>
          <h2>Step 1: Key Generation</h2>
          <div className="step-content">
            <h3>1.1 Choose two prime numbers p and q</h3>
            <div className="input-group">
              <input
                type="number"
                placeholder="Enter prime number p"
                value={primeP}
                onChange={(e) => setPrimeP(e.target.value)}
              />
              <input
                type="number"
                placeholder="Enter prime number q"
                value={primeQ}
                onChange={(e) => setPrimeQ(e.target.value)}
              />
              <button onClick={handleGenerateKeys}>Generate Keys</button>
            </div>

            {keyPair && (
              <>
                <h3>1.2 Calculate n = p * q</h3>
                <p className="value">n = {keyPair.publicKey.n}</p>

                <h3>1.3 Calculate Carmichael's function λ(n)</h3>
                <p className="value">λ(n) = {keyPair.debug.lambda}</p>

                <h3>1.4 Choose public exponent (e)</h3>
                <p className="value">e = {keyPair.publicKey.e}</p>

                <h3>1.5 Calculate private exponent (d)</h3>
                <p className="value">d = {keyPair.privateKey.d}</p>

                <div className="key-result">
                  <div className="public-key">
                    <h3>1.6 Public Key (n, e)</h3>
                    <p>n = {keyPair.publicKey.n}</p>
                    <p>e = {keyPair.publicKey.e}</p>
                  </div>
                  <div className="private-key">
                    <h3>1.7 Private Key (n, d)</h3>
                    <p>n = {keyPair.privateKey.n}</p>
                    <p>d = {keyPair.privateKey.d}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className={`step ${step >= 2 ? 'active' : ''}`}>
          <h2>Step 2: Encryption</h2>
          <div className="step-content">
            <h3>Enter message to encrypt</h3>
            <div className="input-group">
              <textarea
                placeholder="Enter message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button onClick={handleEncrypt}>Encrypt Message</button>
            </div>
            {encryptedMessage && (
              <div className="result">
                <h3>Encrypted Message</h3>
                <p className="value">{JSON.stringify(encryptedMessage)}</p>
              </div>
            )}
          </div>
        </div>

        <div className={`step ${step >= 3 ? 'active' : ''}`}>
          <h2>Step 3: Decryption</h2>
          <div className="step-content">
            <button onClick={handleDecrypt}>Decrypt Message</button>
            {decryptedMessage && (
              <div className="result">
                <h3>Decrypted Message</h3>
                <p className="value">{decryptedMessage}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="example-section">
        <h2>Example Demonstration</h2>
        <button onClick={loadExample} className="example-button">
          Load Example Values
        </button>
        {showExample && example && (
          <div className="example-content">
            <h3>Example Values:</h3>
            <ul>
              <li>p = {example.p}</li>
              <li>q = {example.q}</li>
              <li>n = {example.n}</li>
              <li>λ(n) = {example.lambda}</li>
              <li>e = {example.e}</li>
              <li>d = {example.d}</li>
            </ul>
            <p>This matches the example where:</p>
            <ul>
              <li>Public key: (3233, 17)</li>
              <li>Private key: (3233, 413)</li>
            </ul>
          </div>
        )}
      </div>

      {error && <div className="error">{error}</div>}
    </div>
  );
}

export default App;
