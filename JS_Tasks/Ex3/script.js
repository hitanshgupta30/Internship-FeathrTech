const addButton = document.getElementById("addButton");
const list = document.getElementById("list");
const itemInput = document.getElementById("input");

addButton.addEventListener("click", () => {
    const text = itemInput.value;

    if (text === "") return;

    const newItem = document.createElement("li");
    newItem.textContent = text + "    ";

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.style.marginLeft = "10px";

    delBtn.addEventListener("click", () => {
        newItem.remove();
    });
    newItem.appendChild(delBtn);
    list.appendChild(newItem);

    itemInput.value = "";
});