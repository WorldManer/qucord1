import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { db } from "./firebase-config";
import { EncryptionUtils } from "../utils/encryption";

export class ChatService {
  // Создание чата
  static async createChat(creatorId, participants, chatName = null, isGroup = false) {
    try {
      const chatData = {
        participants: Array.from(new Set([creatorId, ...participants])),
        createdAt: serverTimestamp(),
        isGroup,
        chatName: isGroup ? chatName : null,
        lastMessage: null,
        lastMessageTime: null,
        adminId: isGroup ? creatorId : null
      };

      const chatRef = await addDoc(collection(db, "chats"), chatData);
      
      // Создание подколлекции для сообщений
      await addDoc(collection(chatRef, "messages"), {
        type: "system",
        content: isGroup ? "Групповой чат создан" : "Чат создан",
        senderId: "system",
        timestamp: serverTimestamp()
      });

      return { success: true, chatId: chatRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Отправка сообщения
  static async sendMessage(chatId, senderId, content, messageType = "text", attachments = []) {
    try {
      // Шифрование сообщения (реализация в encryption.js)
      const encryptedContent = EncryptionUtils.encryptMessage(content);
      
      const messageData = {
        content: encryptedContent,
        originalContent: content, // Только для отладки, в продакшене удалить
        senderId,
        timestamp: serverTimestamp(),
        type: messageType,
        attachments,
        readBy: [senderId],
        isEdited: false
      };

      const messageRef = await addDoc(
        collection(doc(db, "chats", chatId), "messages"),
        messageData
      );

      // Обновление последнего сообщения в чате
      await updateDoc(doc(db, "chats", chatId), {
        lastMessage: content.substring(0, 100),
        lastMessageTime: serverTimestamp(),
        lastMessageType: messageType
      });

      return { success: true, messageId: messageRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Получение сообщений чата в реальном времени
  static subscribeToChatMessages(chatId, callback) {
    const messagesRef = collection(doc(db, "chats", chatId), "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => {
        const data = doc.data();
        // Дешифровка сообщения
        const decryptedContent = EncryptionUtils.decryptMessage(data.content);
        return {
          id: doc.id,
          ...data,
          content: decryptedContent,
          timestamp: data.timestamp?.toDate() || new Date()
        };
      });
      callback(messages);
    });
  }

  // Получение списка чатов пользователя
  static async getUserChats(userId, callback) {
    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("participants", "array-contains", userId)
    );

    return onSnapshot(q, async (snapshot) => {
      const chats = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const chatData = docSnapshot.data();
          // Получение информации об участниках
          const participantsInfo = await Promise.all(
            chatData.participants
              .filter(id => id !== userId)
              .map(async (participantId) => {
                const userDoc = await getDocs(
                  query(collection(db, "users"), where("uid", "==", participantId))
                );
                return userDoc.docs[0]?.data() || null;
              })
          );
          
          return {
            id: docSnapshot.id,
            ...chatData,
            participantsInfo: participantsInfo.filter(p => p !== null),
            lastMessageTime: chatData.lastMessageTime?.toDate() || null
          };
        })
      );
      
      // Сортировка по времени последнего сообщения
      chats.sort((a, b) => 
        (b.lastMessageTime || b.createdAt?.toDate() || 0) - 
        (a.lastMessageTime || a.createdAt?.toDate() || 0)
      );
      
      callback(chats);
    });
  }

  // Обновление статуса прочтения
  static async markAsRead(chatId, messageId, userId) {
    try {
      const messageRef = doc(db, "chats", chatId, "messages", messageId);
      await updateDoc(messageRef, {
        readBy: arrayUnion(userId)
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Удаление сообщения
  static async deleteMessage(chatId, messageId) {
    try {
      await deleteDoc(doc(db, "chats", chatId, "messages", messageId));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
