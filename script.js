let stepsBtn = document.getElementById("stepsBtn")
let stepsCount = document.getElementById("stepsCount")

stepsBtn.addEventListener("click", () => {
let actualText = stepsCount.textContent;
let actualSteps = parseInt(actualText, 10)
stepsCount.textContent = actualSteps +1;
})

if ('Accelerometer' in window) {
  console.log("Este dispositivo es compatible con la API Accelerometer.");

  try {
    const accelerometer = new Accelerometer({ frequency: 10 });

    accelerometer.addEventListener("reading", () => {
      console.log(`x: ${accelerometer.x.toFixed(2)}, y: ${accelerometer.y.toFixed(2)}, z: ${accelerometer.z.toFixed(2)}`);
    });

    accelerometer.addEventListener("error", (event) => {
      if (event.error.name === 'NotAllowedError') {
        console.error("Permiso para el acelerómetro denegado.");
      } else {
        console.error("Error del acelerómetro:", event.error.name, event.error.message);
      }
    });

    accelerometer.start();

  } catch (error) {
    console.error("No se pudo iniciar el acelerómetro:", error);
  }

} else {
  console.log("Este dispositivo NO tiene un acelerómetro o el navegador no lo soporta.");
}