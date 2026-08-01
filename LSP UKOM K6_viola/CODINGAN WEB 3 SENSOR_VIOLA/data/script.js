// ================= Konfigurasi =================
const UPDATE_INTERVAL = 2000; // ambil data tiap 2 detik
const GAUGE_CIRCUMFERENCE = 283; // panjang path setengah lingkaran gauge

// ================= Ambil elemen =================
const tempValueEl = document.getElementById("tempValue");
const tempStatusEl = document.getElementById("tempStatus");
const gaugeTempEl = document.getElementById("gaugeTemp");

const humValueEl = document.getElementById("humValue");
const humStatusEl = document.getElementById("humStatus");
const gaugeHumEl = document.getElementById("gaugeHum");

const soilValueEl = document.getElementById("soilValue");
const soilStatusEl = document.getElementById("soilStatus");
const gaugeFillEl = document.getElementById("gaugeValue");
const pumpToggle = document.getElementById("pumpToggle");
const pumpIcon = document.getElementById("pumpIcon");
const pumpStatusText = document.getElementById("pumpStatusText");

const fanToggle = document.getElementById("fanToggle");
const fanIcon = document.getElementById("fanIcon");
const fanStatusText = document.getElementById("fanStatusText");

// ================= Update tampilan Suhu =================
function updateTemp(value) {
  const clamped = Math.max(0, Math.min(50, value));
  const offset = GAUGE_CIRCUMFERENCE - (GAUGE_CIRCUMFERENCE * clamped) / 50;
  gaugeTempEl.style.strokeDashoffset = offset;
  tempValueEl.textContent = value;

  if (value < 20) {
    gaugeTempEl.style.stroke = "#e8a06f";
    tempStatusEl.textContent = "Suhu rendah";
  } else if (value <= 32) {
    gaugeTempEl.style.stroke = "#f28fb0";
    tempStatusEl.textContent = "Suhu normal";
  } else {
    gaugeTempEl.style.stroke = "#c2478a";
    tempStatusEl.textContent = "Suhu tinggi";
  }
}

// ================= Update tampilan Kelembapan Udara =================
function updateHum(value) {
  const clamped = Math.max(0, Math.min(100, value));
  const offset = GAUGE_CIRCUMFERENCE - (GAUGE_CIRCUMFERENCE * clamped) / 100;
  gaugeHumEl.style.strokeDashoffset = offset;
  humValueEl.textContent = value;

  if (value < 40) {
    gaugeHumEl.style.stroke = "#e8a06f";
    humStatusEl.textContent = "Udara kering";
  } else if (value <= 70) {
    gaugeHumEl.style.stroke = "#f28fb0";
    humStatusEl.textContent = "Kelembapan udara normal";
  } else {
    gaugeHumEl.style.stroke = "#c2478a";
    humStatusEl.textContent = "Udara sangat lembap";
  }
}

// ================= Update tampilan gauge =================
function updateGauge(percent) {
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = GAUGE_CIRCUMFERENCE - (GAUGE_CIRCUMFERENCE * clamped) / 100;
  gaugeFillEl.style.strokeDashoffset = offset;

  soilValueEl.textContent = clamped;

  if (clamped < 30) {
    gaugeFillEl.style.stroke = "#e8a06f"; // tanah kering, peach soft
    soilStatusEl.textContent = "Tanah kering, perlu disiram";
  } else if (clamped < 70) {
    gaugeFillEl.style.stroke = "#f28fb0"; // pink soft, normal
    soilStatusEl.textContent = "Kelembapan tanah normal";
  } else {
    gaugeFillEl.style.stroke = "#c2478a"; // pink tua, basah
    soilStatusEl.textContent = "Tanah cukup basah";
  }
}

// ================= Ambil data dari ESP32 =================
async function fetchSoilData() {
  try {
    const res = await fetch("/data");
    if (!res.ok) throw new Error("Gagal mengambil data");
    const data = await res.json();
    updateTemp(data.temperature);
    updateHum(data.humidity);
    updateGauge(data.soil);
  } catch (err) {
    tempStatusEl.textContent = "Tidak dapat terhubung ke perangkat";
    humStatusEl.textContent = "Tidak dapat terhubung ke perangkat";
    soilStatusEl.textContent = "Tidak dapat terhubung ke perangkat";
    console.error(err);
  }
}

// ================= Kontrol pompa =================
async function setPump(state) {
  try {
    const res = await fetch(`/pump?state=${state ? 1 : 0}`);
    if (!res.ok) throw new Error("Gagal mengubah status pompa");

    pumpIcon.classList.toggle("active", state);
    pumpStatusText.textContent = state ? "ON" : "OFF";
  } catch (err) {
    console.error(err);
    // kembalikan toggle ke posisi sebelumnya jika gagal
    pumpToggle.checked = !state;
  }
}

pumpToggle.addEventListener("change", (e) => {
  setPump(e.target.checked);
});

// ================= Kontrol Kipas =================
async function setFan(state) {
  try {
    const res = await fetch(`/fan?state=${state ? 1 : 0}`);
    if (!res.ok) throw new Error("Gagal mengubah status kipas");

    fanIcon.classList.toggle("active", state);
    fanStatusText.textContent = state ? "ON" : "OFF";
  } catch (err) {
    console.error(err);
    // kembalikan toggle ke posisi sebelumnya jika gagal
    fanToggle.checked = !state;
  }
}

fanToggle.addEventListener("change", (e) => {
  setFan(e.target.checked);
});

// ================= Loop update otomatis =================
fetchSoilData();
setInterval(fetchSoilData, UPDATE_INTERVAL);
