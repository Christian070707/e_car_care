// ELM Car Care — gedeelde scripts
// Minimale, toegankelijke interacties: mobiel menu, scroll-animaties, gallerij-lightbox.

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initScrollReveal();
  initGallery();
  initFooterYear();
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
