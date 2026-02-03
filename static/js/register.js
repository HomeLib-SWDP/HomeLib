import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";


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
const needAccount = document.getElementById('needAccount');


//getting value and authentication
const emailValue = emailId.value;
const passwordValue = password.value;


function registerUser(emailValue, passwordValue) {
    createUserWithEmailAndPassword(auth, emailValue, passwordValue)
    if (userCredential) { //if login is successful
    const user = userCredential.user; //get user info
    alert('Registering...please login');
    window.location.href = 'login.html'; //redirect to home page
  }
    else {  
    alert('Incorrect credentials. Please try again.'); 
  } 
}

needAccount.addEventListener('click', (registerEvent) => {
    registerEvent.preventDefault();
    registerUser(emailValue, passwordValue);
}
);

/*async function sendLoginRequest(emailValue, passwordValue) {
  const response = await fetch('/login', {
    method: 'POST',
    headers: { 'content-type': ''}

*/