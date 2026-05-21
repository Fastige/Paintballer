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
