const fetchBtn = document.getElementById("fetchBtn");
const user = document.getElementById("user");
const loading = document.getElementById("loading");
const error = document.getElementById("error");

async function fetchUser() {

    loading.textContent = "Loading...";
    error.textContent = "";
    user.innerHTML = "";

    try {
        const response = await fetch("https://randomuser.me/api/");

        if (!response.ok) {
            throw new Error("Something went wrong!");
        }

        const data = await response.json();
        const person = data.results[0];

        loading.textContent = "";

        user.innerHTML = `
            <img src="${person.picture.large}">
            <h3>${person.name.first} ${person.name.last}</h3>
            <p>Email: ${person.email}</p>
            <p>Country: ${person.location.country}</p>
            <button onclick="fetchUser()">Fetch Another User</button>
        `;

    } catch (err) {
        loading.textContent = "";
        error.textContent = err.message;
    }
}

fetchBtn.addEventListener("click", fetchUser);