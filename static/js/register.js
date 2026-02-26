import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

const firebaseConfig = {

  apiKey: "AIzaSyAvMDcDz-yh4BpTpkb5_-M41EbMLw6xmh0",

  authDomain: "homelib-caef7.firebaseapp.com",

  projectId: "homelib-caef7",

  storageBucket: "homelib-caef7.firebasestorage.app",

  messagingSenderId: "935710501303",

  appId: "1:935710501303:web:3b400acaaaee116fcd2032",

  measurementId: "G-RPQN19H629"

};

// intiialzing firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const emailId = document.getElementById('email');
const username = document.getElementById('username');
const password = document.getElementById('password');
const registerForm = document.getElementById('registerForm');
const confirmPassword = document.getElementById('confirmPassword');


registerForm.addEventListener('submit', (regsterEvent) => {
  regsterEvent.preventDefault();

  //getting value and authentication
  const emailValue = emailId.value;
  const passwordValue = password.value;
  const confirmPasswordValue = confirmPassword.value;
  const usernameValue = username.value;

  if (confirmPasswordValue != passwordValue) {
    alert("Passwords do not match");
    return;
  }
  
  createUserWithEmailAndPassword(auth, emailValue, passwordValue, usernameValue)
  .then((userCredential) => {
  const user = userCredential.user; //get user info
  alert('Registering...please login');
  window.location.href = '/'; //redirect to login page
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert ('Error registering: ' + errorMessage);
  });
 
});