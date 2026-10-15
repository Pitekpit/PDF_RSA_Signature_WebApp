import { CopyInput } from '../utils/CopyInput';
import { useState } from 'react';
import './KeyGen.css';


//https://mojoauth.com/security-guides/generate-keypair-using-rsa-with-react#how-do-i-export-the-keys
function toPem(buffer, label) {
  const b64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  const lines = b64.match(/.{1,64}/g).join('\n');
  return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
}


export const KeyGen = () => {
  const [privateKey, setPrivateKey] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [loading, setLoading] = useState(false);

  //https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/generateKey
  async function generateKeys() {
    setLoading(true);
    try {
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSA-PSS",
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true, // exportable
        ["sign", "verify"]
      );

      const pubPem = toPem(await window.crypto.subtle.exportKey("spki", keyPair.publicKey), "PUBLIC KEY");
      const privPem = toPem(await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey), "PRIVATE KEY");

      setPublicKey(pubPem);
      setPrivateKey(privPem);
    } catch (error) {
      console.error("Failed to generate RSA keys:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="keygen">
      <h1>Key Generator</h1>

      <button onClick={generateKeys} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Keys'}
      </button>

      <h3>Private Key:</h3>
      <CopyInput value={privateKey} />

      <h3>Public Key:</h3>
      <CopyInput value={publicKey} />
    </div>
  );

};