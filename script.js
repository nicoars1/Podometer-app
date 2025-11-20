const stepCountElement = document.getElementById('stepsCount');
const sensorStatusElement = document.getElementById('sensorStatus');

// CONFIG
const SENSOR_FREQUENCY = 30; 
const WINDOW_SIZE = SENSOR_FREQUENCY * 3; // 3 seconds 
const MIN_ACTIVE_MAGNITUDE = 5;
let STEP_THRESHOLD = 0;
let STEP_RESET_THRESHOLD = 0;

let magnitudes = [];
let stepCount = 0;
let isStepInProgress = false; 
let isActive = false 

if ('LinearAccelerationSensor' in window) {
  sensorStatusElement.innerText = "Sensor activated successfully";

  try {
    const sensor = new LinearAccelerationSensor({ frequency: SENSOR_FREQUENCY });

    sensor.addEventListener("reading", () => {
      const magnitude = Math.sqrt(
        sensor.x**2 + 
        sensor.y**2 + 
        sensor.z**2
      );
      console.log(`Magnitude: ${magnitude}`)
      magnitudes.push(magnitude);
      if (magnitudes.length > WINDOW_SIZE) magnitudes.shift();

      const avg = magnitudes.reduce((a,b)=>a+b,0) / magnitudes.length;
      const variance = magnitudes.reduce((a,b)=>a+(b-avg)**2,0) / magnitudes.length;
      const stdDev = Math.sqrt(variance);

      if (avg > MIN_ACTIVE_MAGNITUDE) {
        if (!isActive) {
          console.log("Activity detected: start of walk.");
          isActive = true;
        }
      } else {
        if (isActive) console.log("Inactive: the walk has stopped.");
        isActive = false;
      }

      if (isActive) {
      STEP_THRESHOLD = avg + stdDev * 1.5; 
      STEP_RESET_THRESHOLD = avg + stdDev * 0.5;

      
      if (magnitude > STEP_THRESHOLD && !isStepInProgress) {
        stepCount++;
        isStepInProgress = true; 
        
     
        stepCountElement.innerText = stepCount;
        console.log(`Step detected (${magnitude.toFixed(2)} > ${STEP_THRESHOLD.toFixed(2)})`);
        // event to get the number of steps in objectives.js
        document.dispatchEvent(new CustomEvent("stepUpdated", {
          detail: { stepCount }
        }));
      }}

      
      if (magnitude < STEP_RESET_THRESHOLD && isStepInProgress) {
        isStepInProgress = false; 
        console.log("...ready for next step");
      }
    });

    sensor.addEventListener("error", (event) => {
      if (event.error.name === 'NotAllowedError') {
        sensorStatusElement.innerText = "Sensor permission denied.";
      } else {
        sensorStatusElement.innerText = `Sensor error: ${event.error.name}`;
      }
    });

    sensor.start();

  } catch (error) {
    sensorStatusElement.innerText = `The sensor could not be started: ${error}`;
  }

} else {
  sensorStatusElement.innerText = "This device does NOT support LinearAccelerationSensor.";
}