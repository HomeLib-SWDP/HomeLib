
const fetchInfo = "/display_profile";

async function displayProfileInfo() {
    try{
        //getting user details from flask
        const response = await fetch(fetchInfo);
        if (!response.ok) throw new Error("Network Error");
        const data = await response.json();

        //console.log(data)
    
        // displaying info
        document.querySelector(".profile-name").textContent = data[0].userName;
        document.querySelector(".profile-username").textContent= data[0].userName;
        document.querySelector(".profile-date-joined").textContent=data[0].accountDate; 

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
  