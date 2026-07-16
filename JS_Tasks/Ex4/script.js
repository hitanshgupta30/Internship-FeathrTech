const nameBar = document.getElementById("name");
const emailBar = document.getElementById("email");
const ageBar = document.getElementById("age");

const nameButton = document.getElementById("nameButton");
const emailButton = document.getElementById("emailButton");
const ageButton = document.getElementById("ageButton");

nameButton.addEventListener("click", () => {
    const name = nameBar.value.trim();
    if (name === "") {
        alert("Please enter a name.");
    }
});

emailButton.addEventListener("click", () => {
    const email = emailBar.value.trim();
    if (email === "") {
        alert("Please enter an email.");
    } else if (!email.includes("@") || !email.includes(".")) {
        alert("Please enter a valid email.");
    }
});

ageButton.addEventListener("click", () => {
    const age = ageBar.value;
    
    if (age === "") {
        alert("Please enter your age.");
    } else if (Number(age) < 18) { 
        alert("You are not old enough to register.");
    }
});