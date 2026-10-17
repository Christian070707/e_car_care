// Clean Car District — gedeelde scripts
// Minimale, toegankelijke interacties: mobiel menu, scroll-animaties, gallerij-lightbox,
// afspraak-agenda.

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initScrollReveal();
  initGallery();
  initFooterYear();
  initBooking();
});

/* ---------- Mobiel navigatiemenu ---------- */
function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  const scrim = document.querySelector(".nav-scrim");
  if (!toggle || !nav) return;

  const closeNav = () => {
    nav.setAttribute("data-open", "false");
    if (scrim) scrim.setAttribute("data-open", "false");
    toggle.setAttribute("aria-expanded", "false");
  };

  const openNav = () => {
    nav.setAttribute("data-open", "true");
    if (scrim) scrim.setAttribute("data-open", "true");
    toggle.setAttribute("aria-expanded", "true");
  };

  toggle.addEventListener("click", () => {
    const isOpen = nav.getAttribute("data-open") === "true";
    isOpen ? closeNav() : openNav();
  });

  scrim?.addEventListener("click", closeNav);

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNav();
  });
}

/* ---------- Subtiele scroll-animatie (fade/slide-up) ---------- */
function initScrollReveal() {
  const targets = document.querySelectorAll(".fade-up");
  if (!targets.length) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ---------- Gallerij lightbox (toetsenbord- en screenreader-toegankelijk) ---------- */
function initGallery() {
  const items = document.querySelectorAll(".gallery-item");
  const lightbox = document.querySelector(".lightbox");
  if (!items.length || !lightbox) return;

  const titleEl = lightbox.querySelector(".lightbox-title");
  const descEl = lightbox.querySelector(".lightbox-desc");
  const closeBtn = lightbox.querySelector(".lightbox-close");
  let lastFocused = null;

  const openLightbox = (item) => {
    lastFocused = item;
    titleEl.textContent = item.dataset.title || "";
    descEl.textContent = item.dataset.desc || "";
    lightbox.setAttribute("data-open", "true");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  };

  const closeLightbox = () => {
    lightbox.setAttribute("data-open", "false");
    document.body.style.overflow = "";
    lastFocused?.focus();
  };

  items.forEach((item) => {
    item.addEventListener("click", () => openLightbox(item));
  });

  closeBtn.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.getAttribute("data-open") === "true") {
      closeLightbox();
    }
  });
}

/* ---------- Jaartal in footer ---------- */
function initFooterYear() {
  const el = document.querySelector("[data-year]");
  if (el) el.textContent = new Date().getFullYear();
}

/* ---------- Afspraak inplannen (agenda) ----------
   Testversie zonder verbinding: bezette tijden worden nagebootst door
   fetchBusy() en nieuwe afspraken door createBooking(). Voor Google Agenda
   hoeven alleen die twee functies vervangen te worden (freebusy-query en
   het aanmaken van een event, via een eigen backend). */
const BOOKING_CONFIG = {
  workdays: [1, 2, 3, 4, 5, 6], // ma t/m za (0 = zondag)
  dayStart: 9 * 60, // 09:00, in minuten
  dayEnd: 18 * 60, // 18:00
  slotStep: 60, // starttijden per uur
  bufferMinutes: 30, // reistijd tussen afspraken
  minDaysAhead: 1, // vroegst morgen
  maxDaysAhead: 60,
  packages: {
    basic: { name: "Basic Care", duration: 120, prices: { small: 79, medium: 89, large: 99, suv: 109 } },
    plus: { name: "Plus Care", duration: 180, prices: { small: 129, medium: 139, large: 149, suv: 159 } },
    premium: { name: "Premium Care", duration: 360, prices: { small: 249, medium: 279, large: 309, suv: 339 } },
  },
};

const DUMMY_STORAGE_KEY = "ccd-dummy-bookings";

