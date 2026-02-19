


document.getElementById("manualBookForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());


    const targetUrl = this.getAttribute('action');
    
    const response = await fetch( targetUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();
    document.getElementById("message").innerText =
        response.ok ? result.message : (result.Error || "An error occurred");
});