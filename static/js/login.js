import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// config
const firebaseConfig = {
  apiKey: "",
  authDomain: "",           
  projectId:"",
  storage: "",
  Bucket: "",
};

// intiialzing firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// getting required elements
const emailId = document.getElementById('email');
const password = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');


//getting value and authentication
const emailValue = emailId.value;
const passwordValue = password.value;


function checkLogin(emailValue, passwordValue) {
    signInWithEmailAndPassword(auth, emailValue, passwordValue)
    if (userCredential) { //if login is successful
    const user = userCredential.user; //get user info
    alert('Logging you in...');
    window.location.href = 'home.html'; //redirect to home page
  }
    else {  
    alert('Incorrect email or password. Please try again.'); 
  } 
}

loginBtn.addEventListener('click', (loginEvent) => {
  loginEvent.preventDefault();
  
    checkLogin(emailValue, passwordValue);
}
);

/*async function sendLoginRequest(emailValue, passwordValue) {
  const response = await fetch('/login', {
    method: 'POST',
    headers: { 'content-type': ''}

*/