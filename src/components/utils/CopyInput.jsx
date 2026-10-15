import { useState } from 'react';

export const CopyInput = ({ value = 'Text to copy' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={value}
        readOnly
      />
      <br/>
      <button 
        onClick={handleCopy}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}