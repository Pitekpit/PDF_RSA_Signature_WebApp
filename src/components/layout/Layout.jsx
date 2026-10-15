import { Outlet, Link } from "react-router-dom";
import './Layout.css';
export const Layout = () => {
  return (
    <>
      <nav>
        <div>
            <Link to="/keygen">Key Generator</Link>
        </div>
        <div>
            <Link to="/pdfsigner">PDF Signer</Link>
        </div>
        <div>
            <Link to="/pdfverifier">PDF Verifier</Link>
        </div>
        <div>
            <Link to="/howto">How To</Link>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
      <footer>
        Contact: pitek.pit@int.pl
      </footer>
    </>
  )
}