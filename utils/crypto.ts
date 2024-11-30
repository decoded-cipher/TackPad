// Convert string to ArrayBuffer
const str2ab = (str: string) => new TextEncoder().encode(str);

// Convert ArrayBuffer to string
const ab2str = (buf: ArrayBuffer) => new TextDecoder().decode(buf);

// Convert ArrayBuffer to base64 string
const ab2base64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf)));

// Convert base64 string to ArrayBuffer
const base642ab = (base64: string) => {
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes.buffer;
};

export type EncryptedData = {
    salt: string;
    iv: string;
    encrypted: string;
}

export async function encrypt(data: object, password: string): Promise<EncryptedData> {
  try {
    // Convert object to string
    const jsonString = JSON.stringify(data);
    
    // Generate a random salt
    const salt = crypto.getRandomValues(new Uint8Array(16));
    
    // Derive key from password using PBKDF2
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      str2ab(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
    
    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the stringified data
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      str2ab(jsonString)
    );
    
    // Combine salt, IV, and encrypted data
    const result = {
      salt: ab2base64(salt),
      iv: ab2base64(iv),
      encrypted: ab2base64(encrypted)
    };
    
    return result;
  } catch (err: any) {
    throw new Error('Encryption failed: ' + err.message);
  }
}

export async function decrypt<T = object>(encryptedData: EncryptedData, password: string): Promise<T> {
  try {
    // Convert base64 strings back to ArrayBuffers
    const salt = base642ab(encryptedData.salt);
    const iv = base642ab(encryptedData.iv);
    const encrypted = base642ab(encryptedData.encrypted);
    
    // Derive the same key from password
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      str2ab(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    
    // Decrypt the data
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      encrypted
    );
    
    // Parse the decrypted string back to an object
    const jsonString = ab2str(decrypted);
    return JSON.parse(jsonString) as T;
  } catch (err: any) {
    throw new Error('Decryption failed: ' + err.message);
  }
}