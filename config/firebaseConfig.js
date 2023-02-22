// const express = require("express");
const fire = require("firebase/app");

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDPTVz1zqPBclZeHUrmBFKGYaRFLda6jyk",
  authDomain: "voicecallingproject.firebaseapp.com",
  projectId: "voicecallingproject",
  storageBucket: "voicecallingproject.appspot.com",
  messagingSenderId: "1050188688822",
  appId: "1:1050188688822:web:b3094a56ed47bee2b46517",
  measurementId: "G-HKKE62TWD0",
};

// Initialize Firebase
const firebase = fire.initializeApp(firebaseConfig);

module.exports = firebase;
