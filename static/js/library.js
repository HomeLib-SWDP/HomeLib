let allBooks = []; 
let currentShelfId = null;
const card = document.getElementById("popup");
let shelfList = [];

async function loadLibrary(shelfId = null) {
    currentShelfId = shelfId;
    const container = document.getElementById('displayLib');
    try {
        let url = '/api/books/get_library';
        if (shelfId && shelfId !== 'all') {
            url += `?shelf_id=${shelfId}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error("Network Error");

        allBooks = await response.json();

        if (allBooks.length > 0) {
            filterAndSortBooks();
        } else {
            container.innerHTML = '<p style="padding: 2em;">No books in this shelf yet.</p>';
        }
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p style="color:red; padding: 2em;">Error loading books.</p>';
    }
}

async function populateShelves() {
    try {
        const response = await fetch('/api/books/shelves/my');
        if (!response.ok) throw new Error('Fetch failed');

        const res = await response.json();

        const shelvesList = res.shelves || res || [];

        shelfList = shelvesList;

        if (Array.isArray(shelvesList)) {
            shelvesList.forEach(shelf => {
                const opt = document.createElement('option');
                opt.value = shelf.id;
                opt.textContent = shelf.name;
            });
        }
    } catch (err) {
        console.error("Could not load shelves:", err);
    }
}

function filterAndSortBooks() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const sortBy = document.querySelector('.sort-by').value;
    const container = document.getElementById('displayLib');

    let filtered = allBooks.filter(book => {
        const title = (book.title || "").toLowerCase();
        const author = (book.author || "").toLowerCase();
        return title.includes(searchTerm) || author.includes(searchTerm);
    });

    function getYear(book) {
        let raw = book.publishdate || 0;
        if (typeof raw === 'string') {
            const match = raw.match(/\d{4}/);
            if (match) raw = match[0];
        }
        return parseInt(raw, 10) || 0;
    }

    filtered.sort((a,b) => {
        switch (sortBy) {
            case 'title_asc':
                return (a.title || '').localeCompare(b.title || '');
            case 'title_dec':
                return (b.title || '').localeCompare(a.title || '');
            case 'author_asc':
                return (a.author || '').localeCompare(b.author || '');
            case 'author_dec':
                return (b.author || '').localeCompare(a.author || '');
            case 'year_asc':
                const yearA_asc = getYear(a);
                const yearB_asc = getYear(b);
                return yearB_asc - yearA_asc;
            case 'year_dec':
                const yearA_dec = getYear(a);
                const yearB_dec = getYear(b);
                return yearA_dec - yearB_dec;
            default:
                return (a.title || '').localeCompare(b.title || '');
        }
    });

    renderBook(filtered, container);
}

function renderBook(booksArray, container) {
    container.innerHTML = '';

    booksArray.forEach(book => {
        const div = document.createElement('div');
        div.className = 'book-card';

        const coverUrl = book.cover_i
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
            : 'https://placehold.co/150x200?text=No+Cover';
        
        div.innerHTML = `
            <img src="${coverUrl}" alt="cover" class="book-cover" loading="lazy">
            <div class="book-info" style="font-size: 0.9rem; padding-top: 5px;">
                <strong class="book-title" style="display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${book.title}">
                    ${book.title || 'No title'}
                </strong>
                <span class="book-author" style="color: #6b7280;">${book.author || 'Unknown'}</span>
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
        div.addEventListener('click', (e) =>{
            e.stopPropagation();
            displayPopUp(book);
        })
        container.appendChild(div);
    });
}

window.addEventListener('DOMContentLoaded', () => {
    loadLibrary();
    populateShelves();

    document.getElementById('search').addEventListener('input', filterAndSortBooks);
    document.querySelector('.sort-by').addEventListener('change', filterAndSortBooks);
});

async function loadSection(apiUrl, containerId) {
    const container = document.getElementById(containerId);
    if(!container) return;

    try {
        const response = await fetch(apiUrl);
        if(!response.ok) throw new Error ("Network Error");

        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
            renderBook(data, container);
        } else {
            container.innerHTML = '<p style="padding: 2em;">Your library is empty.</p>';
        }
    } catch (err) {
        console.error(err);
        container.innerHTML = `<p style="color:red; padding: 2em;">Error loading books.</p>`;
    }
}

