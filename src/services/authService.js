import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  sendEmailVerification
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase-config";

export class AuthService {
  // Регистрация
  static async register(email, password, username) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Обновление профиля
      await updateProfile(user, { displayName: username });
      
      // Создание профиля в Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        username: username,
        createdAt: new Date().toISOString(),
        online: true,
        lastSeen: new Date().toISOString(),
        avatarUrl: null
      });
      
      // Отправка подтверждения email
      await sendEmailVerification(user);
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Вход
  static async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Обновление статуса онлайн
      await setDoc(doc(db, "users", user.uid), {
        online: true,
        lastSeen: new Date().toISOString()
      }, { merge: true });
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Выход
  static async logout() {
    try {
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, "users", user.uid), {
          online: false,
          lastSeen: new Date().toISOString()
        }, { merge: true });
      }
      
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Восстановление пароля
  static async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Получение данных пользователя
  static async getUserData(uid) {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  }

  // Слушатель состояния аутентификации
  static onAuthChange(callback) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = await this.getUserData(user.uid);
        callback({ ...user, ...userData });
      } else {
        callback(null);
      }
    });
  }
}
