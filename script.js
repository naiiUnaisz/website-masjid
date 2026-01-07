// Ambil elemen body
const body = document.body;

// Daftar gambar (urut: pagi → siang → sore → malam)
const backgrounds = [
  'img/pagi.jpg',
  'img/siang1.jpg',
  'img/sore.jpg',
];

let index = 0;

// Fungsi untuk ganti background
function changeBackground() {
  body.style.backgroundImage = `url(${backgrounds[index]})`;
  index = (index + 1) % backgrounds.length; // biar muter terus
}

// Jalankan pertama kali
changeBackground();

// Ulang tiap 5 detik
setInterval(changeBackground, 5000);


//  === Prayer Times ===

// 1. Ambil elemen card shalat
const subuh = document.getElementById("subuh");
const syuruq = document.getElementById("syuruq");
const dzuhur = document.getElementById("dzuhur");
const asar = document.getElementById("asar");
const maghrib = document.getElementById("maghrib");
const isya = document.getElementById("isya");

// 2. Ambil data dari API Aladhan
async function getPrayerTimes() {
  const res = await fetch("https://api.aladhan.com/v1/timingsByCity?city=Jonggol&country=Indonesia&method=20&timezonestring=Asia/Jakarta");
  const data = await res.json();
  const t = data.data.timings;

  //  3. Isi ke halaman 
  subuh.textContent = t.Fajr;
  syuruq.textContent = t.Sunrise;
  dzuhur.textContent = t.Dhuhr;
  asar.textContent = t.Asr;
  maghrib.textContent = t.Maghrib;
  isya.textContent = t.Isha;

  return t;
}

let prayerTimes = {};
getPrayerTimes().then(t => prayerTimes = t);


// jam & tanggal real-time
const timeEl = document.getElementById("current-time");
const dateEl = document.getElementById("current-date");
 const hijriEl = document.getElementById("hijri-date");

function updateClock() {
  const now = new Date();
 
  const jam = String(now.getHours()).padStart(2, '0');
  const menit = String(now.getMinutes()).padStart(2, '0');
  const detik = String(now.getSeconds()).padStart(2, '0');

  const waktu = `${jam}:${menit}:${detik}`;

  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const tanggal = now.toLocaleDateString('id-ID', options);


  timeEl.textContent = waktu;
  dateEl.textContent = tanggal;
}

//   Tanggal Hijri
  function updateHijriDate() {
  const now = new Date();

  const hijri = new Intl.DateTimeFormat('id-ID-u-ca-islamic', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(now);

  hijriEl.textContent = hijri;
}


// update tiap detik
setInterval(updateClock, 1000); 
updateClock();
updateHijriDate();
setInterval(updateHijriDate, 1000 * 60 * 60);


// Hitung mundur menuju Ramadhan 2026

const ramadhanCountdown = document.getElementById("ramadhan-countdown");
const ramadhanDate = new Date("2026-03-10");

function updateRamadhanCountdown() {
  const now = new Date();
  const diff = ramadhanDate - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  ramadhanCountdown.textContent = `${days} `;
}

setInterval(updateRamadhanCountdown, 1000 * 60 * 60); // update setiap jam
updateRamadhanCountdown();


// Hitung mundur menuju shalat berikutnya

const nextPrayerCountdown = document.getElementById("next-prayer-countdown");

function formatTime(num) {
  return num.toString().padStart(2, '0');
}

const prayerNameID = {
  Fajr: "Subuh",
  Sunrise: "Syuruq",
  Dhuhr: "Dzuhur",
  Asr: "Asar",
  Maghrib: "Maghrib",
  Isha: "Isya"
};


function getNextPrayerCountdown() {
 
  if (!prayerTimes || !prayerTimes.Fajr) return;

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const nextPrayerName = document.getElementById("next-prayer-name");

  const prayerOrder = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

  const upcoming = prayerOrder.map(key => {
    const time = prayerTimes[key];
    if (!time) return null; 
    const [h, m] = time.split(":");
    const t = new Date(today);
    t.setHours(h, m, 0, 0);
    return { name: key, time: t };
  }).filter(Boolean); // hapus null

  const next = upcoming.find(p => p.time > now) || upcoming[0];
  const diff = next.time - now;

  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);

  nextPrayerCountdown.textContent = `${formatTime(h)}:${formatTime(m)}:${formatTime(s)}`;
  nextPrayerName.textContent = prayerNameID[next.name] || next.name;

  highlightActivePrayer(next.name);
}


function highlightActivePrayer(nextPrayer) {
  
  document.querySelectorAll(".prayer-card").forEach(card => {
    card.classList.remove("prayer-active");
  });

 
  const map = {
    Fajr: "card-subuh",
    Sunrise: "card-syuruq",
    Dhuhr: "card-dzuhur",
    Asr: "card-asar",
    Maghrib: "card-maghrib",
    Isha: "card-isya"
  };

  const activeCard = document.getElementById(map[nextPrayer]);
  if (activeCard) {
    activeCard.classList.add("prayer-active");
  }
}


setInterval(getNextPrayerCountdown, 1000);
