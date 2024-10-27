// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA1y2oZxPa9VLO12lXWAs_BstTqxDPSEMw",
  authDomain: "data-dashboard-cbb9c.firebaseapp.com",
  projectId: "data-dashboard-cbb9c",
  storageBucket: "data-dashboard-cbb9c.appspot.com",
  messagingSenderId: "492666025899",
  appId: "1:492666025899:web:c1b01799de2b47e29c04ee",
  measurementId: "G-GX1S7K1KBL"
};

// Initialize Firebase
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

const analytics = getAnalytics(app);
// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };