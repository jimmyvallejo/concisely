
interface EncryptionResult {
    encryptedData: number[];
    key: number[];
  }
  

  type ApiProvider = 'openai' | 'anthropic';
  
  export class SecureKeyStorage {

    static async encryptKey(apiKey: string): Promise<EncryptionResult> {
      const encoder = new TextEncoder();
      const data = encoder.encode(apiKey);
      
      const encryptionKey = await crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256
        },
        true,
        ['encrypt', 'decrypt']
      );
      
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        encryptionKey,
        data
      );
      
      const exportedKey = await crypto.subtle.exportKey('raw', encryptionKey);
      

      const combinedData = new Uint8Array(iv.length + encryptedData.byteLength);
      combinedData.set(iv);
      combinedData.set(new Uint8Array(encryptedData), iv.length);
      
      return {
        encryptedData: Array.from(combinedData),
        key: Array.from(new Uint8Array(exportedKey))
      };
    }
    
    static async decryptKey(encryptedData: number[], keyData: number[]): Promise<string> {
      const encryptedArray = new Uint8Array(encryptedData);
      const keyArray = new Uint8Array(keyData);
      
      const iv = encryptedArray.slice(0, 12);
      const encryptedContent = encryptedArray.slice(12);
      
      const encryptionKey = await crypto.subtle.importKey(
        'raw',
        keyArray,
        {
          name: 'AES-GCM',
          length: 256
        },
        true,
        ['decrypt']
      );
      
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        encryptionKey,
        encryptedContent
      );
      
      const decoder = new TextDecoder();
      return decoder.decode(decryptedData);
    }
    
    static async saveApiKey(provider: ApiProvider, apiKey: string): Promise<boolean> {
      try {
        const encrypted = await this.encryptKey(apiKey);
        await chrome.storage.local.set({
          [`${provider}_key`]: encrypted.encryptedData,
          [`${provider}_encryption_key`]: encrypted.key
        });
        return true;
      } catch (error) {
        console.error('Error saving API key:', error);
        return false;
      }
    }
    
    static async getApiKey(provider: ApiProvider): Promise<string | null> {
      try {
        const result = await chrome.storage.local.get([
          `${provider}_key`,
          `${provider}_encryption_key`
        ]);
        
        if (!result[`${provider}_key`] || !result[`${provider}_encryption_key`]) {
          return null;
        }
        
        return await this.decryptKey(
          result[`${provider}_key`],
          result[`${provider}_encryption_key`]
        );
      } catch (error) {
        console.error('Error retrieving API key:', error);
        return null;
      }
    }
    
    static async removeApiKey(provider: ApiProvider): Promise<boolean> {
      try {
        await chrome.storage.local.remove([
          `${provider}_key`,
          `${provider}_encryption_key`
        ]);
        return true;
      } catch (error) {
        console.error('Error removing API key:', error);
        return false;
      }
    }
  }
  

  // Example usage:
  /*
  // Save an API key
  await SecureKeyStorage.saveApiKey('openai', 'sk-123456789');
  await SecureKeyStorage.saveApiKey('anthropic', 'sk-ant-123456789');
  
  // Retrieve an API key
  const openAiKey = await SecureKeyStorage.getApiKey('openai');
  const anthropicKey = await SecureKeyStorage.getApiKey('anthropic');
  
  // Remove an API key
  await SecureKeyStorage.removeApiKey('openai');
  */