async function displayPopUp(book)
{
    console.log(book); 
    const overlay = document.getElementById("popup");

    overlay.innerHTML = `
    <div style="display: flex">
        <h2 style="padding-top: 1em">${book.title}</h2>
        <button id=closeBtn class="close-btn">&times;</button>
    </div>
    <div style="display: flex">
        <img src="https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg" alt="cover" class="popup-cover">
        <div style="padding-left: 1rem; min-width: 20rem">
            <h4>Author: ${book.author ? book.author : "Unknown Author"}</h4>
            <h4>Published: ${book.publishdate}</h4>
            <h4>ISBN: ${book.isbn ? book.isbn : "Unknown ISBN"}</h4>
            <div style="padding-top: 1em; display: flex; flex-direction: column">
                <select id='shelf_list' class='add-to-shelf select-shelf'>
                </select>
                <button id="addToShelf" class="confirm-btn" style="margin-top: .5em">Add to Shelf</button>
                <button id="removeBtn" class="confirm-btn" style="margin-top: 6em; color: red">Remove &times;</button>
            </div>    
        </div>
    </div>
    `
    overlay.classList.toggle("hidden");
    
    const shelves = document.getElementById("shelf_list");
    if(!shelfList || shelfList.length === 0)
    {
        shelves.innerHTML = `<option>Loading...</option>`
        await populateShelves();
    }
    shelves.innerHTML = "";
    for(const shelf of shelfList)
    {
        console.log(shelf.name);
        shelfOption = document.createElement("option");
        shelfOption.value = shelf.id;
        shelfOption.innerHTML = `${shelf.name}`;
        shelves.appendChild(shelfOption);
    }

    const closeBtn = document.getElementById("closeBtn");
    closeBtn.addEventListener("click", (e) =>{
        e.stopPropagation();
        overlay.classList.add("hidden");
    })

    const removeBtn = document.getElementById("removeBtn");
    removeBtn.addEventListener("click", (e) =>{
        e.stopPropagation();
        overlay.classList.add("hidden");
        confirmDelete(book);
    })

    const addToShelfBtn = document.getElementById("addToShelf");
    addToShelfBtn.addEventListener("click", (e) =>{
        e.stopPropagation();
        addToShelf(book)
    })
}

function confirmDelete(book)
{
    console.log("Confirm Prompt");
    const overlay = document.getElementById("confirm-delete");
    const modal = document.getElementById("modal");
    overlay.classList.toggle("hidden");
    modal.classList.toggle("hidden");

    overlay.innerHTML = `
    <p>Are you sure you want to delete <b><u>${book.title}</u></b> from your library?</p>
    <div style="display: flex; justify-content: center; padding-top: 2em">
        <button id="no" class="confirm-btn" style="color: red;">No &times;</button>
        <button id="yes" class="confirm-btn" style="color: green;">Yes &check;</button>
    </div>
    `

    const noBtn = document.getElementById("no");
    noBtn.addEventListener("click", (e) =>{
        e.stopPropagation();
        overlay.classList.add("hidden");
        modal.classList.add("hidden");
    })

    const yesBtn = document.getElementById("yes");
    yesBtn.addEventListener("click", (e) =>{
        e.stopPropagation();
        overlay.classList.add("hidden");
        modal.classList.add("hidden");
        removeBookFromLib(book);
    })
}

async function removeBookFromLib(book)
{
    console.log("remove");

    const removedBook = {
        lib_id: book.lib_id
    };

    try {
    const response = await fetch('/api/books/remove_book', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(removedBook)
    });
        const data = await response.json();
        alert(data.message);
        var index = allBooks.findIndex(libBook => libBook.lib_id == book.lib_id)
        console.log(index);
        if(index > -1)
        {
            allBooks.splice(index, 1);
            filterAndSortBooks();
        }
    } catch (err) {
        alert('Delete Failed.');
    }
}

async function addToShelf(book)
{
    const shelf = document.querySelector(".add-to-shelf").value;

    if(!shelf || !book.lib_id) return; // If no lib_id or shelf_id, then return
    try {
          const response = await fetch('/api/books/shelves/add-book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify ({
              user_book_id: parseInt(book.lib_id),
              shelf_id: shelf
            })
          });
          const data = await response.json();
          if (data.success) {
            alert("Book added to shelf successfully");
          }
        } catch (error) {
            console.error(error);
        }
}

card.addEventListener("click", (e) => {
    e.stopPropagation();
})

document.addEventListener("click", () =>
{
    card.classList.add("hidden");
})