import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { initIPFS, uploadFile, downloadFile } from './ipfs';
import abi from '../../../artifacts/contracts/CertStorage.sol/CertStorage.json'; // from artifacts

const CONTRACT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'; // replace this

function App() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [cids, setCids] = useState([]);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    initIPFS().then(() => {
      console.log("✅ Helia initialized");
    });
    connectWallet();
  }, []);

  async function connectWallet() {
    try {
      if (!window.ethereum) return alert("Please install MetaMask");
      const provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      console.log("✅ Connected:", addr);
      setAccount(addr);

      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, signer);
      setContract(contract);
      console.log("✅ Contract connected:", await contract.getAddress());
    } catch (e) {
      console.error("❌ Wallet connection failed:", e);
    }
  }

  function handleFileChange(e) {
    setFile(e.target.files[0]);
  }

  async function handleUpload() {
    if (!file) return alert("❌ No file selected");
    if (!contract) return alert("❌ Contract not ready");
    try {
      console.log("📤 Uploading to IPFS...");
      const cid = await uploadFile(file);
      console.log("✅ IPFS CID:", cid);
      const tx = await contract.uploadCert(cid);
      await tx.wait();
      console.log("✅ Stored on blockchain");
      setMessage("Uploaded successfully!");
    } catch (err) {
      console.error("❌ Upload failed:", err);
      setMessage("Upload failed!");
    }
  }

  async function fetchCerts() {
    if (!contract) return alert("❌ Contract not connected");
    try {
      console.log("📦 Fetching certs...");
      const certs = await contract.getCerts();
      console.log("✅ Certs:", certs);
      setCids(certs);
      setMessage(`Found ${certs.length} cert(s).`);
    } catch (err) {
      console.error("❌ Failed to fetch certs:", err);
    }
  }

  async function handleDownload(cid) {
    try {
      console.log("📥 Downloading:", cid);
      const blob = await downloadFile(cid);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // a.download = `cert-${cid}.bin`;
      a.download = `${cid}-${file.name}`;
      a.click();
    } catch (err) {
      console.error("❌ Download failed:", err);
    }
  }


  return (
    <div style={{ padding: '2rem' }}>
      <h2>Academic Certificate Uploader</h2>
      <p>Connected wallet: {account}</p>

      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload Certificate</button>

      <hr />

      <button onClick={fetchCerts}>My Certificates</button>
      <ul>
        {cids.map(cid => (
          <li key={cid}>
            {cid}
            <button onClick={() => handleDownload(cid)}>Download</button>
          </li>
        ))}
      </ul>

      <p>{message}</p>
    </div>
  );
}

export default App;
