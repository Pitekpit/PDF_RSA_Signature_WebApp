import { useState } from 'react';
import './PDFSigner.css';


// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey#pkcs_8_import
function str2ab(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function importPrivateKey(pem) {
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = pem.substring(
    pemHeader.length,
    pem.length - pemFooter.length - 1,
  );
  const binaryDerString = window.atob(pemContents);
  const binaryDer = str2ab(binaryDerString);

  return window.crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    {
      name: "RSA-PSS",
      hash: "SHA-256",
    },
    true,
    ["sign"],
  );
}



export const PDFSigner = () => {
  const [file, setFile] = useState(null);
  const [privateKeyPem, setPrivateKeyPem] = useState('');
  const [signatureHex, setSignatureHex] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSignFile = async () => {
    if (!file || !privateKeyPem) {
      alert("Please select a PDF file and private key.");
      return;
    }

    setLoading(true);
    //https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/sign#rsa-pss_2
    try {
      const fileBuffer = await file.arrayBuffer();

      const privateKey = await importPrivateKey(privateKeyPem);


      const signatureBuffer = await window.crypto.subtle.sign(
        {
          name: "RSA-PSS",
          saltLength: 32,  //RSA-PSS needs salt, ("RSASSA-PKCS1-v1_5" doesn't)
        },
        privateKey,
        fileBuffer
      );

      const signatureArray = new Uint8Array(signatureBuffer);
      const hexSignature = signatureArray.toHex(); // To Hex sting for download later

      setSignatureHex(hexSignature);
    } catch (error) {
      console.error("Signing failed:", error);
      alert("Signing failed. Make sure the private key format is correct.");
    } finally {
      setLoading(false);
    }
  };

  const downloadSignature = () => {
    const blob = new Blob([signatureHex], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name}.sig`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="pdfSigner">
      <h2>PDF File Digital Signer</h2>

      <div id="fileInputDiv">
        <label>Select PDF File: </label>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
      </div>

      <br />

      <div>
        <label>Paste Private Key (PEM format):</label>
        <br />
        <textarea
          rows={6}
          cols={60}
          value={privateKeyPem}
          onChange={(e) => setPrivateKeyPem(e.target.value)}
          placeholder="-----BEGIN PRIVATE KEY-----..."
        />
      </div>

      <button onClick={handleSignFile} disabled={loading}>
        {loading ? 'Signing File...' : 'Sign PDF'}
      </button>

      {signatureHex && (
        <div>
          <br />
          <button onClick={downloadSignature}>Download Signed PDF (.sig)</button>
        </div>
      )}
    </div>
  );
};