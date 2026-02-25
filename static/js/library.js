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
        
        const coverUrl = book.cover_i 
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` 
            : 'https://placehold.co/150x200?text=No+Cover';

        //should follow what i did in explore, kept the star rating and the tag
        div.innerHTML = `
            <img src="${coverUrl}" alt="cover" class="book-cover" loading="lazy">
            <div class="book-info" style="font-size: 0.9rem; padding-top: 5px;">
                <strong class="book-title" style="display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${book.title}">
                    ${book.title || 'No title'}
                </strong>
                <span class="book-author" style="color: #6b7280;">${book.author ||'Unknown'}</span>
                <div class="rating" style="color: #fbbf24; margin-top: 4px;">
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star-half-stroke"></i>
                </div>
                <div class="shelf-tag">My Library</div>
            </div>
        `;
        container.appendChild(div);
    });
}

async function loadSection(apiUrl, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Network Error");
        
        const data = await response.json();
        
        //make sure theres acutally an array of boojs being returned and if not state that lib empty
        if (Array.isArray(data) && data.length > 0) {
            renderBooks(data, container); 
        } else {
            container.innerHTML = '<p style="padding: 2em;">Your library is empty.</p>';
        }
    } catch (err) {
        console.error(err);
        container.innerHTML = `<p style="color:red; padding: 2em;">Error loading books.</p>`;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadSection('/api/books/get_library', 'displayLib');
});