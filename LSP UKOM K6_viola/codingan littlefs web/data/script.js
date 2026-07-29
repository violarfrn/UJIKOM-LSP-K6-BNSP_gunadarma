// ================= Konfigurasi =================
const UPDATE_INTERVAL = 2000; // ambil data tiap 2 detik
const GAUGE_CIRCUMFERENCE = 283; // panjang path setengah lingkaran gauge

// ================= Ambil elemen =================
const soilValueEl = document.getElementById("soilValue");
const soilStatusEl = document.getElementById("soilStatus");
const gaugeFillEl = document.getElementById("gaugeValue");
const pumpToggle = document.getElementById("pumpToggle");
const pumpIcon = document.getElementById("pumpIcon");
const pumpStatusText = document.getElementById("pumpStatusText");

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
    updateGauge(data.soil);
  } catch (err) {
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

// ================= Loop update otomatis =================
fetchSoilData();
setInterval(fetchSoilData, UPDATE_INTERVAL);
