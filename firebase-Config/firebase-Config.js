// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCw_bUWIBcoZ42BKCAScJOfO2q2KyThJ9U",
  authDomain: "git-wh.firebaseapp.com",
  databaseURL: "https://git-wh-default-rtdb.firebaseio.com",
  projectId: "git-wh",
  storageBucket: "git-wh.appspot.com",
  messagingSenderId: "200839480102",
  appId: "1:200839480102:web:0caa9e93cf67f1e5ad37e7",
  measurementId: "G-8VD9FRSSSL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);