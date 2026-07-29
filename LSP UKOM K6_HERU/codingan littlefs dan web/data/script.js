// Ambil data kelembaban tanah dari ESP32 tiap 2 detik
function ambilData() {
  fetch("/data")
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      document.getElementById("tanah").innerText = data.soil;
      document.getElementById("status").innerText = "Terhubung ke alat";
    })
    .catch(function (error) {
      document.getElementById("status").innerText = "Gagal terhubung ke alat";
      console.log(error);
    });
}

// Kontrol Pompa
function pumpOn() {
  fetch("/pump?state=1")
    .then(function () {
      document.getElementById("statusPump").innerText = "ON";
    });
}

function pumpOff() {
  fetch("/pump?state=0")
    .then(function () {
      document.getElementById("statusPump").innerText = "OFF";
    });
}

// Panggil pertama kali
ambilData();

// Ulangi tiap 2 detik
setInterval(ambilData, 2000);
