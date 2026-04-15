async function loadLibraryStats() {
    try {
        const response = await fetch('/api/books/get_stats');
        if (!response.ok) throw new Error("Stats fetch failed");
        const data = await response.json();

        // 1. Books Read Tile
        document.querySelector('.span-month').innerText = data.counts.month;
        document.querySelector('.span-year').innerText = data.counts.year;
        document.querySelector('.span-total').innerText = data.counts.total;

        // 2. Top Author
        document.querySelector('.stat-author').innerText = data.top_author;

        // 3. Top Genre
        document.querySelector('.stat-genre').innerText = data.top_genre;

        // 4. Longest Book
        document.querySelector('.stat-book').innerText = data.longest_book;

        // 5. Pages Read
        document.querySelector('.stat-pages').innerText = data.total_pages.toLocaleString();

        // 6. Streak (Hard-coded for now or requires a 'date_read' log table)
        // document.querySelector('.stat-days').innerText = `${data.streak} days`;

    } catch (err) {
        console.error("Error loading stats:", err);
    }
}

document.addEventListener('DOMContentLoaded', loadLibraryStats);