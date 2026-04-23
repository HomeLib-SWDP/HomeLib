const fetchInfo = "/display_Loan";

async function displayLoanInfo() {
    try {
        const response = await fetch(fetchInfo);
        if (!response.ok) throw new Error("Network Error");

        const details = await response.json();
        const items = details.length;

        fetch('/loan_number', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ loans: items })
        });

        let table = document.getElementById('tablebody');
        table.innerHTML = "";

        for (let i = 0; i < items; i++) {

            let tablerow = table.insertRow(-1);

            tablerow.insertCell(0).innerHTML = details[i].loanId;
            tablerow.insertCell(1).innerHTML = details[i].bookName;
            tablerow.insertCell(2).innerHTML = details[i].borrowedDate;

            
            let cell4 = tablerow.insertCell(3);

            cell4.innerHTML = `
                <span>${details[i].returningDate}</span>
                <i class="fa fa-calendar" style="cursor:pointer; margin-left:8px;"></i>
            `;

            let icon = cell4.querySelector("i");
            let index = i;

            icon.addEventListener("click", function () {

                let input = document.createElement("input");
                input.type = "date";
                input.value = details[index].returningDate;

                cell4.innerHTML = "";
                cell4.appendChild(input);

                input.focus();

                input.addEventListener("change", function () {

                    details[index].returningDate = this.value;

                    cell4.innerHTML = `
                        <span>${this.value}</span>
                        <i class="fa fa-calendar" style="cursor:pointer; margin-left:8px;"></i>
                    `;

                    
                    let newIcon = cell4.querySelector("i");
                    newIcon.addEventListener("click", iconClick);
                });

                function iconClick() {
                    input.showPicker?.();
                }
            });

            tablerow.insertCell(4).innerHTML = details[i].borrowerName;

            let cell6 = tablerow.insertCell(5);
            cell6.innerHTML = details[i].expired == 0 ? "Active" : "Expired";
        }

    } catch (error) {
        console.log("Error:", error.message);
    }
}

displayLoanInfo();

const emailId = document.getElementById('email');
const username = document.getElementById('username');
const description = document.getElementById('description');
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