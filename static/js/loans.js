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