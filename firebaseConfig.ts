
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Thông tin cấu hình từ dự án Firebase 'tinhocdongdu-db'
const firebaseConfig = {
  apiKey: "AIzaSyA-st3hODp1zIRtEecxgXVoukl7gLH44BQ",
  authDomain: "tinhocdongdu-db.firebaseapp.com",
  projectId: "tinhocdongdu-db",
  storageBucket: "tinhocdongdu-db.firebasestorage.app",
  messagingSenderId: "328157233082",
  appId: "1:328157233082:web:ef2dea0699af78a693a783",
  measurementId: "G-KM2VRWNTRL"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Xuất biến db (Database) để dùng trong App.tsx
export const db = getDatabase(app);
