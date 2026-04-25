/*const fetchInfo = "/loan_get";

constsendInfo = ""

async function displayProfileInfo() {
    try{
        //getting user details from flask
        const response = await fetch(fetchInfo);
        if (!response.ok) throw new Error("Network Error");
        const data = await response.json();
        bookname = data.bookName
        loaneename= data.borrowerName
        borrowDate = data.borrowedDate
        returnDate = data.returningDate
        loan_id = data.loanId

    } 
    catch (error) {
        const errorMes = error.message;
        console.log(errorMes);
    }
}

displayProfileInfo();
*/

const fetchInfo = "/api/books/loan_get";

async function loadLoans() {
    const response = await fetch(fetchInfo);
    const data = await response.json();

    const tableBody = document.getElementById("loan-table-body");
    tableBody.innerHTML = "";

    data.forEach(loan => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${loan.loanId}</td>
            <td>${loan.bookName}</td>
            <td>${loan.borrowedDate}</td>
            <td>${loan.returningDate}</td>
            <td>${loan.borrowerName}</td>
            <td><button>Edit</button></td>
        `;

        tableBody.appendChild(row);
    });
}

loadLoans();