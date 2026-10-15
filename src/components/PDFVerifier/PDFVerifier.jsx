import { useState } from 'react';
import './PDFVerifier.css';


function str2ab(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function importPublicKey(pem) {
  const pemHeader = "-----BEGIN PUBLIC KEY-----";
  const pemFooter = "-----END PUBLIC KEY-----";
  const pemContents = pem.substring(
    pemHeader.length,
    pem.length - pemFooter.length - 1,
  );
  const binaryDerString = window.atob(pemContents);
  const binaryDer = str2ab(binaryDerString);

  return window.crypto.subtle.importKey(
    "spki",
    binaryDer,
    {
      name: "RSA-PSS",
      hash: "SHA-256",
    },
    true,
    ["verify"],
  );
}


function hexToBuffer(hexString) {
  const cleanHex = hexString.trim();
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
  }
  return bytes.buffer;
}

export const PDFVerifier = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [sigFile, setSigFile] = useState(null);
  const [publicKeyPem, setPublicKeyPem] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!pdfFile || !sigFile || !publicKeyPem) {
      alert("Please select both the PDF file, the .sig file, and paste the Public Key.");
      return;
    }

    setLoading(true);
    setVerificationResult(null);

    try {
      const pdfBuffer = await pdfFile.arrayBuffer();

      const sigText = await sigFile.text();
      const signatureBuffer = hexToBuffer(sigText);

      const publicKey = await importPublicKey(publicKeyPem);

      const isValid = await window.crypto.subtle.verify(
        {
          name: "RSA-PSS",
          saltLength: 32,
        },
        publicKey,
        signatureBuffer,
        pdfBuffer
      );

      setVerificationResult(isValid);
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationResult(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="pdfVerifier">
      <h2>PDF File Signature Verifier</h2>

      <div class="fileInputDiv">
        <label>Select Original PDF File: </label>
        <input 
          type="file" 
          accept="application/pdf" 
          onChange={(e) => setPdfFile(e.target.files[0] || null)} 
        />
      </div>

      <div class="fileInputDiv">
        <label>Select Signature File (.sig): </label>
        <input 
          type="file" 
          accept=".sig,text/plain" 
          onChange={(e) => setSigFile(e.target.files[0] || null)} 
        />
      </div>

      <div>
        <label>Paste Public Key (PEM format):</label>
        <br />
        <textarea
          rows={6}
          cols={60}
          value={publicKeyPem}
          onChange={(e) => setPublicKeyPem(e.target.value)}
          placeholder="-----BEGIN PUBLIC KEY-----..."
        />
      </div>

      <button onClick={handleVerify} disabled={loading}>
        {loading ? 'Verifying...' : 'Verify Signature'}
      </button>

      {verificationResult !== null && (
        <div>
          {verificationResult ? (
            <p>
              Signature is VALID! The PDF file is authentic and has not been modified.
            </p>
          ) : (
            <p>
              Signature is INVALID! Either the file was altered or the public key does not match.
            </p>
          )}
        </div>
      )}
    </div>
  );
};