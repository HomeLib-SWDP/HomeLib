
const fetchInfo = "/display_profile";

const fetchLoan = "/loan_get";

const fetchStats = "/api/books/get_stats";

async function displayProfileInfo() {
    try{
        //getting user details from flask
        const response = await fetch(fetchInfo);
        if (!response.ok) throw new Error("Network Error");
        const data = await response.json();

    

        console.log("data", data)
    
    
        // displaying info
        document.querySelector(".profile-name").textContent = data[0].userName;
        document.querySelector(".profile-username").textContent= data[0].emailValue;
        document.querySelector(".profile-date-joined").textContent=data[0].accountDate; 
        document.querySelector(".profile-desc").textContent=(data[0].userDescription || "profile description here"); 

        const loanresponse = await fetch(fetchLoan);
        if (!response.ok) throw new Error("Network Error");
        const loandata = await loanresponse.json();

        const statResponse = await fetch(fetchStats);
        if(!statResponse.ok) throw new Error("stat network error");
        const statData = await statResponse.json()


        document.querySelector(".profile-loan").textContent=(loandata.loanNum || 0) + " loans"; 
        document.querySelector(".profile-book-count").textContent= (statData.num_books_lib || 0) + " books";
        document.querySelector(".profile-shelves-count").textContent = (statData.shelf_count || 0) + " shelves";

        console.log("state data" ,statData)

    } 
    catch (error) {
        const errorMes = error.message;
        console.log(errorMes);
    }
}

displayProfileInfo();

  const profileImg = document.getElementById('profileImg');
  const uploadImg = document.getElementById('uploadImg');

  if (uploadImg) {
    uploadImg.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if(file) {
            profileImg.src = URL.createObjectURL(file);
        }
    });
  }


  