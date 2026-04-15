async function loadLibraryStats() {
    try {
        const response = await fetch('/api/books/get_stats');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Stats Loaded:", data);
        const readData = data.read_shelf_counts || {};
        document.querySelector('.span-month').innerText = readData.month ?? 0;
        document.querySelector('.span-year').innerText  = readData.year ?? 0;
        document.querySelector('.span-total').innerText = readData.total ?? 0;
        document.querySelector('.stat-author').innerText = data.top_author ?? "None";
        document.querySelector('.stat-genre').innerText = data.top_genre ?? "None";
        document.querySelector('.stat-book').innerText = data.longest_book ?? "None";
        document.querySelector('.stat-pages').innerText = (data.total_pages ?? 0).toLocaleString();
        document.querySelector('.stat-days').innerText = (data.streak ?? 0) + " days";

    } catch (err) {
        console.error("Error loading stats:", err);

    }
}

document.addEventListener('DOMContentLoaded', loadLibraryStats);