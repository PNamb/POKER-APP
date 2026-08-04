import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAJntc8P1cRaBZeUMiztDCpgUyrk2tPZKM",
  authDomain: "poker-app-c8301.firebaseapp.com",
  projectId: "poker-app-c8301",
  storageBucket: "poker-app-c8301.firebasestorage.app",
  messagingSenderId: "976632891258",
  appId: "1:976632891258:web:1a0f68b51720c748bc78c3",
  measurementId: "G-EJ8H3NYPVH",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  useFetchStreams: false,
});
