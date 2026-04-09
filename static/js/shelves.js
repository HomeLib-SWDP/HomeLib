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
const addBtn = document.querySelectorAll(".addBookBtn");
const closeBtn = document.querySelector(".close");

addBtn.forEach(btn => {
  btn.onclick = () => {
    modal.style.display = "flex";
  };
});

closeBtn.onclick = () => {
  modal.style.display = "none";
};

window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
};

document.addEventListener("click", function(e) {
  if (e.target.classList.contains("delete-btn")) {
    const shelf = e.target.closest(".shelf");
    shelf.remove();
  }
});



const createBtn = document.querySelector(".create-btn");
const mainContent = document.querySelector(".main-content");

createBtn.addEventListener("click", () => {

  const newShelf = document.createElement("section");
  newShelf.classList.add("shelf");

  newShelf.innerHTML = `
    <div class="shelf-header">
      <h3>Fiction Shelves <i class="fa-solid fa-pen" style="color: rgb(80, 80, 80);"></i></h3>
      <div class="actions">
        <button class="delete-btn">Delete</button>
      </div>
    </div>

    <div class="books">
      <div class="book">
        <img src="/static/images/hunger.jpg" />
        <div class="book-details">
          <p class="book-title">The Hunger Games</p>
          <p class="book-author">Suzanne Collins</p>
          <button class="remove-btn">Remove</button>
          <button class="add-btn addBookBtn">Add Book</button>
        </div>
      </div>

      <hr class="shelf-hr">

      <div class="book">
        <img src="/static/images/pride.jpg" />
        <div class="book-details">
          <p class="book-title">Pride and Prejudice</p>
          <p class="book-author">Jane Austen</p>
          <button class="remove-btn">Remove</button>
          <button class="add-btn addBookBtn">Add Book</button>
        </div>
      </div>
    </div>
  `;


  mainContent.appendChild(newShelf);
});


document.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const shelf = e.target.closest(".shelf");
    shelf.remove();
  }
});

document.addEventListener("click", (e) => {
  if (e.target.closest("i.fa-pen")) {
    const h3 = e.target.closest(".shelf-header").querySelector("h3");
    const currentText = h3.childNodes[0].nodeValue.trim();
    const newName = prompt("Enter new shelf name:", currentText);

    if (newName !== null && newName.trim() !== "") {
      
      h3.childNodes[0].nodeValue = newName + " ";
    }
  }
});