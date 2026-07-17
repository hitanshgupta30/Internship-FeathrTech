const button = document.getElementById('colorBtn');

const randomColor = ['#FF5733', '#33FF57', '#3357FF', '#f1ff33', '#FF33A1'];

button.addEventListener('click', () => {
    const randomIndex = Math.floor(Math.random() * randomColor.length);
    document.body.style.backgroundColor = randomColor[randomIndex];
});