const portfolioData = {
    projects: {
        title: "Projects",
        content: "Here are some of my recent projects...<br> 1. JLX: A marketplace web-app for my college that provides a platform to students to buy, sell and exchange goods and material securely.<br> 2. AI Voice calling agent: A conversational AI system for handling voice calls. <br> 3. Currently developing a Zomato style food ordering application for my college canteen."
    },
    about: {
        title: "About Me",
        content: "Aspiring Software Engineer with a strong foundation in C and C++, and a growing passion for full-stack web development. I enjoy designing clean, interactive web applications while continuously exploring modern technologies. Beyond coding, I'm fascinated by integrating Artificial Intelligence into real-world solutions to automate tasks, improve productivity, and build innovative user experiences. I love experimenting with new ideas, solving challenging problems, and turning creative concepts into practical applications."
    },
    skills: {
        title: "Skills",
        content: "I have a strong foundation in.. <br> HTML <br> CSS <br> JavaScript <br> C <br> C++ (Studying DSA in depth now)."
    },
    strengths: {
        title: "Strengths",
        content: "I am a quick learner and have excellent problem-solving abilities. I am a good communicator and can work well in a team. I am also highly motivated and always eager to learn new technologies. I enjoy taking on challenges and finding innovative solutions to complex problems."
    },
    contact: {
        title: "Contact",
        content: "Feel free to reach out to me via... <br> email : hitansh.gupta@gmail.com <br> LinkedIn : <a href='https://www.linkedin.com/in/hitansh-gupta-188597390/' target='_blank'>LinkedIn</a> | <a href='https://github.com/hitanshgupta30' target='_blank'>GitHub</a>"
    },
    education: {
        title: "Education",
        content: "I am currently pursuing a Bachelor's degree in <u>Electronics and Communication Engineering</u> from <b>Jaypee Institute of Information Technology</b>. I have completed various courses in programming, data structures, algorithms, and web development.<br> I completed my 11th and 12th from <b>Gurukul, Kurukshetra</b>, where I developed my interest in technology. I also developed my personality and discipline there. (12th Boards : 83.4%) <br> I studied in <b>St. Francis School, Indirapuram</b> for my schooling till 10th, where I developed a strong foundation in mathematics and science. (10th Boards : 93.3%)"
    },
    experience: {
        title: "Experience",
        content: "I have worked as a Web-Dev Intern for 1 month at <a href='https://www.feathrtech.com/' target='_blank'>FeathrTech</a> where I developed a web application base and explored my interest even further. I also studied DevOps there."
    }
};

const nodes = document.querySelectorAll('.node');
const box = document.getElementById("info-panel");
const title = document.getElementById("panel-title");
const content = document.getElementById("panel-content");
const closeBtn = document.getElementById("close-btn");

closeBtn.addEventListener('click', () => {
    box.classList.remove("show");
    nodes.forEach(n => n.classList.remove("active"));
});

nodes.forEach(node => {
    node.addEventListener('click', () => {
        nodes.forEach(n=>n.classList.remove("active"));
        node.classList.add("active");

        let key=node.classList[1];
        title.textContent=portfolioData[key].title;
        content.innerHTML=portfolioData[key].content.replace(/\n/g,"<br>");

        box.classList.add("show");
    });
});

const themeToggle = document.getElementById('theme-toggle');

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    if (currentTheme === 'light') {
        document.documentElement.removeAttribute('data-theme');
        themeToggle.textContent = '🌙'; 
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.textContent = '☀️'; 
    }
});
