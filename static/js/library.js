let allBooks = []; 
let currentShelfId = null;

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
            renderBook(allBooks, container);
        } else {
            container.innerHTML = '<p style="padding: 2em;">No books in this shelf yet.</p>';
        }
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p style="color:red; padding: 2em;">Error loading books.</p>';
    }
}

async function populateShelvesDropdown() {
    const select = document.querySelector('.shelves-sort');
    try {
        const response = await fetch('/api/books/shelves/my');
        if (!response.ok) throw new Error('Fetch failed');

        const res = await response.json();

        select.innerHTML = '<option value="all">All Shelves</option>';

        const shelvesList = res.shelves || res || [];

        if (Array.isArray(shelvesList)) {
            shelvesList.forEach(shelf => {
                const opt = document.createElement('option');
                opt.value = shelf.id;
                opt.textContent = shelf.name;
                select.appendChild(opt);
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

    filtered.sort((a,b) => {
        if (sortBy === "old") return (a.year || 0) - (b.year || 0);
        if (sortBy === "new") return (b.year || 0) - (a.year || 0);
        if (sortBy === "subject") return (a.subject || "").localeCompare(b.subject || "");
        return a.title.localeCompare(b.title);
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
        container.appendChild(div);
    });
}

window.addEventListener('DOMContentLoaded', () => {
    loadLibrary();
    populateShelvesDropdown();

    document.getElementById('search').addEventListener('input', filterAndSortBooks);
    document.querySelector('.sort-by').addEventListener('change', filterAndSortBooks);

    const shelfSelect = document.querySelector('.shelves-sort');
    shelfSelect.addEventListener('change', () => {
        const val = shelfSelect.value;
        loadLibrary(val === 'all' ? null : val);
    });
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