function loadDummyBookings() {
  try {
    return JSON.parse(localStorage.getItem(DUMMY_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveDummyBooking(booking) {
  try {
    const list = loadDummyBookings();
    list.push(booking);
    localStorage.setItem(DUMMY_STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* opslag niet beschikbaar: afspraak blijft alleen in deze sessie */
  }
}

// Vaste, nagebootste bezetting per datum (zelfde datum = zelfde uitkomst).
function dummyBusyFor(dateKey) {
  let seed = 0;
  for (const ch of dateKey) seed = (seed * 31 + ch.charCodeAt(0)) % 100000;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const busy = [];
  const roll = rand();
  if (roll < 0.12) {
    busy.push({ start: BOOKING_CONFIG.dayStart, end: BOOKING_CONFIG.dayEnd }); // volgeboekt
  } else if (roll < 0.75) {
    const count = rand() < 0.5 ? 1 : 2;
    for (let i = 0; i < count; i++) {
      const start = BOOKING_CONFIG.dayStart + Math.floor(rand() * 8) * 60;
      busy.push({ start, end: start + (rand() < 0.5 ? 120 : 180) });
    }
  }
  return busy;
}

// TODO Google Agenda: vervang door een freebusy-aanroep voor [fromKey, toKey].
async function fetchBusy(fromKey, toKey) {
  const result = {};
  for (let d = parseDateKey(fromKey); toDateKey(d) <= toKey; d.setDate(d.getDate() + 1)) {
    result[toDateKey(d)] = dummyBusyFor(toDateKey(d));
  }
  loadDummyBookings().forEach((b) => {
    if (result[b.date]) result[b.date].push({ start: b.start, end: b.end });
  });
  return result;
}

// TODO Google Agenda: vervang door het aanmaken van een event via de backend.
async function createBooking(booking) {
  saveDummyBooking(booking);
  return { ok: true };
}

function toDateKey(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDateKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatTime(minutes) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

function freeSlots(busy, duration) {
  const { dayStart, dayEnd, slotStep, bufferMinutes } = BOOKING_CONFIG;
  const slots = [];
  for (let start = dayStart; start + duration <= dayEnd; start += slotStep) {
    const end = start + duration;
    const clash = busy.some((b) => start < b.end + bufferMinutes && b.start < end + bufferMinutes);
    if (!clash) slots.push(start);
  }
  return slots;
}

function initBooking() {
  const form = document.querySelector("[data-booking]");
  if (!form) return;

  const cfg = BOOKING_CONFIG;
  const grid = form.querySelector("[data-cal-grid]");
  const title = form.querySelector("[data-cal-title]");
  const prevBtn = form.querySelector("[data-cal-prev]");
  const nextBtn = form.querySelector("[data-cal-next]");
  const slotsEl = form.querySelector("[data-slots]");
  const slotsTitle = form.querySelector("[data-slots-title]");
  const errorEl = form.querySelector("[data-booking-error]");
  const doneEl = form.querySelector("[data-booking-done]");
  const sizeSelect = form.querySelector("#formaat");

  const monthFmt = new Intl.DateTimeFormat("nl-NL", { month: "long", year: "numeric" });
  const dayFmt = new Intl.DateTimeFormat("nl-NL", { weekday: "long", day: "numeric", month: "long" });
  const euro = (n) => `€${n}`;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + cfg.minDaysAhead);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + cfg.maxDaysAhead);

  const state = {
    month: new Date(minDate.getFullYear(), minDate.getMonth(), 1),
    busy: {},
    date: null,
    time: null,
  };

  const selectedPackage = () => form.querySelector('input[name="pakket"]:checked')?.value || null;
  const duration = () => cfg.packages[selectedPackage()]?.duration || cfg.packages.basic.duration;

  // Pakket voorselecteren via ?pakket=basic|plus|premium
  const preset = new URLSearchParams(location.search).get("pakket");
  const presetInput = preset && form.querySelector(`input[name="pakket"][value="${CSS.escape(preset)}"]`);
  if (presetInput) presetInput.checked = true;

  function updatePackageMeta() {
    const size = sizeSelect.value;
    Object.entries(cfg.packages).forEach(([key, pkg]) => {
      const el = form.querySelector(`[data-package-meta="${key}"]`);
      if (el) el.textContent = `${euro(pkg.prices[size])} · ± ${pkg.duration / 60} uur`;
    });
  }

  function updateSummary() {
    const pkg = cfg.packages[selectedPackage()];
    const set = (key, value) => (form.querySelector(`[data-sum="${key}"]`).textContent = value || "—");
    set("pakket", pkg?.name);
    set("prijs", pkg && `${euro(pkg.prices[sizeSelect.value])} (vanaf)`);
    set("datum", state.date && dayFmt.format(parseDateKey(state.date)));
    set("tijd", state.time != null && `${formatTime(state.time)} – ${formatTime(state.time + duration())}`);
  }

  function isBookableDay(date) {
    return date >= minDate && date <= maxDate && cfg.workdays.includes(date.getDay());
  }

  async function renderMonth() {
    const year = state.month.getFullYear();
    const month = state.month.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);

    title.textContent = monthFmt.format(first);
    prevBtn.disabled = first <= new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    nextBtn.disabled = last >= maxDate;

    state.busy = await fetchBusy(toDateKey(first), toDateKey(last));

    grid.innerHTML = "";
    const offset = (first.getDay() + 6) % 7; // maandag als eerste dag
    for (let i = 0; i < offset; i++) grid.appendChild(document.createElement("span"));

    for (let day = 1; day <= last.getDate(); day++) {
      const date = new Date(year, month, day);
      const key = toDateKey(date);
      const available = isBookableDay(date) && freeSlots(state.busy[key] || [], duration()).length > 0;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "calendar-day";
      btn.textContent = day;
      btn.dataset.date = key;
      btn.setAttribute("aria-label", `${dayFmt.format(date)}${available ? "" : ", niet beschikbaar"}`);
      if (date.getTime() === today.getTime()) btn.classList.add("is-today");
      if (available) {
        btn.classList.add("is-available");
        btn.setAttribute("aria-pressed", String(key === state.date));
        btn.addEventListener("click", () => selectDate(key));
      } else {
        btn.disabled = true;
      }
      grid.appendChild(btn);
    }
  }

  function renderSlots() {
    slotsEl.innerHTML = "";
    if (!state.date) {
      slotsTitle.textContent = "Kies eerst een datum";
      return;
    }
    slotsTitle.textContent = dayFmt.format(parseDateKey(state.date));
    const slots = freeSlots(state.busy[state.date] || [], duration());
    if (!slots.length) {
      slotsEl.innerHTML = '<p class="slots-empty">Geen vrije tijden voor dit pakket op deze dag.</p>';
      return;
    }
    slots.forEach((start) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "slot";
      btn.setAttribute("role", "radio");
      btn.setAttribute("aria-checked", String(start === state.time));
      btn.textContent = formatTime(start);
      btn.addEventListener("click", () => {
        state.time = start;
        slotsEl.querySelectorAll(".slot").forEach((s) => s.setAttribute("aria-checked", String(s === btn)));
        updateSummary();
      });
      slotsEl.appendChild(btn);
    });
  }

  function selectDate(key) {
    state.date = key;
    state.time = null;
    grid.querySelectorAll(".calendar-day.is-available").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.date === key));
    });
    renderSlots();
    updateSummary();
  }

  // Ander pakket = andere duur: controleer of de gekozen tijd nog past.
  async function refreshAvailability() {
    await renderMonth();
    if (state.date && !freeSlots(state.busy[state.date] || [], duration()).includes(state.time)) {
      state.time = null;
    }
    renderSlots();
    updateSummary();
  }

  form.querySelectorAll('input[name="pakket"]').forEach((input) => {
    input.addEventListener("change", refreshAvailability);
  });
  sizeSelect.addEventListener("change", () => {
    updatePackageMeta();
    updateSummary();
  });
  prevBtn.addEventListener("click", () => {
    state.month = new Date(state.month.getFullYear(), state.month.getMonth() - 1, 1);
    renderMonth();
  });
  nextBtn.addEventListener("click", () => {
    state.month = new Date(state.month.getFullYear(), state.month.getMonth() + 1, 1);
    renderMonth();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorEl.textContent = "";

    if (!selectedPackage()) return showError("Kies een pakket.");
    if (!state.date || state.time == null) return showError("Kies een datum en tijd.");
    const required = form.querySelectorAll(".booking-side [required]");
    const invalid = [...required].find((el) => !el.checkValidity());
    if (invalid) {
      invalid.focus();
      return showError("Vul alle verplichte gegevens correct in.");
    }

    const data = new FormData(form);
    const pkg = cfg.packages[selectedPackage()];
    const booking = {
      date: state.date,
      start: state.time,
      end: state.time + pkg.duration,
      pakket: selectedPackage(),
      formaat: sizeSelect.value,
      naam: data.get("naam"),
      telefoon: data.get("telefoon"),
      email: data.get("email"),
      adres: data.get("adres"),
      opmerking: data.get("opmerking"),
    };

    const result = await createBooking(booking);
    if (!result.ok) return showError("Er ging iets mis bij het inplannen. Probeer het later opnieuw.");

    form.querySelector("[data-done-text]").textContent =
      `${pkg.name} op ${dayFmt.format(parseDateKey(booking.date))} om ${formatTime(booking.start)} ` +
      `op ${booking.adres}. U ontvangt een bevestiging op ${booking.email}.`;
    form.classList.add("is-done");
    doneEl.hidden = false;
    doneEl.focus();
  });

  form.querySelector("[data-booking-reset]").addEventListener("click", () => {
    form.reset();
    state.date = null;
    state.time = null;
    doneEl.hidden = true;
    form.classList.remove("is-done");
    updatePackageMeta();
    refreshAvailability();
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  function showError(message) {
    errorEl.textContent = message;
  }

  updatePackageMeta();
  refreshAvailability();
}
