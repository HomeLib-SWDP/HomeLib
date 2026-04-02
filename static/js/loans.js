const fetchInfo = "/displayLoan";

async function displayLoanInfo() {
    try{
        //getting user details from flask
        const response = await fetch(fetchInfo);
        if (!response.ok) throw new Error("Network Error");
        const details = await response.json();
        //console.log(data)

        let table = ''

        details.forEach(detail => {
            table +=`<tr>
            <td>${detail[0]}</td>
            <td>${detail[5]}</td>
            <td>${new Date(detail[2]).toLocaleDateString()}</td>
            <td>${new Date (detail[3]).toLocaleDateString()}</td>
            <td>${detail[4]}</td>
            <td>${detail[6]}</td>
            </tr>
            `
        });

        document.getElementById('tablebody').innerHTML = table

    } 
    catch (error) {
        const errorMes = error.message;
        console.log(errorMes);
    }
}

displayLoanInfo();
