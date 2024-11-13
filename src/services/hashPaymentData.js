import crypto from "crypto";

const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY; // Use a secure 32-byte key
const IV = process.env.NEXT_PUBLIC_IV; // Use a secure 16-byte initialization vector (IV)

// Function to encrypt or decrypt an object based on the given method
const hashPaymentData = (data, method) => {
  // enc - encription
  // dec - decription
  if (method !== "enc" && method !== "dec") {
    return { message: "Invalid method specified!" };
  }

  // Helper function to encrypt a single field
  const encryptField = (text) => {
    const cipher = crypto.createCipheriv("aes-256-cbc", SECRET_KEY, IV);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  };

  // Helper function to decrypt a single field
  const decryptField = (encryptedText) => {
    const decipher = crypto.createDecipheriv("aes-256-cbc", SECRET_KEY, IV);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  };

  // Encrypt or decrypt each field in the data object
  const transformedData = {};
  for (const [key, value] of Object.entries(data)) {
    if (method === "enc") {
      transformedData[key] = encryptField(value.toString());
    } else if (method === "dec") {
      transformedData[key] = decryptField(value.toString());
    }
  }

  return transformedData;
};

export default hashPaymentData;
