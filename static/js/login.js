import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";


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

// getting required elements
const emailId = document.getElementById('email');
const password = document.getElementById('password');
const loginForm = document.getElementById('loginForm');

const sendIdtoFlask = (userId) => {
  fetch('/user_id_post', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ user_id: userId }) //converting to json format
  })

};


const storeUserInfo = (userName, email, password, accountCreationDate) => {
   fetch('/user_info_post', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userName, email, password, accountCreationDate }) 
  })
}

loginForm.addEventListener('submit', async (loginEvent) => {
  loginEvent.preventDefault();

  //getting value and authentication
  const emailValue = emailId.value;
  const passwordValue = password.value;

try {
  const userCredential = await signInWithEmailAndPassword(auth, emailValue, passwordValue);
  const user = userCredential.user; //get user info 

  const userId = user.uid; // gett user id from firebase

  sendIdtoFlask(userId); //function to send to flask middleware

  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    const userName = data.userName;
    const email = data.email;
    const password = data.password;
    const creationDate = data.creationDate;

    /*console.log("Username", userName);
    console.log("email", email);
    console.log("password", password);
    console.log("Account Creation Date", creationDate);*/

  storeUserInfo(userName, email, password,  creationDate); //sending user profile info to flask sessions

  }
  else {
    console.log("data not present")
  }
  
  //console.log('User id:', userId); 
  alert('Welcome!' + ' ' + emailValue);
  window.location.href = 'explore'; //redirect to explore page
  }
  catch(error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert ('Error logging in: ' + errorMessage);
  }
});


