
const API_BASE_URL = "http://127.0.0.1:5000";

async function getLibrary()
{   
    try
    {
        const response = await fetch(`${API_BASE_URL}/api/books/get_library`);

        if(!response.ok)
            throw new Error(`Error! ${response.status}`)

        const data = await response.json()

        console.log(data)
    }
    catch(err)
    {
        console.error("Error fetching library: ", err)
    }
}

document.addEventListener("DOMContentLoaded", () => {
  getLibrary();
});