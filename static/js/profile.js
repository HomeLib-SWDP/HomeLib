import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";

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
const db = getFirestore(app);

const fetchInfo = "/user_info_get";

async function displayProfileInfo() {

//getting user details from flask
const response = await fetch(fetchInfo);
if (!response.ok) throw new Error("Network Error");
const data = await response.json();
const userId =  data.userId

console.log( userId)

try{
const docRef = doc(db, "users" , userId)
const docSnap = await getDoc(docRef);

if (docSnap.exists()) {
  const data = docSnap.data();
  const userName = data.userName;
  const creationDate = data.creationDate;

// displaying info
document.querySelector(".profile-name").textContent = userName
document.querySelector(".profile-username").textContent= userName
document.querySelector(".profile-date-joined").textContent= creationDate

}
}
catch(error){
  const errormes = error.message;
  console.log(errormes)

}
}

displayProfileInfo()

const profileImg = document.getElementById('profileImg');
  const uploadImg = document.getElementById('uploadImg');

  uploadImg.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if(file) {
      profileImg.src = URL.createObjectURL(file);
    }
  });
