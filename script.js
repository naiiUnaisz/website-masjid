// ================== BACKGROUND ==================
const body = document.body;

const backgrounds = [
  'img/pagi.jpg',
  'img/siang1.jpg',
  'img/sore.jpg',
];

let index = 0;

function changeBackground() {
  body.style.backgroundImage = `url(${backgrounds[index]})`;
  index = (index + 1) % backgrounds.length;
}

changeBackground();
setInterval(changeBackground, 5000);


// ================== PRAYER ELEMENT ==================
const subuh = document.getElementById("subuh");
const syuruq = document.getElementById("syuruq");
const dzuhur = document.getElementById("dzuhur");
const asar = document.getElementById("asar");
const maghrib = document.getElementById("maghrib");
const isya = document.getElementById("isya");

let prayerTimes = {};


// ================== FETCH API ==================
async function getPrayerTimes() {
  try {
    const res = await fetch("https://api.aladhan.com/v1/timingsByCity?city=Jonggol&country=Indonesia&method=20&timezonestring=Asia/Jakarta");
    const data = await res.json();

    if (!data || !data.data) throw new Error("Data kosong");

    const t = data.data.timings;

    subuh.textContent = t.Fajr;
    syuruq.textContent = t.Sunrise;
    dzuhur.textContent = t.Dhuhr;
    asar.textContent = t.Asr;
    maghrib.textContent = t.Maghrib;
    isya.textContent = t.Isha;

    return t;

  } catch (err) {
    console.error("❌ Gagal ambil jadwal shalat:", err);

    // fallback biar tidak kosong
    return {
      Fajr: "04:30",
      Sunrise: "05:45",
      Dhuhr: "12:00",
      Asr: "15:15",
      Maghrib: "18:00",
      Isha: "19:15"
    };
  }
}

getPrayerTimes().then(t => {
  if (t) prayerTimes = t;
});


// ================== CLOCK ==================
const timeEl = document.getElementById("current-time");
const dateEl = document.getElementById("current-date");
const hijriEl = document.getElementById("hijri-date");

function updateClock() {
  const now = new Date();

  const jam = String(now.getHours()).padStart(2, '0');
  const menit = String(now.getMinutes()).padStart(2, '0');
  const detik = String(now.getSeconds()).padStart(2, '0');

  timeEl.textContent = `${jam}:${menit}:${detik}`;

  const tanggal = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  dateEl.textContent = tanggal;
}

function updateHijriDate() {
  const now = new Date();

  const hijri = new Intl.DateTimeFormat('id-ID-u-ca-islamic', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(now);

  hijriEl.textContent = hijri;
}

setInterval(updateClock, 1000);
updateClock();

updateHijriDate();
setInterval(updateHijriDate, 1000 * 60 * 60);


// ================== RAMADHAN ==================
const ramadhanCountdown = document.getElementById("ramadhan-countdown");

let ramadhanDate = new Date("2026-03-10");

function getNextRamadhan() {
  const now = new Date();

  if (now > ramadhanDate) {
    ramadhanDate = new Date("2027-02-28");
  }
}

function updateRamadhanCountdown() {
  getNextRamadhan();

  const now = new Date();
  const diff = ramadhanDate - now;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  ramadhanCountdown.textContent = days;
}

updateRamadhanCountdown();
setInterval(updateRamadhanCountdown, 1000 * 60 * 60);


// ================== NEXT PRAYER ==================
const nextPrayerCountdown = document.getElementById("next-prayer-countdown");
const nextPrayerName = document.getElementById("next-prayer-name");

const prayerNameID = {
  Fajr: "Subuh",
  Sunrise: "Syuruq",
  Dhuhr: "Dzuhur",
  Asr: "Asar",
  Maghrib: "Maghrib",
  Isha: "Isya"
};

function formatTime(num) {
  return num.toString().padStart(2, '0');
}

function getNextPrayerCountdown() {

  // ❗ proteksi biar ga error
  if (!prayerTimes || !prayerTimes.Fajr) return;

  const now = new Date();
  const today = new Date();

  const prayerOrder = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

  const upcoming = prayerOrder.map(key => {
    const time = prayerTimes[key];
    if (!time) return null;

    const [h, m] = time.split(":");

    const t = new Date(today);
    t.setHours(h, m, 0, 0);

    return { name: key, time: t };
  }).filter(Boolean);

  if (upcoming.length === 0) return;

  const next = upcoming.find(p => p.time > now) || upcoming[0];

  const diff = next.time - now;

  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);

  nextPrayerCountdown.textContent =
    `${formatTime(h)}:${formatTime(m)}:${formatTime(s)}`;

  nextPrayerName.textContent =
    `Waktu ${prayerNameID[next.name]}`;

  highlightActivePrayer(next.name);
}


// ================== HIGHLIGHT ==================
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