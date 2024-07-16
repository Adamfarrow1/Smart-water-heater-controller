import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
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


const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { auth, createUserWithEmailAndPassword , signInWithEmailAndPassword};