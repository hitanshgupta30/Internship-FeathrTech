async function getUser() {
    console.log("Loading...");

    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/users/1");

        const user = await response.json();

        console.log("User Loaded");

        console.log("Name:", user.name);
        console.log("Email:", user.email);
        console.log("Phone:", user.phone);
        console.log("Company:", user.company.name);
    } catch (error) {
        console.log("Unable to fetch user.");
    }
}

getUser();