const stepCountElement = document.getElementById('stepsCount');

// CONFIGURACIÓN
const SENSOR_FREQUENCY = 30;
const WINDOW_SIZE = SENSOR_FREQUENCY * 2; // 2 segundos de ventana

// UMBRALES DE DETECCIÓN
const MIN_STEP_INTERVAL = 250;  // mínimo 250ms entre pasos
const MAX_STEP_INTERVAL = 2000; // máximo 2s entre pasos
const MIN_PEAK_MAGNITUDE = 4.0; // magnitud mínima de pico para contar paso
const DESK_MOVEMENT_THRESHOLD = 0.4; // regularidad máxima para movimiento de escritorio
const MIN_STEPS_TO_CONFIRM = 2; // pasos mínimos para empezar a contar

// VARIABLES DE ESTADO
let stepCount = 0;
let tempStepCount = 0; // pasos temporales antes de confirmar
let isStepInProgress = false;
let lastStepTime = 0;
let isWalkingConfirmed = false;

// HISTORIAL
let magnitudeHistory = [];
let peakHistory = []; // historial de picos detectados

if ("LinearAccelerationSensor" in window) {
    

    try {
        const sensor = new LinearAccelerationSensor({ frequency: SENSOR_FREQUENCY });

        sensor.addEventListener("reading", () => {
            const now = Date.now();

            // CALCULAR MAGNITUD TOTAL
            const magnitude = Math.sqrt(
                sensor.x ** 2 +
                sensor.y ** 2 +
                sensor.z ** 2
            );

            // GUARDAR HISTORIAL
            magnitudeHistory.push(magnitude);
            if (magnitudeHistory.length > WINDOW_SIZE) magnitudeHistory.shift();

            // ESPERAR SUFICIENTES DATOS
            if (magnitudeHistory.length < SENSOR_FREQUENCY / 2) return;
            
            // ANÁLISIS ESTADÍSTICO
            const avg = magnitudeHistory.reduce((a, b) => a + b, 0) / magnitudeHistory.length;
            const variance = magnitudeHistory.reduce((a, b) => a + (b - avg) ** 2, 0) / magnitudeHistory.length;
            const stdDev = Math.sqrt(variance);

            // Regularidad del movimiento
            const regularity = stdDev / (avg + 0.1);

            // UMBRALES DINÁMICOS
            
            const STEP_THRESHOLD = avg + stdDev * 1.8;
            const RESET_THRESHOLD = avg + stdDev * 0.7;

            // DETECCIÓN DE PICO
            
            const isPeak = magnitude > STEP_THRESHOLD && magnitude > MIN_PEAK_MAGNITUDE;

            if (isPeak && !isStepInProgress) {
                const timeSinceLastStep = now - lastStepTime;

                // FILTRO 1: MOVIMIENTO DE ESCRITORIO
                
                // Movimientos de escritorio son muy regulares y de baja variabilidad
                // La caminata tiene más variabilidad natural
                if (regularity < DESK_MOVEMENT_THRESHOLD) {
                    console.log(`🖥️ Movimiento de escritorio detectado (reg: ${regularity.toFixed(2)})`);
                    isStepInProgress = true;
                    return;
                }

                // FILTRO 2: INTERVALO DE TIEMPO
                
                if (lastStepTime > 0) {
                    if (timeSinceLastStep < MIN_STEP_INTERVAL) {
                        console.log(`⚡ Demasiado rápido: ${timeSinceLastStep}ms`);
                        isStepInProgress = true;
                        return;
                    }
                    
                    if (timeSinceLastStep > MAX_STEP_INTERVAL) {
                        console.log(`⏸️ Pausa detectada: ${timeSinceLastStep}ms - Reseteando`);
                        // Resetear la confirmación de caminata
                        peakHistory = [];
                        tempStepCount = 0;
                        isWalkingConfirmed = false;
                    }
                }

                // FILTRO 3: MAGNITUD MÍNIMA
                
                if (magnitude < MIN_PEAK_MAGNITUDE) {
                    console.log(`📉 Magnitud insuficiente: ${magnitude.toFixed(2)}`);
                    isStepInProgress = true;
                    return;
                }

                // FILTRO 4: DEBE TENER VARIABILIDAD SUFICIENTE
                
                // La caminata genera variabilidad, levantar el teléfono es suave
                if (stdDev < 1.5) {
                    console.log(`📱 Movimiento muy suave (stdDev: ${stdDev.toFixed(2)})`);
                    isStepInProgress = true;
                    return;
                }

                // GUARDAR PICO Y ANALIZAR PATRÓN
                
                peakHistory.push({
                    time: now,
                    magnitude: magnitude,
                    interval: timeSinceLastStep
                });

                // Mantener solo los últimos 10 picos
                if (peakHistory.length > 10) peakHistory.shift();

                // VALIDACIÓN INTELIGENTE
                
                let isValidStep = true;

                // Si tenemos suficiente historial, verificamos el patrón
                if (peakHistory.length >= 4) {
                    const recentIntervals = peakHistory.slice(-4).map(p => p.interval).filter(i => i > 0);
                    
                    if (recentIntervals.length >= 3) {
                        // Calcular mediana en lugar de promedio (más robusto a outliers)
                        const sortedIntervals = [...recentIntervals].sort((a, b) => a - b);
                        const median = sortedIntervals[Math.floor(sortedIntervals.length / 2)];
                        
                        // Verificar que el intervalo actual no sea extremadamente diferente
                        const deviation = Math.abs(timeSinceLastStep - median) / median;
                        
                        // Permitimos hasta 150% de desviación
                        if (deviation > 1.5) {
                            console.log(`📊 Desviación alta: ${(deviation * 100).toFixed(0)}% de la mediana`);
                            isValidStep = false;
                        }
                    }
                }

                // FILTRO ANTI-SACUDIDAS
                
                // Si hay muchos picos en muy poco tiempo, es una sacudida
                const recentPeaks = peakHistory.filter(p => now - p.time < 1000);
                if (recentPeaks.length > 5) {
                    console.log(`🤯 Demasiados picos en 1 segundo: ${recentPeaks.length}`);
                    isValidStep = false;
                }

                // CONTAR PASO
                
                if (isValidStep) {
                    lastStepTime = now;
                    isStepInProgress = true;

                    // Sistema de confirmación: necesitamos pasos consecutivos
                    if (!isWalkingConfirmed) {
                        tempStepCount++;
                        console.log(`🔄 Paso temporal ${tempStepCount}/${MIN_STEPS_TO_CONFIRM}`);
                        
                        if (tempStepCount >= MIN_STEPS_TO_CONFIRM) {
                            isWalkingConfirmed = true;
                            stepCount += tempStepCount;
                            console.log(`✅ Caminata confirmada! ${tempStepCount} pasos contados`);
                            tempStepCount = 0;
                        }
                    } else {
                        stepCount++;
                        console.log(`👣 Paso ${stepCount} | ${timeSinceLastStep}ms | mag: ${magnitude.toFixed(2)} | std: ${stdDev.toFixed(2)}`);
                    }

                    // ACTUALIZAR UI
                    stepCountElement.innerText = stepCount;

                    // ENVIAR EVENTO A OBJETIVES.JS 
                    document.dispatchEvent(
                        new CustomEvent("stepUpdated", { detail: { stepCount } })
                    );
                } else {
                    // Paso inválido - resetear confirmación
                    tempStepCount = 0;
                    isWalkingConfirmed = false;
                    peakHistory = [];
                    isStepInProgress = true;
                }
            }

            // RESETEAR DETECTOR DE PICO
            
            if (magnitude < RESET_THRESHOLD) {
                isStepInProgress = false;
            }
        });

        sensor.addEventListener("error", (event) => {
            if (event.error.name === "NotAllowedError") {
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