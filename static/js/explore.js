let currentOffset = 0;
let currentQuery = '';
let currentLang = '';
let currentSubject = '';
let currentYearMin = '';
let currentYearMax = '';
 /*
document.getElementById('subjectFilter').addEventListener('change', (e) => { 
  currentSubject = e.target.value; 
});

document.getElementById('yearMin').addEventListener('input', (e) => { 
    currentYearMin = e.target.value; 
});

document.getElementById('yearMax').addEventListener('input', (e) => { 
    currentYearMax = e.target.value; 
});

async function search(offset = 0) {
    const titleQ = document.getElementById('titleQuery').value.trim();
    const authorQ = document.getElementById('authorQuery').value.trim();
    const isbnQ = document.getElementById('isbnQuery').value.trim();
    const publisherQ = document.getElementById('publisherQuery').value.trim();
    const subjectQ = document.getElementById('subjectQuery').value.trim();
    const yearQ = document.getElementById('yearQuery').value.trim();
    const lang = document.getElementById('language').value;
    const yearMin = document.getElementById('yearMin').value;
    const yearMax = document.getElementById('yearMax').value;
   
    const queries = [];
    if (titleQ) queries.push(`title:"${titleQ}"`);
    if (authorQ) queries.push(`author:"${authorQ}"`);
    if (isbnQ) queries.push(`isbn:${isbnQ}`);
    if (publisherQ) queries.push(`publisher:"${publisherQ}"`);
    if (subjectQ) queries.push(`subject:"${subjectQ}"`);
    if (yearQ) queries.push(`first_publish_year:${yearQ}`);

    if (queries.length === 0 && offset === 0) {
        return alert("Enter at least one search term");
    }

    let searchQuery = queries.join(' AND ');

    if (lang) {
        searchQuery += ` AND language:${lang}`;
    }
    if (currentSubject) {
        searchQuery += ` AND subject:"${currentSubject}"`;
    }
    let yearRange = '';
    if (yearMin && yearMax) {
        yearRange = ` first_publish_year:[${yearMin} TO ${yearMax}]`;
    } else if (yearMin) {
        yearRange = ` first_publish_year:[${yearMin} TO *]`;
    } else if (yearMax) {
        yearRange = ` first_publish_year:[* TO ${yearMax}]`;
    }
    if (yearRange) {
        searchQuery += ` AND ${yearRange}`;
    }

    currentQuery = searchQuery;
    currentLang = lang;
    currentOffset = offset;

    const params = new URLSearchParams({
        q: searchQuery,
        limit: 6,
        offset: offset.toString(),
        fields: 'title,author_name,first_publish_year,language,subject,edition_count,cover_i'
    });
    const url = `https://openlibrary.org/search.json?${params}`;
    const container = document.getElementById('results');

    if (offset === 0) {
        container.innerHTML = '';
        document.getElementById('loadMore').style.display = 'none';
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network error: " + response.status);
       
        const data = await response.json();

        if (offset === 0) {
            container.innerHTML = `<p>Found ${data.num_found} results.</p>`;
        }

        data.docs.forEach(book => {
            const div = document.createElement('div');
            div.className = 'book';
            const langs = book.language && Array.isArray(book.language) && book.language.length > 0 
                ? book.language.slice(0, 10).join(', ') 
                : 'Unknown';
            let subs = 'No subjects';
            if (book.subject && Array.isArray(book.subject) && book.subject.length > 0) {
                subs = book.subject.slice(0, 5).join(', ');
            }
            const editions = book.edition_count ? `${book.edition_count} editions` : '1 edition';
            div.innerHTML = `
                <strong>${book.title || 'No title'}</strong><br>
                ${book.author_name ? 'By ' + book.author_name.join(', ') : 'Unknown author'}<br>
                ${book.first_publish_year ? 'First published: ' + book.first_publish_year : ''}<br>
                <span class="languages">Languages: ${langs}</span><br>
                <span class="subjects">Subjects: ${subs}</span><br>
                <span class="editions">${editions}</span><br>
                ${book.cover_i ? `<br><img src="https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg" alt="cover" style="max-width:120px; margin-top:0.5rem;">` : ''}
            `;
            container.appendChild(div);
        });

        if (data.docs.length === 0) {
            if (offset === 0) {
                container.innerHTML = '<p>No books found for this query.</p>';
            }
            return;
        }

        if (data.docs.length < 6) {
            container.innerHTML += '<p>No more results.</p>';
        } else {
            document.getElementById('loadMore').style.display = 'inline-block';
        }
    } catch (err) {
        if (offset === 0) {
            container.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
        } else {
            container.innerHTML += `<p style="color:red">Error loading more: ${err.message}</p>`;
        }
    }
}

function loadMore() {
    search(currentOffset + 6);
}

*/

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

        bookSuggestions = data.docs;
        let books = [];

        if(bookSuggestions.length > 0)
        {
            regExplore.style.display = "none";
            if(bookSuggestions.length > 30)
            {
                books = bookSuggestions.slice(0, 30);
            }
            console.log(books);
            console.log(document.getElementById("search-sect"));
            const searchSection = document.getElementById("search-sect");
            searchSection.className = 'scroll-row';
            renderBooks(books, searchSection);
        }
        
        // books.forEach(book =>{
            
        //     const title = book.title;
        //     const author = book.author_name;
        //     const div = document.createElement("div")
        //     div.textContent = title + " by: " + author;

        //     suggestionsBox.appendChild(div)
        // }) 
        
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
async function handleSaveBook(book){
    const savedBook = {
        title: book.title,
        author: (book.author_name && book.author_name.length > 0) ? book.author_name[0] : 'Unknown',
        isbn: book.isbn ? book.isbn[0] : Unknown, 
        cover_id: book.cover_i,
        publish_date: book.first_publish_year || 'Unknown'
    };

    //console.table(savedBook);
    console.log("saving book: ", savedBook);

    try{
        const response = await fetch('/api/books/add_manual_book', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(savedBook)
        })
         if(response.ok){
            alert(`Book Saved: "${book.title}"`)
        } else{
            alert(`book not saved`)
        }
    } catch(err){
        alert('save failed.')
    }

};
