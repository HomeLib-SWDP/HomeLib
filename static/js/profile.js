
const fetchInfo = "/user_info_get";

async function displayProfileInfo() {
    try{
        //getting user details from flask
        const response = await fetch(fetchInfo);
        if (!response.ok) throw new Error("Network Error");
        const data = await response.json();
    
        // displaying info
        document.querySelector(".profile-name").textContent = data.userName;
        document.querySelector(".profile-username").textContent= data.userName;
        document.querySelector(".profile-date-joined").textContent=data.accountCreationDate;
    } 
    catch (error) {
        const errorMes = error.message;
        console.log(errorMes);
    }
}

displayProfileInfo();


const profileImg = document.getElementById('profileImg');
  const uploadImg = document.getElementById('uploadImg');

  uploadImg.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if(file) {
      profileImg.src = URL.createObjectURL(file);
    }
  });


  