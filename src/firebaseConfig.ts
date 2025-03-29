import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDawW1IE5_tYUds2F4Jsc-GCpd79PSV6bg",
    authDomain: "fiba-913c3.firebaseapp.com",
    projectId: "fiba-913c3",
    storageBucket: "fiba-913c3.firebasestorage.app",
    messagingSenderId: "390507844541",
    appId: "1:390507844541:web:7f23b0187577e3e2e1f8d4",
    measurementId: "G-91PTNYZQPR"
  };

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db };