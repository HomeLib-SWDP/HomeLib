const fetchInfo = "/displayLoan";

async function displayLoanInfo() {
    try{
        //getting user details from flask
        const response = await fetch(fetchInfo);
        if (!response.ok) throw new Error("Network Error");
        const details = await response.json();
        console.log(details)

        const items =  details.length 

        //console.log(items)

        fetch('/loan_number', {
            method: 'POST' ,
            headers: {'content-type' : 'application/json'
            },
            body: JSON.stringify({"loans": items})
        })
         
        let table = document.getElementById('tablebody');

        for(i = 0; i< items; i++){

           let tablerow = table.insertRow(-1)

           cell1 = tablerow.insertCell(0)
           cell1.innerHTML = details[i][0]
           cell2 = tablerow.insertCell(1)
           cell2.innerHTML = details[i][5]
           cell3 = tablerow.insertCell(2)
           cell3.innerHTML = details[i][2]
           cell4 = tablerow.insertCell(3)
           cell4.innerHTML = details[i][3]
           cell5 = tablerow.insertCell(4)
           cell5.innerHTML = details[i][4]
           cell6 = tablerow.insertCell(5)
           cell6.innerHTML = details[i][6]

        }


    } 
    catch (error) {
        const errorMes = error.message;
        console.log(errorMes);
    }
}

displayLoanInfo();
