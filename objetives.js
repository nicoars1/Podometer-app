const addObjetiveBtn = document.getElementById('addObjetive');
const goalWindow = document.getElementById('goalWindow');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const inputTitle = document.getElementById('inputTitle');
const inputSteps = document.getElementById('inputSteps');
const cardsContainer = document.getElementById('cardsContainer');

addObjetiveBtn.addEventListener('click', () => {
  goalWindow.classList.toggle("windowHidden");
  addObjetiveBtn.classList.add("windowHidden");
});

cancelBtn.addEventListener('click', () => {
  goalWindow.classList.toggle("windowHidden");
  addObjetiveBtn.classList.remove("windowHidden");
});

saveBtn.addEventListener('click', () => {
  createObjetive();
  goalWindow.classList.add("windowHidden");
  addObjetiveBtn.classList.remove("windowHidden");
});

inputSteps.addEventListener("keydown", (e) => {
  if (e.key === "-" || e.key === "," || e.key === ".") e.preventDefault();
})

// recupero los pasos de script.js
let stepsCounter = 0;
document.addEventListener("stepUpdated", (event) => {
    stepsCounter = event.detail.stepCount;
});

document.addEventListener("stepUpdated", () => {
    updateStepCounters();
    checkObjectives();
});

function updateStepCounters() {
    const cards = document.querySelectorAll(".objetiveCard");

    cards.forEach(card => {
        const goal = Number(card.dataset.stepsGoal);
        const start = Number(card.dataset.stepsStart);
        const stepsSpan = card.stepsSpan;

        const progress = stepsCounter - start;

        stepsSpan.textContent = `${stepsCounter}/${goal}`;
    });
}

function checkObjectives() {
    const cards = document.querySelectorAll(".objetiveCard");

    cards.forEach(card => {
        const goal = Number(card.dataset.stepsGoal);
        const start = Number(card.dataset.stepsStart);
        const titleSpan = card.titleSpan;

        const progress = stepsCounter - start;

        if (progress >= goal) {
            titleSpan.textContent = "DONE";
            card.style.backgroundColor = "#8fd989";
        }
    });
}

cardsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("deleteBtn")) {
        e.target.parentElement.remove(); 
    }
});

function createObjetive() {
  const steps = inputSteps.value.trim();
  const title = inputTitle.value.trim();

  if (title === "") return;
  if (steps === "" || steps <= 0) return;

  cardsContainer.classList.remove("windowHidden");

  const newObjetive = document.createElement("div");
  newObjetive.classList.add("objetiveCard");
  
  const titleSpan = document.createElement("span");
  titleSpan.textContent = title;

  const stepsSpan = document.createElement("span");
  stepsSpan.textContent = stepsCounter +("\/") +steps;

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("deleteBtn");
  deleteBtn.textContent = "🗑️"

  newObjetive.appendChild(titleSpan);
  newObjetive.appendChild(stepsSpan);
  newObjetive.appendChild(deleteBtn);

  // guardamos los valores en datasets para recurrir a ellos despues
  newObjetive.dataset.stepsGoal = steps;
  newObjetive.dataset.stepsStart = stepsCounter;
  newObjetive.titleSpan = titleSpan;
  newObjetive.stepsSpan = stepsSpan;

  cardsContainer.appendChild(newObjetive);

  inputTitle.value = "";
  inputSteps.value = "";
}

function done() {
  if (stepsCounter >= steps) {
    titleSpan.textContent = "done";
  }
}

const moreOptionsBtn = document.getElementById("moreOptions");
const optionsMenu = document.getElementById("optionsMenu");
const clearObjectivesBtn = document.getElementById("clearObjectives");

moreOptionsBtn.addEventListener("click", () => {
    optionsMenu.classList.toggle("windowHidden");
    
});

// Eliminar todos los objetivos
clearObjectivesBtn.addEventListener("click", () => {
    cardsContainer.innerHTML = "";
    optionsMenu.classList.toggle("windowHidden");
});

