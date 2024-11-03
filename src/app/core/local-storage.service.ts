// src/app/local-storage.service.ts

import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private secretKey: string = 'secret'; // Replace with your actual secret key

  constructor() {}

  // Encrypt and set an item in localStorage
  setItem(key: string, value: any): void {
    const encryptedValue = CryptoJS.AES.encrypt(JSON.stringify(value), this.secretKey).toString();
    localStorage.setItem(key, encryptedValue);
  }

  // Get and decrypt an item from localStorage
  getItem<T>(key: string): T | null {
    const encryptedValue = localStorage.getItem(key);
    if (!encryptedValue) {
      return null;
    }

    try {
      const bytes = CryptoJS.AES.decrypt(encryptedValue, this.secretKey);
      const decryptedValue = bytes.toString(CryptoJS.enc.Utf8);
      return decryptedValue ? (JSON.parse(decryptedValue) as T) : null;
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  // Remove an item from localStorage
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  // Clear all items in localStorage
  clear(): void {
    localStorage.clear();
  }
}
