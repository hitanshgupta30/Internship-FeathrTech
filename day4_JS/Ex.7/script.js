async function fetchUsers() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");
    const users = await response.json();

    const container = document.getElementById("users");

    users.forEach((user) => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
                <h3>${user.name}</h3>
                <p><b>Email:</b> ${user.email}</p>
                <p><b>City:</b> ${user.address.city}</p>
            `;

      container.appendChild(card);
    });

  } catch (error) {
    // container.innerHTML = "<h3>No users found.</h3>";
    console.log("Error fetching users:", error);
  }
}

fetchUsers();
