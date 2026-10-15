import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from './components/layout/Layout';
import { KeyGen} from './components/keygen/KeyGen';
import { PDFSigner } from './components/PDFSigner/PDFSigner';
import { PDFVerifier } from './components/PDFVerifier/PDFVerifier';
import { HowTo } from './components/howTo/HowTo';
export default function App() {
  return (
    // basename is set to /PDF_RSA_Signature_WebApp because the app is hosted on github pages and the repo name is PDF_RSA_Signature_WebApp
    <BrowserRouter basename="/PDF_RSA_Signature_WebApp"> 
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="keygen" replace />} />
          <Route path="keygen" element={<KeyGen />} />
          <Route path="pdfsigner" element={<PDFSigner />} />
          <Route path="pdfverifier" element={<PDFVerifier />} />
          <Route path="howto" element={<HowTo />} />
          <Route path="*" element={<KeyGen />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}