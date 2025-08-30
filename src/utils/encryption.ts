import CryptoJS from 'crypto-js';

// Simple shared key per group for demonstration
// In production, this would be more sophisticated
const getGroupKey = (groupID: string): string => {
  // Generate a deterministic key based on groupID
  // This is simplified - in production, use proper key exchange
  return CryptoJS.SHA256(`chat-group-${groupID}-secret-key`).toString();
};

export const encryptMessage = (text: string, groupID: string): string => {
  try {
    const key = getGroupKey(groupID);
    const encrypted = CryptoJS.AES.encrypt(text, key).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt message');
  }
};

export const decryptMessage = (encryptedContent: string, groupID: string): string => {
  try {
    const key = getGroupKey(groupID);
    const decrypted = CryptoJS.AES.decrypt(encryptedContent, key);
    const text = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!text) {
      throw new Error('Decryption resulted in empty string');
    }
    
    return text;
  } catch (error) {
    console.error('Decryption failed:', error);
    return '[Message could not be decrypted]';
  }
};