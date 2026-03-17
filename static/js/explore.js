let currentOffset = 0;
let currentQuery = '';
let currentLang = '';
let currentSubject = '';
let currentYearMin = '';
let currentYearMax = '';
const card = document.getElementById("details");

function renderBooks(booksArray, container) {
    booksArray.forEach(book => {
        const div = document.createElement('div');
        div.className = 'book-card'; 
        
        div.innerHTML = `
            <img src="https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg" alt="cover" class="book-cover">
            <div class="book-info" style="font-size: 0.9rem; padding-top: 5px;">
                <strong style="display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${book.title}">${book.title || 'No title'}</strong>
                <span style="color: #555;">${book.author_name ? book.author_name[0] : 'Unknown'}</span>
                <button type="button" class ="add-btn" style="margin-top: 8px; width: fit-content;">
                    Add to library
                </button>
            </div>
        `;

        const coverImg = div.querySelector( '.book-cover');

        // Displays an overlay card when clicking the book cover
        coverImg.addEventListener('click', (e) => {
            e.stopPropagation();
            DisplayBookInfo(book);
        })
        
        const btn = div.querySelector( '.add-btn');
        
        btn.addEventListener('click', ( )=> {
            handleSaveBook(book);
        })
        
        //console.table(book);

        container.appendChild(div);
    });
}


async function loadSection(apiUrl, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return; 

    
    container.className = 'scroll-row';
    container.innerHTML = '<p>Loading books...</p>'; 

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Network Error");
        
        const data = await response.json();
        container.innerHTML = ''; 
        
        if (data.docs && data.docs.length > 0) {
            
            //dont use books with no coverid
            const booksWithCovers = data.docs.filter(book => book.cover_i !== undefined);
            
            //grab 10 books from the list that filtered out ones missing covers
            const finalTenBooks = booksWithCovers.slice(0, 10);
            
            if(finalTenBooks.length > 0) {
                renderBooks(finalTenBooks, container); 
            } else {
                container.innerHTML = '<p>No books with covers found for this section.</p>';
            }

        } else {
            container.innerHTML = '<p>No books found for this section.</p>';
        }

    } catch (err) {
        container.innerHTML = `<p style="color:red">Error loading section.</p>`;
    }
}


window.addEventListener('DOMContentLoaded', () => {

    const popularUrl = `https://openlibrary.org/search.json?q=first_publish_year:2020+subject:ny_times_bestseller&sort=editions&limit=25&fields=title,author_name,cover_i,key,isbn,first_publish_year`;
    loadSection(popularUrl, 'popular-books');


    const newReleasesUrl = `https://openlibrary.org/search.json?q=first_publish_year:[2025 TO 2026]+subject:fiction&sort=editions&limit=25&fields=title,author_name,cover_i,key,isbn,first_publish_year`;
    loadSection(newReleasesUrl, 'new-books');

    const fantasyUrl = `https://openlibrary.org/search.json?q=subject:fantasy+subject:ny_times_bestseller&sort=editions&limit=25&fields=title,author_name,cover_i,key,isbn,first_publish_year`;
    loadSection(fantasyUrl, 'fantasy-books');

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
            console.log(books);
            console.log(document.getElementById("search-sect"));
            const searchSection = document.getElementById("search-sect");
            searchSection.className = 'scroll-row';

            renderBooks(books, searchSection);
        }

        console.log(books)
        
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
        publish_date: book.first_publish_year || 'Unknown'
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
    const url = `https://openlibrary.org${book.key}.json`

    const response = await fetch(url);
    if (!response.ok) throw new Error("Network error: " + response.status);

    const data = await response.json();

    console.log(data);

    const description = data.description;
    var summary = "";

    if(description) // First check if there is a description
    {
        summary = typeof description == 'object' ? description.value : description;
    }
    else
    {
        summary = "No summary";
    }
    var subjects = data.subjects;
    const overlay = document.getElementById("details");
    overlay.innerHTML = `
    <div style="display: flex">
        <h2 style="padding-top: 1em">${book.title}</h2>
        <button id=closeBtn class="close-btn">&times;</button>
    </div>
    <p>${summary}</p>
    <div id="subjects"></div>`;
    overlay.classList.toggle("hidden");
    const subjectDiv = document.getElementById("subjects");
    subjectDiv.textContent = "";

    subjects.forEach(subj =>{
        subjectDiv.textContent += subj + "\n";
    })

    const closeBtn = document.getElementById("closeBtn");
    closeBtn.addEventListener("click", (e) =>{
        e.stopPropagation();
        card.classList.toggle("hidden");
    })
}

card.addEventListener("click", (e) => {
    e.stopPropagation();
})

document.addEventListener("click", () =>
{
    card.classList.add("hidden");
})
