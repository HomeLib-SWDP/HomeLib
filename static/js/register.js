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


registerForm.addEventListener('submit', async (registerEvent) => {
  registerEvent.preventDefault();

  //getting value
  const emailValue = emailId.value;
  const passwordValue = password.value;
  const confirmPasswordValue = confirmPassword.value;
  const usernameValue = username.value;

  if (confirmPasswordValue != passwordValue) {
    showPopupError("Passwords do not match");
    return;
  }
  const userCredential = await createUserWithEmailAndPassword(auth, emailValue, passwordValue);
  const user = userCredential.user; //get user info
  const userId = user.uid //get user id

  const accountDate = new Date()
  //alert(usernameValue)
  
  await fetch ('/store_profile', { //sending info to backend to store in sql
    method: 'POST' , 
    headers: {'Content-Type' : 'application/json'
    },
    body:JSON.stringify({accountDate, emailValue, usernameValue, userId})
  })

  //alert(userId)

  showPopup('Redirecting to login page');
  window.location.href = '/'; //redirect to login page

  }
);


function showPopup(message, type = "success") {
  const popup = document.getElementById("popup");

  popup.textContent = message;
  popup.className = "popup show " + type;

  setTimeout(() => {
    popup.className = "popup " + type;
  }, 2000);
}



function showPopupError(message, type = "error") {
  const popup = document.getElementById("popup");

  popup.textContent = message;
  popup.className = "popup show " + type;

  setTimeout(() => {
    popup.className = "popup " + type;
  }, 2000);
}
