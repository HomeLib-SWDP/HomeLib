import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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
const db = getFirestore(app);

const emailId = document.getElementById('email');
const username = document.getElementById('username');
const password = document.getElementById('password');
const registerForm = document.getElementById('registerForm');
const confirmPassword = document.getElementById('confirmPassword');


registerForm.addEventListener('submit', async (registerEvent) => {
  registerEvent.preventDefault();

  //getting valuu
  const emailValue = emailId.value;
  const passwordValue = password.value;
  const confirmPasswordValue = confirmPassword.value;
  const usernameValue = username.value;

  if (confirmPasswordValue != passwordValue) {
    alert("Passwords do not match");
    return;
  }
  const userCredential = await createUserWithEmailAndPassword(auth, emailValue, passwordValue);
  const user = userCredential.user; //get user info

  try {
    await setDoc(doc(db,"users", user.uid), {
      userName: usernameValue,
      email: emailValue,
      creationDate: new Date().toLocaleDateString()
    });
  
  alert('Redirecting to login page');
  window.location.href = '/'; //redirect to login page
  }
  catch (error){
    const errorMessage = error.message;
    alert(errorMessage);
  }
});