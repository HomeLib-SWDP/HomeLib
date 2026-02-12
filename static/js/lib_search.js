
const API_BASE_URL = "http://127.0.0.1:5000";

var currentLibrary = [];
var filteredLibrary = [];

async function getLibrary()
{   
    try
    {
        const response = await fetch(`${API_BASE_URL}/api/books/get_library`);

        if(!response.ok)
            throw new Error(`Error! ${response.status}`)

        const data = await response.json()

        for(const book of data)
        {
            currentLibrary.push(book)
        }

        filteredLibrary = currentLibrary;

        console.log(currentLibrary)
    }
    catch(err)
    {
        console.error("Error fetching library: ", err)
    }
}

document.addEventListener("DOMContentLoaded", () => {
  getLibrary();
});

async function setupAutoComplete(inputId, suggestionsId)
{
    const input = document.getElementById(inputId);
    const suggestionsBox = document.getElementById(suggestionsId);

    input.addEventListener("input", function (){
        const query = this.value.trim().toLowerCase();

        suggestionsBox.innerHTML = "";

        if(query.length === 0)
        {
            suggestionsBox.style.display = "none";
            return;
        }

        const matches = currentLibrary.filter(item => {
            const value = typeof item === "object" ? item.booktitle : item;
            const author = typeof item === "object" ? item.author : item;
            return value.toLowerCase().includes(query) || author.toLowerCase().includes(query);
        })

        if(matches.length === 0)
        {
            suggestionsBox.style.display = "none";
            return;
        }

        filteredLibrary = matches;
        
        matches.forEach(item =>
        {
            const value = typeof item === "object" ? item.booktitle : item;
            const author = typeof item === "object" ? item.author : item;

            const div = document.createElement("div")
            div.textContent = value + " by: " + author;

            div.addEventListener("click", function () {
                input.value = value;
                suggestionsBox.style.display = "none";
                displayChosenBook(value);
            });

            suggestionsBox.appendChild(div)
        }
        );
        suggestionsBox.style.display = "block";
    });

    document.addEventListener("click", function (e) {
        if (!e.target.closest(".autocomplete-wrapper")) {
            suggestionsBox.style.display = "none";
        }
    });

    console.log("Auto Complete setup!")
}

document.addEventListener("DOMContentLoaded", function () {
    setupAutoComplete("search", "suggestions");
});

async function displayChosenBook(bookName)
{
    console.log("Display")
    console.log(bookName)
    console.log(currentLibrary);
    for(book of currentLibrary)
    {
        if(book.booktitle === bookName)
        {
            const div = document.getElementById("displayLib");
            const title = document.createElement("h4");
            title.textContent = book.booktitle;
            const author = document.createElement("h6");
            author.textContent = book.author

            div.appendChild(title);
            div.appendChild(author);
        }
    }
}