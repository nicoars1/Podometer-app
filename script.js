let stepsBtn = document.getElementById("stepsBtn")
let stepsCount = document.getElementById("stepsCount")

stepsBtn.addEventListener("click", () => {
let actualText = stepsCount.textContent;
let actualSteps = parseInt(actualText, 0)
stepsCount.textContent = actualSteps +1;
})