// firebase.js
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';

const firebaseConfig = {
    apiKey: "AIzaSyCFztalPLRdaE1lTwA_z6IzQytNO8KycAI",
    authDomain: "authlogin-b4b14.firebaseapp.com",
    projectId: "authlogin-b4b14",
    storageBucket: "authlogin-b4b14.appspot.com",
    messagingSenderId: "222341986034",
    appId: "1:222341986034:web:16e57a6f0a20baee4ec26b",
    databaseURL: "https://authlogin-b4b14-default-rtdb.asia-southeast1.firebasedatabase.app/"

  };


  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.database();
  
  export { auth, db };
