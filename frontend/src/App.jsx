import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [algorithm, setAlgorithm] = useState("AES");
  const [text, setText] = useState("");
  const [key, setKey] = useState("");
  const [encryptedText, setEncryptedText] = useState("");
  const [decryptedText, setDecryptedText] = useState("");

  const handleEncrypt = async () => {
    try {
      const response = await axios.post("http://localhost:5000/encrypt", {
        algorithm,
        text,
        key: algorithm === "RSA" ? undefined : key,
      });
      setEncryptedText(response.data.encryptedText);
    } catch (error) {
      alert("Error: " + error.response?.data?.error || "Encryption failed");
    }
  };

  const handleDecrypt = async () => {
    try {
      const response = await axios.post("http://localhost:5000/decrypt", {
        algorithm,
        encryptedText,
        key: algorithm === "RSA" ? undefined : key,
      });
      setDecryptedText(response.data.decryptedText);
    } catch (error) {
      alert("Error: " + error.response?.data?.error || "Decryption failed");
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light">
      <h1 className="text-center mb-4">Encryption & Decryption</h1>

      <div className="w-100 max-w-md bg-white p-4 rounded shadow">
        <label className="form-label fw-bold">Choose Algorithm:</label>
        <select
          className="form-select mb-3"
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
        >
          <option value="AES">AES</option>
          <option value="3DES">3DES</option>
          <option value="OTP">OTP</option>
          <option value="RSA">RSA</option>
        </select>

        <label className="form-label fw-bold">Message:</label>
        <textarea
          className="form-control mb-3"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {algorithm !== "RSA" && (
          <>
            <label className="form-label fw-bold">Key:</label>
            <input
              className="form-control mb-3"
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </>
        )}

        <button className="btn btn-primary w-100 mb-3" onClick={handleEncrypt}>
          Encrypt
        </button>
        <textarea
          className="form-control mb-3"
          value={encryptedText}
          readOnly
        />

        <button className="btn btn-success w-100 mb-3" onClick={handleDecrypt}>
          Decrypt
        </button>
        <textarea
          className="form-control mb-3"
          value={decryptedText}
          readOnly
        />
      </div>
    </div>
  );
}

export default App;