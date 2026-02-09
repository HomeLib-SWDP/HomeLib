let currentOffset = 0;
let currentQuery = '';
let currentLang = '';
let currentSubject = '';
let currentYearMin = '';
let currentYearMax = '';

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