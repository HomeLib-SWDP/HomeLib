const profileform = document.querySelector('.profile-form');
profileform.addEventListener('submit', async (profile) =>{
    profile.preventDefault();

    const email = document.getElementById('email').value;
    const description = document.getElementById('description').value;
    const username = document.getElementById('username').value;

    //console.log(email, description, username)

    try{
    const response = await fetch ('/profile_change', { //sending info to backend to store in sql
    method: 'POST' , 
    headers: {'Content-Type' : 'application/json'
    },
    body:JSON.stringify({email, description, username})
  })
      alert("Changes submitted!");
}
catch (error){
    errormes = error.message;
    alert(errormes)
}

});