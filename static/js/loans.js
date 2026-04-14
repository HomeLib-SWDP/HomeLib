const fetchInfo = "/display_Loan";

async function displayLoanInfo() {
    try{
        //getting user details from flask
        const response = await fetch(fetchInfo);
        if (!response.ok) throw new Error("Network Error");
        const details = await response.json();
        //console.log(details)
        
        const items =  details.length 

        //console.log(items)

        fetch('/loan_number', {
            method: 'POST' ,
            headers: {'content-type' : 'application/json'
            },
            body: JSON.stringify({"loans": items})
        })
         

        let table = document.getElementById('tablebody');

        for (i=0; i<items; i++){
            
            let tablerow =  table.insertRow(-1)

            cell1 = tablerow.insertCell(0)
            cell1.innerHTML = details[i].loanId
            cell2 = tablerow.insertCell(1)
            cell2.innerHTML = details[i].bookName
            cell3 = tablerow.insertCell(2)
            cell3.innerHTML = details[i].borrowedDate
            cell4 = tablerow.insertCell(3)
            cell4.innerHTML = details[i].returningDate
            cell5 = tablerow.insertCell(4)
            cell5.innerHTML = details[i].borrowerName
            cell6 = tablerow.insertCell(5)
            if(details[i].expired == 0){ // toggling active/expired status
                cell6.innerHTML = "Active"
            }
            else {
                cell6.innerHTML = "Expired"
            }
            
        }
    } 
    catch (error) {
        const errorMes = error.message;
        console.log("Error : ", errorMes);
    }
}

displayLoanInfo();


const modal = document.getElementById("loanModal");
const addBtn = document.getElementById("addLoanBtn");
const closeBtn = document.querySelector(".close");

addBtn.onclick = () => {
  modal.style.display = "flex";
};

closeBtn.onclick = () => {
  modal.style.display = "none";
};

window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
};