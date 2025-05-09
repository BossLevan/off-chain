// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAzQrWgF-kb0f4g_Qe5LwYvBWfyUTk55ww",
  authDomain: "off-chain-c1547.firebaseapp.com",
  projectId: "off-chain-c1547",
  storageBucket: "off-chain-c1547.firebasestorage.app",
  messagingSenderId: "196458158522",
  appId: "1:196458158522:web:441dffba41992c675ee583",
  measurementId: "G-DSGVXQ47TD",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// export const analytics = getAnalytics(app);
export const storage = getStorage(app);

//gs://off-chain-c1547.firebasestorage.app
