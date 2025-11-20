# Podometer App

A simple step counter web application that uses the **LinearAccelerationSensor API** to detect user steps in real time.  
The app also allows users to create **custom step-by-step goals** and visually mark goals as completed.

---

## 🚶 Features

### ✅ Real-time Step Detection  
- Uses the device’s **accelerometer** through the `LinearAccelerationSensor`.  
- Dynamically calculates thresholds to detect steps more accurately.  
- Works on mobile devices that support motion sensors.

### 🎯 Objectives System  
- Create custom step goals.  
- Each objective shows:
  - Steps at the moment it was created.
  - The goal target.
  - Live updates as you keep walking.
- Objectives automatically switch to **DONE** when completed.  
- Delete individual objectives or clear them all.

### 📱 Responsive Design  
- Fully optimized for mobile, tablet, and desktop.
- Uses CSS media queries for adaptive layout scaling.

---

## 🛠 Technologies Used

- **HTML5**
- **CSS3**
- **JavaScript (Vanilla)**
- **Generic Sensor API** (`LinearAccelerationSensor`)

---

## 📡 Requirements for Step Detection

To detect steps, the device must:

- Support the **LinearAccelerationSensor API**.
- Allow motion sensor permissions.
- Use **Chrome for Android** or any browser supporting Generic Sensors.
- Work over:
  - HTTPS
---

## 🚀 How to Run Locally

1. Clone the repository:

```bash
git clone https://github.com/nicoars1/Podometer-app
cd podometer
```
```
## 📂 Project Structure
/podometer
│── index.html
│── style.css
│── script.js          # Handles step detection
│── objetives.js       # Handles objective creation & updating
└── README.md
```

## 💡 Notes
Step detection works best on physical mobile devices.
Not all laptops support motion sensors.
The app runs fully client-side (no backend required).

## 📜 License
This project is open-source and available under the MIT License.
