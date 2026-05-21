const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const open = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!open));
    siteNav.classList.toggle("is-open", !open);
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("is-open");
    });
  });
}

const joinForm = document.getElementById("join-form");
const formNote = document.getElementById("form-note");

if (joinForm && formNote) {
  joinForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = new FormData(joinForm).get("email");
    formNote.textContent = `You're on the list, ${email}! We'll be in touch before launch.`;
    joinForm.reset();
  });
}

const fieldSearch = document.getElementById("field-search");
const fieldList = document.getElementById("field-list");
const mapperResults = document.getElementById("mapper-results");
const mapperEmpty = document.getElementById("mapper-empty");
const filterChips = document.querySelectorAll(".filter-chip");
const fieldCards = fieldList ? [...fieldList.querySelectorAll(".field-card")] : [];

let activeFilter = "all";

function applyFieldFilters() {
  if (!fieldCards.length) return;

  const query = (fieldSearch?.value || "").trim().toLowerCase();
  let visible = 0;

  fieldCards.forEach((card) => {
    const name = card.dataset.name?.toLowerCase() || "";
    const city = card.dataset.city?.toLowerCase() || "";
    const type = card.dataset.type?.toLowerCase() || "";
    const matchesSearch = !query || name.includes(query) || city.includes(query);
    const matchesFilter = activeFilter === "all" || type.includes(activeFilter);
    const show = matchesSearch && matchesFilter;

    card.classList.toggle("is-hidden", !show);
    if (show) visible += 1;
  });

  if (mapperResults) {
    mapperResults.textContent =
      visible === fieldCards.length
        ? `Showing all ${fieldCards.length} fields`
        : `Showing ${visible} of ${fieldCards.length} fields`;
  }

  if (mapperEmpty) mapperEmpty.hidden = visible > 0;
}

if (fieldSearch && fieldCards.length) {
  fieldSearch.addEventListener("input", applyFieldFilters);

  filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      filterChips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      activeFilter = chip.dataset.filter || "all";
      applyFieldFilters();
    });
  });

  applyFieldFilters();
}
