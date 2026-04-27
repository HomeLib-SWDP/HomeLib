let currentShelves = [];

async function loadShelves() {
  const mainContent = document.querySelector('.main-content');
  mainContent.querySelectorAll('.shelf').forEach(s => s.remove());
  try {
    const response = await fetch('/api/books/shelves/my');
    if (!response.ok) throw new Error('Failed to load');
    const data = await response.json();
    currentShelves = data.shelves || [];
    renderShelves();
  } catch (error) {
    console.error(error);
  }
}

async function renderShelves() {
    const mainContent = document.querySelector('.main-content');
    if (currentShelves.length === 0) {
      const p = document.createElement('p');
      p.textContent = 'You have no shelves as of now. Try creating one!';
      mainContent.appendChild(p);
      return;
    }
    for (const shelf of currentShelves) {
      const isRead = shelf.name === 'Read';
      const shelfSection = document.createElement('section');
      shelfSection.className = 'shelf';
      shelfSection.dataset.id = shelf.id;
      shelfSection.innerHTML = `
        <div class ="shelf-header">
          <h3>${shelf.name}${isRead ? '' : ' <i class="fa-solid fa-pen"></i>'}</h3>
          <div class="actions">
            ${isRead ? '' : '<button class="delete-btn">Delete</button>'}
          </div>
        </div>
        <div class="books"></div>
      `;
      mainContent.appendChild(shelfSection);

      const booksContainer = shelfSection.querySelector('.books');
      try {
        const resp = await fetch(`/api/books/get_library?shelf_id=${shelf.id}`);
        const books = await resp.json();
        if (books.length === 0) {
          booksContainer.innerHTML = `
            <div class="book">
              <div class="book-details">
                <button class="add-btn addBookBtn" data-shelf-id="${shelf.id}">Add Book</button>
              </div>
            `;
        } else {
          books.forEach(book => {
            const bookHTML = `
              <div class="book">
                <img src="https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg" alt="${book.title}" onerror="this.src='/static/images/default-cover.jpg';"/>
                <div class="book-details">
                  <p class="book-title">${book.title}</p>
                  <p class="book-author">${book.author}</p>
                  <button class="remove-btn" data-user-book-id="${book.lib_id || ''}" data-shelf-id="${shelf.id}">Remove</button>
                  <button class="add-btn addBookBtn" data-shelf-id="${shelf.id}">Add Book</button>
                </div>
              </div>
              <hr class="shelf-hr">
            `;
            booksContainer.innerHTML += bookHTML;
          });
        }
      } catch (err) {
        console.error(err);
        booksContainer.innerHTML = `
          <div class="book">
            <div class="book-details">
            <button class="add-btn addBookBtn" data-shelf-id="${shelf.id}">Add Book</button>
            </div>
          </div>
        `;
      }
    }
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
        if (data.success) {
          const mainContent = document.querySelector('.main-content');
          const shelfSection = document.createElement('section');
          shelfSection.className = 'shelf';
          shelfSection.dataset.id = data.shelf_id;
          shelfSection.innerHTML = `
            <div class = "shelf-header">
              <h3>${name} <i class="fa-solid fa-pen"></i></h3>
              <div class="actions">
                <button class="delete-btn">Delete</button>
              </div>
            </div>
            <div class="books">
              <div class="book">
                <div class="book-details">
                  <button class="add-btn addBookBtn" data-shelf-id="${data.shelf_id}">Add Book</button>
                </div>
              </div>
            </div>
          `;
          mainContent.appendChild(shelfSection);
          currentShelves.push({id: data.shelf_id, name: name});
        } else alert(data.message || 'Failed to create the requested shelf');
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
        if (data.success) {
          const shelfSection = document.querySelector(`.shelf[data-id="${shelfId}"]`);
          if (shelfSection) {
            const h3 = shelfSection.querySelector('h3');
            if (h3) {
              h3.innerHTML = `${newName.trim()} <i class="fa-solid fa-pen"></i>`;
            }
          }
        }
        else alert(data.message || 'Failed to update the selected shelf');
    } catch (error) {
        console.error(error);
        alert('Error updating the shelf');
    }
}

