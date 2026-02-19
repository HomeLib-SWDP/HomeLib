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
        displayBooks();
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
            filteredLibrary = currentLibrary;
            displayBooks();
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
        displayBooks();
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
    console.log(bookName)
    for(book of filteredLibrary)
    {
        if(book.booktitle === bookName)
        {
            filteredLibrary = [];
            filteredLibrary.push(book);
            displayBooks();
            return;
        }
    }
}

async function displayBooks()
{
    const libraryDiv = document.getElementById("displayLib")
    libraryDiv.innerHTML = "";
    for(const book of filteredLibrary)
    {
        const card = document.createElement("div");
        card.classList.add("book-card");

        const imgDiv = document.createElement("div");
        imgDiv.classList.add("book-img");
        const img = document.createElement("img")
        img.src = "https://covers.openlibrary.org/b/id/" + book.cover_id + "-M.jpg"
        imgDiv.appendChild(img);
        card.appendChild(imgDiv);

        const detailsDiv = document.createElement("div");
        detailsDiv.classList.add("book-details");
        const title = document.createElement("div")
        title.classList.add("book-title");
        title.textContent = book.booktitle;
        const author = document.createElement("div");
        author.classList.add("book-author");
        author.textContent = book.author;
        const rating = document.createElement("div");
        rating.classList.add("rating");
        rating.ariaLabel = "Rating: 5 stars"
        rating.textContent = "⭐⭐⭐⭐⭐"

        const finish = document.createElement("span");
        finish.classList.add("shelf-tag");
        finish.textContent = "finish";

        detailsDiv.appendChild(title);
        detailsDiv.appendChild(author);
        detailsDiv.appendChild(rating);
        detailsDiv.appendChild(finish);

        card.appendChild(detailsDiv);
        libraryDiv.appendChild(card);
    }
}