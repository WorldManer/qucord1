import CryptoJS from 'crypto-js';

export class EncryptionUtils {
  static encryptionKey = "your-secure-encryption-key"; // В продакшене используйте env переменную

  // Шифрование сообщения
  static encryptMessage(message) {
    try {
      return CryptoJS.AES.encrypt(message, this.encryptionKey).toString();
    } catch (error) {
      console.error("Encryption error:", error);
      return message; // Возвращаем оригинал в случае ошибки
    }
  }

  // Дешифровка сообщения
  static decryptMessage(encryptedMessage) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedMessage, this.encryptionKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error("Decryption error:", error);
      return encryptedMessage; // Возвращаем зашифрованный текст в случае ошибки
    }
  }

  // Генерация ключа для сессии
  static generateSessionKey() {
    return CryptoJS.lib.WordArray.random(32).toString();
  }

  // Хеширование пароля (для хранения на клиенте)
  static hashPassword(password) {
    return CryptoJS.SHA256(password).toString();
  }
}
