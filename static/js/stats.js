async function loadLibraryStats() {
    try {
        const response = await fetch('/api/books/get_stats');
        if (!response.ok) throw new Error("Stats fetch failed");
        const data = await response.json();

        document.querySelector('.span-month').innerText = data.counts.month;
        document.querySelector('.span-year').innerText = data.counts.year;
        document.querySelector('.span-total').innerText = data.counts.total;

        document.querySelector('.stat-author').innerText = data.top_author;

        document.querySelector('.stat-genre').innerText = data.top_genre;

        document.querySelector('.stat-book').innerText = data.longest_book;

        document.querySelector('.stat-pages').innerText = data.total_pages.toLocaleString();

    } catch (err) {
        console.error("Error loading stats:", err);
    }
}

document.addEventListener('DOMContentLoaded', loadLibraryStats);