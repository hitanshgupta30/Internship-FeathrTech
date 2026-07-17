const studentInput = document.querySelector("#studentInput");
        const addBtn = document.querySelector("#addBtn");
        const studentList = document.querySelector("#studentList");

        let studentsArray = [];

        function renderList() {
            studentList.innerHTML = "";

            studentsArray.map((studentName, index) => {
                const li = document.createElement("li");
                li.textContent = studentName;

                li.addEventListener("click", () => {
                    removeStudent(index);
                });

                studentList.appendChild(li);
            });
        }

        function addStudent() {
            const name = studentInput.value.trim();

            if (name === "") {
                alert("Please enter a valid student name.");
                return;
            }

            studentsArray.push(name);

            renderList();
            studentInput.value = "";
            studentInput.focus();
        }

        function removeStudent(indexToRemove) {
            studentsArray = studentsArray.filter((_, index) => index !== indexToRemove);
            renderList();
        }

        addBtn.addEventListener("click", addStudent);
        studentInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") addStudent();
        });