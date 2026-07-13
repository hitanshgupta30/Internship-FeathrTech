const heading = document.getElementsByTagName('h1')[0];
const button = document.getElementsByClassName('btn')[0];

button.addEventListener('click', function() {
    heading.classList.add('fade-out');

    setTimeout(function() {
        heading.innerHTML = '<i>Congratulations, You clicked it !!</i> 🎉';
        
        heading.classList.remove('fade-out');
    }, 300); 
});