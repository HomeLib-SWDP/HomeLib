let currentShelves = [];

async function loadShelves() {
    try {
        const response = await fetch('/api/books/shelves/my');
        if (!response.ok) throw new Error('Failed to load');
        const data = await response.json();
        currentShelves = data.shelves || [];
        renderShelves();
    } catch (error) {
        console.error(error);
        document.getElementById('shelves-container').innerHTML = '<p>Error loading the shelves.</p>';
    }
}

function renderShelves() {
    const container = document.getElementById('shelves-container');
    container.innerHTML = '';
    if (currentShelves.length === 0) {
        container.innerHTML = '<p>You have no shelves as of now.</p>';
        return;
    }
    currentShelves.forEach(shelf => {
        const card = document.createElement('div');
        card.className = 'shelf-card';
        card.innerHTML = `
            <h3>${shelf.name}</h3>
            <p>${shelf.book_count || 0} books</p>
            ${shelf.name !== 'Read' ? `<button class="edit-shelf-btn" data-id=${shelf.id}>Edit</button>` : ''}
        `;
        container.appendChild(card);
    });
}

async function createShelf() {
    const name = prompt("Enter your new shelf's name:");
    if (!name || name.trim() === '') return;
    try {
        const response = await fetch('/api/books/shelves', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name.trim() })
        });
        const data = await response.json();
        if (data.success) loadShelves();
        else alert(data.message || 'Failed to create the requested shelf');
    } catch (error) {
        console.error(error);
        alert('Error creating the new shelf');
    }
}

async function editShelf(shelfId) {
    const newName = prompt("Enter the new name for your shelf:");
    if (!newName || newName.trim() === '') return;
    try {
        const response = await fetch(`/api/books/shelves/${shelfId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName.trim() })
        });
        const data = await response.json();
        if (data.success) loadShelves();
        else alert(data.message || 'Failed to update the selected shelf');
    } catch (error) {
        console.error(error);
        alert('Error updating the shelf');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadShelves();
    document.getElementById('addShelfBtn').addEventListener('click', createShelf);

    const container = document.getElementById('shelves-container');
    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-shelf-btn')) {
            const id = parseInt(e.target.dataset.id);
            editShelf(id);
        }
    });
});


const modal = document.getElementById("modal");
const addBtn = document.getElementById("addBookBtn");
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