async function deleteShelf(shelfId) {
  if (!confirm('Delete this shelf?')) return;
  try {
    const response = await fetch(`/api/books/shelves/${shelfId}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (data.success) {
      const shelfSection = document.querySelector(`.shelf[data-id="${shelfId}"]`);
      if (shelfSection) {
        shelfSection.remove();
      }
    }
    else alert(data.message || 'Failed to delete shelf');
  } catch (error) {
    console.error(error);
    alert('Error deleting shelf');
  }
}

async function populateBookSelect() {
  const select = document.querySelector('#loanForm select');
  if (!select) return;
  select.innerHTML = '';
  try {
    const response = await fetch('/api/books/get_library');
    const books = await response.json();
    if (books.length === 0) {
      const option = document.createElement('option');
      option.disabled = true;
      option.textContent = 'No books in your library yet';
      select.appendChild(option);
    } else {
        books.forEach(book => {
          const option = document.createElement('option');
          option.value=book.lib_id;
          option.textContent = book.title;
          select.appendChild(option);
        });
    }
  } catch (error) {
    console.error(error);
  }
}

window.addEventListener('DOMContentLoaded', () => {
    loadShelves();
    const createBtn = document.querySelector('.create-btn');
    if (createBtn) createBtn.addEventListener('click', createShelf);
    const mainContent = document.querySelector('.main-content');
    mainContent.addEventListener('click', (e) => {
      if (e.target.classList.contains('fa-pen')) {
        const section = e.target.closest('.shelf');
        const id = parseInt(section.dataset.id);
        if (id) editShelf(id);
      }
      if (e.target.classList.contains('delete-btn')) {
        const section = e.target.closest('.shelf');
        if (section) {
          const name = section.querySelector('h3').textContent.trim().replace(/<i.*<\/i>/, '').trim();
          if (name === 'Read') {
            alert("Cannot delete the 'Read' shelf");
            return;
          }
          const id = parseInt(section.dataset.id);
          if (id) deleteShelf(id);
        }
      }
      if (e.target.classList.contains('addBookBtn')) {
        currentShelfIdForAdd = parseInt(e.target.dataset.shelfId);
        const modal = document.getElementById("modal");
        if (modal) {
          modal.style.display = "flex";
          populateBookSelect();
        }
      }
      if (e.target.classList.contains('remove-btn')) {
        const userBookId = e.target.dataset.userBookId;
        const shelfId = parseInt(e.target.dataset.shelfId);
        if (userBookId && shelfId) {
          if (confirm('Remove this book from the shelf?')) {
            fetch('/api/books/shelves/remove-book', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_book_id: parseInt(userBookId), shelf_id: shelfId })
            })
            .then(async () => {
              const shelfSection = document.querySelector(`.shelf[data-id="${shelfId}"]`);
              if (shelfSection) {
                const booksContainer = shelfSection.querySelector('.books');
                const resp = await fetch(`/api/books/get_library?shelf_id=${shelfId}`);
                const books = await resp.json();
                booksContainer.innerHTML = '';
                if (books.length === 0) {
                  booksContainer.innerHTML = `
                    <div class="book">
                      <div class="book-details">
                        <button class="add-btn addBookBtn" data-shelf-id=${shelfId}">Add Book</button>
                      </div>
                    </div>
                  `;
                } else {
                  books.forEach(book => {
                    const bookHTML = `
                      <div class="book">
                        <img src="https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg" alt="${book.title}" onerror="this.src='/static/images/default-cover.jpg';"/>
                        <div class="book-details">
                          <p class="book-title">${book.title}</p>
                          <p class="book-author">${book.author}</p>
                          <button class="remove-btn" data-user-book-id="${book.lib_id || ''}" data-shelf-id="${shelfId}">Remove</button>
                          <button class="add-btn addBookBtn" data-shelf-id="${shelfId}">Add Book</button>
                        </div>
                      </div>
                      <hr class="shelf-hr">
                      `;
                      booksContainer.innerHTML += bookHTML;
                  });
                }
              }
            });
          }
        }
      }
    });
    const modal = document.getElementById("modal");
    const closeBtn = document.querySelector(".close");
    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.style.display = "none";
        currentShelfIdForAdd = null;
      };
    }
    window.onclick = (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
        currentShelfIdForAdd = null;
      }
    };
    const loanForm = document.getElementById("loanForm");
    if (loanForm) {
      loanForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentShelfIdForAdd) return;
        const select = loanForm.querySelector('select');
        const userBookId = select.value;
        if (!userBookId) return;
        try {
          const response = await fetch('/api/books/shelves/add-book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify ({
              user_book_id: parseInt(userBookId),
              shelf_id: currentShelfIdForAdd
            })
          });
          const data = await response.json();
          if (data.success) {
            modal.style.display = "none";
            const shelfIdForUpdate = currentShelfIdForAdd;
            currentShelfIdForAdd = null;
            const shelfSection = document.querySelector(`.shelf[data-id="${shelfIdForUpdate}"]`);
            if (shelfSection) {
              const booksContainer = shelfSection.querySelector('.books');
              const resp = await fetch(`/api/books/get_library?shelf_id=${shelfIdForUpdate}`);
              const books = await resp.json();
              booksContainer.innerHTML = '';
              if (books.length === 0) {
                booksContainer.innerHTML = `
                  <div class="book">
                    <div class="book-details">
                      <button class="add-btn addBookBtn" data-shelf-id="${shelfIdForUpdate}">Add Book</button>
                    </div>
                  </div>
                `;
              } else {
                books.forEach(book => {
                    const bookHTML = `
                      <div class="book">
                        <img src="https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg" alt="${book.title}" onerror="this.src='/static/images/default-cover.jpg';"/>
                        <div class="book-details">
                          <p class="book-title">${book.title}</p>
                          <p class="book-author">${book.author}</p>
                          <button class="remove-btn" data-user-book-id="${book.lib_id || ''}" data-shelf-id="${shelfIdForUpdate}">Remove</button>
                          <button class="add-btn addBookBtn" data-shelf-id="${shelfIdForUpdate}">Add Book</button>
                        </div>
                      </div>
                      <hr class="shelf-hr">
                      `;
                      booksContainer.innerHTML += bookHTML;
                  });
              }
            }
          }
        } catch (error) {
            console.error(error);
        }
      });
    }
  });