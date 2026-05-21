const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

function setNavOpen(open) {
  if (!navToggle || !siteNav) return;
  navToggle.setAttribute("aria-expanded", String(open));
  siteNav.classList.toggle("is-open", open);
  document.body.classList.toggle("nav-open", open);
}

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const open = navToggle.getAttribute("aria-expanded") === "true";
    setNavOpen(!open);
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setNavOpen(false));
  });

  document.addEventListener("click", (e) => {
    if (
      siteNav.classList.contains("is-open") &&
      !siteNav.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      setNavOpen(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 640) setNavOpen(false);
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
