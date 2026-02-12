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
const password = document.getElementById('password');

const needAccount = document.getElementById('needAccount');


needAccount.addEventListener('submit', (regsterEvent) => {
  regsterEvent.preventDefault();

  //getting value and authentication
  const emailValue = emailId.value;
  const passwordValue = password.value;

  createUserWithEmailAndPassword(auth, emailValue, passwordValue)
  .then((userCredential) => {
  const user = userCredential.user; //get user info
  alert('Registering...please login');
  window.location.href = 'login.html'; //redirect to home page
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert ('Error loggin in: ' + errorMessage);
  });
 
});

