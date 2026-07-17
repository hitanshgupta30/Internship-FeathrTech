async function errorDisplay() {

    const errorMessage = document.getElementById("error-message");

    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/userxyz");
        if (!response.ok) {
            throw new Error("404 Not Found");
        }

        const user = await response.json();

        errorMessage.innerHTML = `
            <h3>User Loaded Successfully</h3>
            <p>Name: ${user.name}</p>
            <p>Email: ${user.email}</p>
        `;

    } catch (error) {
        errorMessage.innerHTML = "404 Not Found";
        console.log(error);
    }
}
errorDisplay();