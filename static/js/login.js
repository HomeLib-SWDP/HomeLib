import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";


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

// getting required elements
const emailId = document.getElementById('email');
const password = document.getElementById('password');
const loginForm = document.getElementById('loginForm');


loginForm.addEventListener('submit', (loginEvent) => {
  loginEvent.preventDefault();

  //getting value and authentication
  const emailValue = emailId.value;
  const passwordValue = password.value;

  signInWithEmailAndPassword(auth, emailValue, passwordValue)
  .then((userCredential) => {
  const user = userCredential.user; //get user info 
  localStorage.setItem('userid', user.uid);
  const userid = localStorage.getItem('userid'); // to use when we want to create user sessions
  //console.log('User id:', userid);  test for checking user id 
  alert('Welcome!' + ' ' + emailValue);
  window.location.href = 'explore'; //redirect to home page
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert ('Error logging in: ' + errorMessage);
  });
 
});

