const themeToggle = document.getElementById("theme-toggle");

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️";
} else {
    themeToggle.textContent = "🌙";
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
        themeToggle.textContent = "☀️";
    } else {
        localStorage.setItem("theme", "light");
        themeToggle.textContent = "🌙";
    }
});

let rawTexts = localStorage.getItem("plain_task_texts") || "";
let rawStates = localStorage.getItem("plain_task_states") || "";

let taskTexts = rawTexts ? rawTexts.split("|") : [];
let taskStates = rawStates ? rawStates.split("|") : [];

let currentFilter = "all";

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const filterButtons = document.querySelectorAll(".filter-btn");
const particleContainer = document.getElementById("particles");

function saveTasks() {
    localStorage.setItem("plain_task_texts", taskTexts.join("|"));
    localStorage.setItem("plain_task_states", taskStates.join("|"));
}

function renderTasks() {
    taskList.innerHTML = "";

    let visibleTasks = 0;

    for (let i = 0; i < taskTexts.length; i++) {
        const text = taskTexts[i];
        const isCompleted = taskStates[i] === "true";

        if (currentFilter === "pending" && isCompleted) continue;
        if (currentFilter === "completed" && !isCompleted) continue;

        visibleTasks++;

        const li = document.createElement("li");

        li.className = `task-item ${isCompleted ? "completed" : ""}`;
        li.dataset.index = i;

        li.innerHTML = `
            <div class="task-left">
                <input type="checkbox" class="task-checkbox" ${isCompleted ? "checked" : ""}>
                <span class="task-text" contenteditable="false">${text}</span>
            </div>

            <div class="task-actions">
                <button class="action-btn edit-btn">📝</button>
                <button class="action-btn delete-btn">❌</button>
            </div>
        `;

        taskList.appendChild(li);
    }

    if (visibleTasks === 0) {
        taskList.innerHTML = `
            <p class="empty-message">
                No tasks found.
            </p>
        `;
    }
}

taskForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const text = taskInput.value.trim();

    if (!text) return;

    taskTexts.push(text);
    taskStates.push("false");

    saveTasks();
    renderTasks();

    taskInput.value = "";
    taskInput.focus();
});

taskList.addEventListener("click", (e) => {
    const taskItem = e.target.closest(".task-item");

    if (!taskItem) return;

    const index = Number(taskItem.dataset.index);

    if (e.target.classList.contains("task-checkbox")) {
        taskStates[index] = e.target.checked ? "true" : "false";

        saveTasks();
        renderTasks();
    }

    if (e.target.classList.contains("delete-btn")) {
        const confirmDelete = confirm("Delete this task?");

        if (!confirmDelete) return;

        taskTexts.splice(index, 1);
        taskStates.splice(index, 1);

        saveTasks();
        renderTasks();
    }

    if (e.target.classList.contains("edit-btn")) {
        const textSpan = taskItem.querySelector(".task-text");
        const editBtn = taskItem.querySelector(".edit-btn");

        const editing = textSpan.getAttribute("contenteditable") === "true";

        if (!editing) {
            textSpan.setAttribute("contenteditable", "true");

            textSpan.focus();

            const range = document.createRange();
            const selection = window.getSelection();

            range.selectNodeContents(textSpan);
            range.collapse(false);

            selection.removeAllRanges();
            selection.addRange(range);

            editBtn.textContent = "💾";

            textSpan.addEventListener("keydown", function (event) {
                if (event.key === "Enter") {
                    event.preventDefault();
                    editBtn.click();
                }
            });
        } else {
            const updatedText = textSpan.innerText.trim();

            if (!updatedText) {
                alert("Task cannot be empty.");
                renderTasks();
                return;
            }

            taskTexts[index] = updatedText;

            saveTasks();

            renderTasks();
        }
    }
});

filterButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
        filterButtons.forEach((btn) => btn.classList.remove("active"));

        e.target.classList.add("active");

        currentFilter = e.target.dataset.filter;

        renderTasks();
    });
});

function createParticle(){
    const particle = document.createElement("div");
    particle.classList.add("particle");
    if(document.body.classList.contains("dark")){
        particle.textContent = "❄️";
    }else{
        particle.textContent = "🍁";
    }
    particle.style.left = Math.random() * window.innerWidth + "px";
    particle.style.fontSize =
        (18 + Math.random() * 18) + "px";
    particle.style.animationDuration =
        (5 + Math.random() * 3) + "s";
    particle.style.opacity =
        0.3 + Math.random() * 0.5;
    particleContainer.appendChild(particle);
    setTimeout(()=>{
        particle.remove();
    },13000);
}
setInterval(createParticle,350);
renderTasks();
//hey