import { useState } from 'react';
import {
  rsaEncrypt, rsaDecrypt, generateRSAKeyPair,
  caesarEncrypt, caesarDecrypt,
  base64Encode, base64Decode,
  simpleHash,
  aesEncrypt, aesDecrypt
} from './dictionary';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('rsa');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // RSA specific states
  const [primeP, setPrimeP] = useState('');
  const [primeQ, setPrimeQ] = useState('');
  const [keyPair, setKeyPair] = useState(null);
  
  // Caesar cipher specific state
  const [shift, setShift] = useState(3);
  
  // AES specific state
  const [aesKey, setAesKey] = useState('');

  const clearOutput = () => {
    setOutput('');
    setError('');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    clearOutput();
  };

  const handleGenerateRSAKeys = async () => {
    setLoading(true);
    setError('');
    try {
      const p = parseInt(primeP);
      const q = parseInt(primeQ);
      const keys = generateRSAKeyPair(p, q);
      setKeyPair(keys);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEncrypt = async () => {
    if (!input.trim()) {
      setError('Please enter text to process');
      return;
    }

    setLoading(true);
    setError('');
    try {
      let result;
      switch (activeTab) {
        case 'rsa':
          if (!keyPair) {
            throw new Error('Please generate RSA keys first');
          }
          result = rsaEncrypt(input, keyPair.publicKey);
          setOutput(JSON.stringify(result));
          break;
        case 'caesar':
          result = caesarEncrypt(input, parseInt(shift));
          setOutput(result);
          break;
        case 'base64':
          result = base64Encode(input);
          setOutput(result);
          break;
        case 'hash':
          result = simpleHash(input);
          setOutput(result);
          break;
        case 'aes':
          if (!aesKey) {
            throw new Error('Please enter an AES key');
          }
          result = aesEncrypt(input, aesKey);
          setOutput(JSON.stringify(result));
          break;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!input.trim()) {
      setError('Please enter text to process');
      return;
    }

    setLoading(true);
    setError('');
    try {
      let result;
      switch (activeTab) {
        case 'rsa':
          if (!keyPair) {
            throw new Error('Please generate RSA keys first');
          }
          result = rsaDecrypt(JSON.parse(input), keyPair.privateKey);
          setOutput(result);
          break;
        case 'caesar':
          result = caesarDecrypt(input, parseInt(shift));
          setOutput(result);
          break;
        case 'base64':
          result = base64Decode(input);
          setOutput(result);
          break;
        case 'aes':
          if (!aesKey) {
            throw new Error('Please enter an AES key');
          }
          result = aesDecrypt(JSON.parse(input), aesKey);
          setOutput(result);
          break;
        case 'hash':
          throw new Error('Hash function cannot be decrypted');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderMethodSettings = () => {
    switch (activeTab) {
      case 'rsa':
        return (
          <div className="key-generation">
            <h3>RSA Key Generation</h3>
            <div className="input-group">
              <input
                type="number"
                placeholder="Prime number p"
                value={primeP}
                onChange={(e) => setPrimeP(e.target.value)}
              />
              <input
                type="number"
                placeholder="Prime number q"
                value={primeQ}
                onChange={(e) => setPrimeQ(e.target.value)}
              />
              <button 
                onClick={handleGenerateRSAKeys}
                disabled={loading}
                className={loading ? 'loading' : ''}
              >
                Generate Keys
              </button>
            </div>
            {keyPair && (
              <div className="keys">
                <div>
                  <h4>Public Key</h4>
                  <p>e: {keyPair.publicKey.e}</p>
                  <p>n: {keyPair.publicKey.n}</p>
                </div>
                <div>
                  <h4>Private Key</h4>
                  <p>d: {keyPair.privateKey.d}</p>
                  <p>n: {keyPair.privateKey.n}</p>
                </div>
              </div>
            )}
          </div>
        );
      case 'caesar':
        return (
          <div className="shift-setting">
            <h3>Shift Value</h3>
            <input
              type="number"
              min="1"
              max="25"
              value={shift}
              onChange={(e) => setShift(e.target.value)}
            />
          </div>
        );
      case 'aes':
        return (
          <div className="aes-key">
            <h3>AES Key</h3>
            <input
              type="text"
              placeholder="Enter AES key"
              value={aesKey}
              onChange={(e) => setAesKey(e.target.value)}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container">
      <h1>Cryptography Tools</h1>
      
      <div className="tabs">
        {['rsa', 'caesar', 'base64', 'hash', 'aes'].map((tab) => (
          <button 
            key={tab}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => handleTabChange(tab)}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="content-area">
        {renderMethodSettings()}

        <div className="encryption-area">
          <div className="input-area">
            <h3>Input</h3>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Enter text to ${activeTab === 'hash' ? 'hash' : 'process'}...`}
            />
          </div>

          <div className="buttons">
            <button 
              onClick={handleEncrypt}
              disabled={loading}
              className={loading ? 'loading' : ''}
            >
              {activeTab === 'hash' ? 'Hash' : 'Encrypt'}
            </button>
            {activeTab !== 'hash' && (
              <button 
                onClick={handleDecrypt}
                disabled={loading}
                className={loading ? 'loading' : ''}
              >
                Decrypt
              </button>
            )}
          </div>

          <div className="output-area">
            <h3>Output</h3>
            <textarea value={output} readOnly />
          </div>
        </div>

        {error && (
          <div className="error">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
