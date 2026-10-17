// Rendu du site à partir de content/fr.json et content/en.json.
// Pour modifier le contenu du site, éditez uniquement les fichiers JSON.

const SECTIONS = ["about", "experience", "projects", "education", "skills", "contact"];
const UI = {
  fr: { contact: "Me contacter", exp: "Voir mon parcours", other: "EN" },
  en: { contact: "Get in touch", exp: "See my experience", other: "FR" },
};

const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function getLang() {
  const fromUrl = new URLSearchParams(location.search).get("lang");
  if (fromUrl === "fr" || fromUrl === "en") return fromUrl;
  try { const saved = localStorage.getItem("lang"); if (saved) return saved; } catch (_) {}
  return navigator.language?.startsWith("fr") ? "fr" : "en";
}

async function render(lang) {
  const res = await fetch(`content/${lang}.json`);
  const d = await res.json();

  document.documentElement.lang = lang;
  document.title = d.meta.title;
  document.querySelector('meta[name="description"]').content = d.meta.description;

  $("#nav").innerHTML = SECTIONS.map((s) => `<a href="#${s}">${esc(d.nav[s])}</a>`).join("");
  document.querySelectorAll("[data-key]").forEach((el) => (el.textContent = d.nav[el.dataset.key]));

  const dl = $("#cv-download");
  dl.textContent = d.nav.download;
  dl.href = d.hero.cv;

  $("#hero-subtitle").textContent = d.hero.subtitle;
  $("#hero-name").textContent = d.hero.name;
  $("#hero-title").textContent = d.hero.title;
  $("#hero-pitch").textContent = d.hero.pitch;
  $("#cta-contact").textContent = UI[lang].contact;
  $("#cta-exp").textContent = UI[lang].exp;
  $("#lang-toggle").textContent = UI[lang].other;

  $("#experience-list").innerHTML = d.experience.map((e) => `
    <li class="reveal">
      <div class="t-period">${esc(e.period)}</div>
      <div class="t-body">
        <p class="t-role">${esc(e.role)}</p>
        <p class="t-company">${esc(e.company)} · ${esc(e.location)}</p>
        <ul>${e.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
      </div>
    </li>`).join("");

  $("#projects-list").innerHTML = d.projects.map((p) => `
    <article class="card reveal">
      <h3>${esc(p.name)}</h3>
      <p>${esc(p.description)}</p>
      <div class="tags">${p.stack.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
    </article>`).join("");

  $("#education-list").innerHTML = d.education.map((e) => `
    <li class="reveal">
      <div><strong>${esc(e.school)}</strong><span>${esc(e.degree)} — ${esc(e.place)}</span></div>
      <span>${esc(e.period)}</span>
    </li>`).join("");

  $("#skills-list").innerHTML = Object.entries(d.skills).map(([group, items]) => `
    <div class="reveal">
      <h3>${esc(group)}</h3>
      <div class="tags">${items.map((i) => `<span class="tag">${esc(i)}</span>`).join("")}</div>
    </div>`).join("");

  $("#languages-list").innerHTML = d.languages.map((l) =>
    `<div class="lang"><strong>${esc(l.name)}</strong><span>${esc(l.level)}</span></div>`).join("");

  const c = d.contact;
  $("#contact-headline").textContent = c.headline;
  $("#contact-text").textContent = c.text;
  const links = [`<a class="btn" href="mailto:${esc(c.email)}">${esc(c.email)}</a>`];
  if (c.linkedin) links.push(`<a class="btn btn-ghost" href="${esc(c.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>`);
  if (c.showPhone) links.push(`<a class="btn btn-ghost" href="tel:${esc(c.phone.replace(/\s/g, ""))}">${esc(c.phone)}</a>`);
  $("#contact-links").innerHTML = links.join("");

  observeReveal();
}

function observeReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
}

let lang = getLang();
$("#year").textContent = new Date().getFullYear();
$("#lang-toggle").addEventListener("click", () => {
  lang = lang === "fr" ? "en" : "fr";
  try { localStorage.setItem("lang", lang); } catch (_) {}
  render(lang);
});
render(lang);
