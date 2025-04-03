const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const CryptoJS = require("crypto-js");
const forge = require("node-forge");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Load RSA keys from files
const privateKeyPath = path.join(__dirname, "keys", "private_key.pem");
const publicKeyPath = path.join(__dirname, "keys", "public_key.pem");

const privateKey = fs.readFileSync(privateKeyPath, "utf8");
const publicKey = fs.readFileSync(publicKeyPath, "utf8");
// 🔹 One-Time Pad (OTP) Encryption
function otpEncrypt(text, key) {
  if (text.length !== key.length)
    throw new Error("Key must be the same length as text.");
  return Array.from(text)
    .map((char, i) =>
      String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i))
    )
    .join("");
}


function otpDecrypt(cipher, key) {
  return otpEncrypt(cipher, key); 
}


function aesEncrypt(text, key) {
  return CryptoJS.AES.encrypt(text, key).toString();
}


function aesDecrypt(cipherText, key) {
  const bytes = CryptoJS.AES.decrypt(cipherText, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}


function desEncrypt(text, key) {
  return CryptoJS.TripleDES.encrypt(text, key).toString();
}


function desDecrypt(cipherText, key) {
  const bytes = CryptoJS.TripleDES.decrypt(cipherText, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// RSA Encryption
function rsaEncrypt(text) {
  const publicKeyObj = forge.pki.publicKeyFromPem(publicKey);
  const encrypted = publicKeyObj.encrypt(text, "RSA-OAEP");
  return forge.util.encode64(encrypted);
}

// RSA Decryption
function rsaDecrypt(cipherText) {
  const privateKeyObj = forge.pki.privateKeyFromPem(privateKey);
  const decrypted = privateKeyObj.decrypt(forge.util.decode64(cipherText), "RSA-OAEP");
  return decrypted;
}

// 📌 RSA Encryption API
app.post("/encrypt", (req, res) => {
  const { algorithm, text, key } = req.body;
  let encryptedText;
  try {
    switch (algorithm) {
      case "RSA":
        encryptedText = rsaEncrypt(text);
        break;
      case "OTP":
        encryptedText = otpEncrypt(text, key);
        break;
      case "AES":
        encryptedText = aesEncrypt(text, key);
        break;
      case "3DES":
        encryptedText = desEncrypt(text, key);
        break;
      default:
        return res.status(400).json({ error: "Invalid algorithm" });
    }
    res.json({ encryptedText });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 📌 RSA Decryption API
app.post("/decrypt", (req, res) => {
  const { algorithm, encryptedText, key } = req.body;
  let decryptedText;
  try {
    switch (algorithm) {
      case "RSA":
        decryptedText = rsaDecrypt(encryptedText);
        break;
      case "OTP":
        decryptedText = otpDecrypt(encryptedText, key);
        break;
      case "AES":
        decryptedText = aesDecrypt(encryptedText, key);
        break;
      case "3DES":
        decryptedText = desDecrypt(encryptedText, key);
        break;
      default:
        return res.status(400).json({ error: "Invalid algorithm" });
    }
    res.json({ decryptedText });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});