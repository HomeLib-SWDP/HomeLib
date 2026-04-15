let currentOffset = 0;
let currentQuery = '';
let currentLang = '';
let currentSubject = '';
let currentYearMin = '';
let currentYearMax = '';
const card = document.getElementById("details");

async function renderBooks(booksArray, container) {    
    booksArray.forEach(book =>{

        const div = document.createElement('div');
        div.className = 'book-card';
        
        const percentage = (book.ratings_average / 5) * 100; // start at 0

        // Create each card
        div.innerHTML = `
            <img src="https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg" alt="cover" class="book-cover">
            <div class="book-info" style="font-size: 0.9rem; padding-top: 5px;">
                <strong style="display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${book.title}">
                    ${book.title || 'No title'}
                </strong>
                <span style="color: #555;">
                    ${book.author_name ? book.author_name[0] : 'Unknown'}
                </span>

                <div class="star-rating">
                    <div class="stars-outer">
                        <div class="stars-inner" style="width: ${percentage}%"></div>
                    </div>
                </div>

                <button type="button" class="add-btn" style="margin-top: 8px; width: fit-content;">
                    Add tfo library
                </button>
            </div>
        `;

        // Event listeners
        const coverImg = div.querySelector('.book-cover');
        coverImg.addEventListener('click', (e) => {
            e.stopPropagation();
            DisplayBookInfo(book);
        });

        const btn = div.querySelector('.add-btn');
        btn.addEventListener('click', () => {
            handleSaveBook(book);
        });

        // Append div
        container.appendChild(div);
    });
}


async function loadSection(category, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return; 

    container.className = 'scroll-row';
    container.innerHTML = '<p>Loading books...</p>'; 

    try {
        const response = await fetch(`/api/books/${category}`);

        if(!response.ok) throw new Error("server error");

        const finalFifteenBooks = await response.json();

        container.innerHTML = '';

        console.log(finalFifteenBooks);

        if (finalFifteenBooks.length > 0){
            renderBooks(finalFifteenBooks, container);
        } else {
            container.innerHTML = `<p> No popualr books for category ${category}.</p>`
        }
    } catch (err) {
        console.error(err);
        container.innerHTML = `<p style="color:red">Error loading section.</p>`;
    }
}


window.addEventListener('DOMContentLoaded', () => {


    loadSection('popular', 'popular-books');
    loadSection('new', 'new-books');
    loadSection('fantasy', 'fantasy-books');
    loadSection('mystery', 'mystery-books');
    loadSection('nonfiction', 'nonfic-books');

});
var bookSuggestions = [];

async function searchBooks(searchInput, suggestions)
{
    const input = document.getElementById(searchInput);
    const suggestionsBox = document.getElementById(suggestions);
    const regExplore = document.getElementById("regular-explore");
    const searchSection = document.getElementById("search-sect");

    input.addEventListener("input", debounce (async function (){
        searchSection.innerHTML = "";
        const query = this.value.trim().toLowerCase();
        suggestionsBox.innerHTML = "";
        if(query == "" || query.length < 3)
        {
            regExplore.style.display = "block";
            return;
        }

        if(query.length === 0)
        {
            suggestionsBox.style.display = "none";
            bookSuggestions = [];
            return;
        }

        const url = `https://openlibrary.org/search.json?q=${query}`;
        const container = document.getElementById('results');

        const response = await fetch(url);
        if (!response.ok) throw new Error("Network error: " + response.status);

        const data = await response.json();

        bookSuggestions = data.docs.map(book => ({
            book, score: scoreBook(book, query)
        })).filter((item => item.score > 0))
        .sort((a, b) => b.score - a.score)
        .map(item => item.book);

        bookSuggestions = bookSuggestions.filter(book => book.cover_i != null)

        let books = [];


        if(bookSuggestions.length > 0)
        {
            regExplore.style.display = "none";
            // slices the array if there are more than 30 entries
            if(bookSuggestions.length > 30)
            {
                books = bookSuggestions.slice(0, 30);
            }
            else
            {
                books = bookSuggestions;
            }
            const searchSection = document.getElementById("search-sect");
            searchSection.className = 'scroll-row';

            renderBooks(books, searchSection);
        }
        
        suggestionsBox.style.display = "block";
    }, 400));

    document.addEventListener("click", function (e) {
        if (!e.target.closest(".autocomplete-wrapper")) {
            suggestionsBox.style.display = "none";
        }
    });
}

