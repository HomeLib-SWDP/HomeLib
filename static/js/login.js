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

loginForm.addEventListener('submit', async (loginEvent) => {
  loginEvent.preventDefault();

  //getting value 
  const emailValue = emailId.value;
  const passwordValue = password.value;
  var userCredential
  try
  {
    userCredential = await signInWithEmailAndPassword(auth, emailValue, passwordValue);
    incorrect.textContent = "";
  }
  catch(err)
  {
    const incorrect = document.getElementById("incorrect");
    incorrect.textContent = "Incorrect username or password, please try again.";
  }
  
  const user = userCredential.user; //get user info 

  const userId = user.uid; // get user id from firebase

  // sending id to flask sessions
    await fetch('/user_id_post', {
      method: 'POST' ,
      headers: {'content-type' : 'application/json'
      },
      body: JSON.stringify({userId})
    })

  window.location.href = 'explore'; //redirect to explore page
  }
);