// This is here purely to reduce lag, so that we aren't getting a million API calls per input
function debounce(func, delay) {
    let timeoutId;

    return function (...args) {
        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

document.addEventListener("DOMContentLoaded", function () {
    searchBooks("searchInput", "suggestions");
});

// Adds a scoring method to further sort by relevance (to the inputted query)
function scoreBook(book, query)
{
    let score = 0;
    const q = query.toLowerCase();

    if (book.title?.toLowerCase().startsWith(q)) score += 5;
    if (book.title?.toLowerCase().includes(q)) score += 3;
    if (book.title?.toLowerCase() === q) score += 9;    // Exact matches should be scored highest
    if (book.author_name?.some(a => a.toLowerCase().includes(q))) score += 8;
    if (book.author_name?.some(a => a.toLowerCase() === q)) score += 10;    // exact authors should take priority

    return score;
}

async function handleSaveBook(book){
    const savedBook = {
        title: book.title,
        author: (book.author_name && book.author_name.length > 0) ? book.author_name[0] : 'Unknown',
        isbn: book.isbn ? book.isbn[0] : 'Unknown', 
        cover_id: book.cover_i,
        publish_date: book.first_publish_year || 'Unknown',
        cleaned_genre: book.cleaned_genre, 
        pages: book.pages
    };

    //console.table(savedBook);
    console.log("saving book: ", savedBook);

    try {
    const response = await fetch('/api/books/add_manual_book', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(savedBook)
    });
        const data = await response.json();
        alert(data.message);
    } catch (err) {
        alert('Save failed.');
    }

};

async function DisplayBookInfo(book)
{
    // API call to get the description and other info
    const url = `https://openlibrary.org${book.key}.json`

    const response = await fetch(url);
    if (!response.ok) throw new Error("Network error: " + response.status);

    const data = await response.json();
    
    const description = data.description;
    var summary = "";

    if(description) // First check if there is a description
    {
        summary = typeof description == 'object' ? description.value : description;
    }
    else
    {
        summary = "No summary found";
    }

    // Now we try to get the other information from the cover_edition_key

    var isbn_10 = 'undefined'
    var isbn_13 = 'undefined';

    if(book.cover_edition_key)
    {
        const url2 = `https://openlibrary.org/books/${book.cover_edition_key}.json`;
        const response2 = await fetch(url2);
        if (!response2.ok) throw new Error("Network error: " + response.status);
        const data2 = await response2.json();

        isbn_10 = data2.isbn_10 ? data2.isbn_10[0] : 'undefined';
        isbn_13 = data2.isbn_13 ? data2.isbn_13[0] : 'undefined';
    }

    var rating = 'No rating found';
    const url3 = `https://openlibrary.org${book.key}/ratings.json`;
    const response3 = await fetch(url3);

    if (!response3.ok) throw new Error("Network error: " + response.status);
    
    const data3 = await response3.json();

    rating = data3.summary.average ? data3.summary.average : 0;

    var percentage = (rating / 5) * 100;

    const overlay = document.getElementById("details");
    overlay.innerHTML = `
    <div style="display: flex">
        <h2 style="padding-top: 1em">${book.title}</h2>
        <button id=closeBtn class="close-btn">&times;</button>
    </div>
    <div style="display: flex">
        <img src="https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg" alt="cover" class="book-cover">
        <div style="padding-left: 1rem">
            <h4>Author: ${book.author_name ? book.author_name[0] : "Unknown Author"}</h4>
            <h4>Published: ${book.first_publish_year}</h4>
            <h4>ISBN_10: ${isbn_10}</h4>
            <h4>ISBN_13: ${isbn_13}</h4>
            <div style="display: flex">
                <h4>Rating: </h4>
                <div class="star-rating">
                    <div class="stars-outer">
                        <div class="stars-inner" style="width: ${percentage}%;"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <p style="padding-top: 1rem">${summary}</p>`;
    overlay.classList.toggle("hidden");

    const closeBtn = document.getElementById("closeBtn");
    closeBtn.addEventListener("click", (e) =>{
        e.stopPropagation();
        overlay.classList.add("hidden");
    })
}

card.addEventListener("click", (e) => {
    e.stopPropagation();
})

document.addEventListener("click", () =>
{
    card.classList.add("hidden");
})
