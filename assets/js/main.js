/* Fahd Abd El All — site CV
   Tout le texte vient de content/fr.json et content/en.json.
   L'adresse email est reconstruite ici (user + host) pour limiter
   la collecte automatique par les robots. Aucun numéro de téléphone. */

(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, reduced ? 0 : ms));
  const cache = {};
  let D, lang, termRun = 0;

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };

  function pickLang() {
    const q = new URLSearchParams(location.search).get("lang");
    if (q === "fr" || q === "en") return q;
    const saved = store.get("lang");
    if (saved === "fr" || saved === "en") return saved;
    return (navigator.language || "fr").toLowerCase().startsWith("fr") ? "fr" : "en";
  }

  async function load(l) {
    if (!cache[l]) cache[l] = await (await fetch(`content/${l}.json`, { cache: "no-cache" })).json();
    return cache[l];
  }

  const email = () => `${D.contact.user}@${D.contact.host}`;

  /* ---------------- render ---------------- */
  function render() {
    const u = D.ui;
    document.documentElement.lang = D.lang;
    document.title = D.meta.title;
    $('meta[name="description"]').content = D.meta.description;

    $("#nav").innerHTML = Object.entries(u.nav).map(([id, t]) => `<a href="#${id}">${esc(t)}</a>`).join("");
    $(".skip").textContent = u.skip;
    const lt = $("#lang-toggle");
    lt.textContent = u.langSwitchShort;
    lt.setAttribute("aria-label", u.langSwitch);

    for (const id of ["#cv-top", "#hero-cv", "#ct-cv"]) { $(id).href = D.hero.cv; $(id).textContent = u.download; }

    // hero : le nom se compose lettre par lettre
    splitName($("#name-first"), D.hero.first, 0);
    splitName($("#name-last"), D.hero.last, D.hero.first.length);
    $("#role").textContent = D.hero.role;
    $("#pitch").textContent = D.hero.pitch;
    $("#status").textContent = D.hero.status;
    $("#hero-mail").textContent = u.emailMe;
    $("#replay").textContent = u.replay;

    // parcours
    $("#exp-title").textContent = D.experienceTitle;
    $("#exp-intro").textContent = D.experienceIntro;
    const tl = $("#timeline");
    tl.querySelectorAll(".tl-item").forEach((n) => n.remove());
    tl.insertAdjacentHTML("beforeend", D.experience.map((e) => `
      <li class="tl-item rv">
        <span class="tl-dot" aria-hidden="true"></span>
        <p class="tl-when">${esc(e.period)}<small>${esc(e.location)}</small></p>
        <div>
          <h3 class="tl-role">${esc(e.role)}</h3>
          <p class="tl-co">${esc(e.company)}</p>
          <ul>${e.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
        </div>
      </li>`).join(""));

    // projets
    $("#proj-title").textContent = D.projectsTitle;
    $("#proj-intro").textContent = D.projectsIntro;
    const s = D.scrapper;
    $("#sc-name").textContent = s.name;
    $("#sc-stack").textContent = s.stack;
    $("#sc-desc").textContent = s.description;
    $("#sc-note").textContent = u.simulation;
    $("#sc-l-first").textContent = s.fields.first;
    $("#sc-l-last").textContent = s.fields.last;
    $("#sc-l-domain").textContent = s.fields.domain;
    if (!$("#sc-first").dataset.touched) {
      $("#sc-first").value = s.defaults.first;
      $("#sc-last").value = s.defaults.last;
      $("#sc-domain").value = s.defaults.domain;
    }
    $("#sc-run").textContent = s.run;
    $("#sc-api-l").textContent = s.statsApi;
    $("#sc-cache-l").textContent = s.statsCache;
    $("#sc-hint").textContent = s.hint;

    const m = D.mailer;
    $("#ml-name").textContent = m.name;
    $("#ml-stack").textContent = m.stack;
    $("#ml-desc").textContent = m.description;
    $("#ml-next").textContent = m.next;
    mailIdx = 0; renderMail(false);

    // compétences, formation, langues
    $("#skills-title").textContent = D.skillsTitle;
    $("#skills-list").innerHTML = D.skills.map((g) => `
      <div class="rv"><h3>${esc(g.group)}</h3><ul>${g.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>`).join("");
    $("#edu-title").textContent = D.educationTitle;
    $("#edu-list").innerHTML = D.education.map((e) => `
      <li><strong>${esc(e.school)}</strong><span class="yr">${esc(e.period)}</span><span>${esc(e.degree)}, ${esc(e.place)}</span></li>`).join("");
    $("#lang-title").textContent = D.languagesTitle;
    $("#lang-list").innerHTML = D.languages.map((l) => `
      <li><strong>${esc(l.name)}</strong><span class="lvl">${esc(l.level)}</span>
      <span class="dots" aria-hidden="true">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= l.value ? "on" : ""}"></i>`).join("")}</span></li>`).join("");
    $("#int-title").textContent = D.interestsTitle;
    $("#int-list").textContent = D.interests.join(", ") + ".";

    // contact : email uniquement
    const c = D.contact, mail = email();
    $("#ct-title").textContent = c.title;
    $("#ct-text").textContent = c.text;
    $("#ct-mail").textContent = mail;
    $("#ct-mail").href = `mailto:${mail}`;
    $("#ct-write").href = `mailto:${mail}`;
    $("#hero-mail").href = `mailto:${mail}`;
    $("#ct-write").textContent = u.emailMe;
    $("#ct-copy").textContent = u.copy;
    $("#ct-loc").textContent = c.location;
    $("#foot").textContent = D.footer;
    $("#year").textContent = new Date().getFullYear();

    observe();
    startTerminalWhenVisible();
  }

  function splitName(el, text, offset) {
    el.setAttribute("aria-label", text);
    el.innerHTML = [...text].map((ch, i) =>
      ch === " " ? " " : `<span class="ch" aria-hidden="true" style="animation-delay:${(offset + i) * 45}ms">${esc(ch)}</span>`).join("");
  }

  /* ---------------- terminal : la recette du profil ---------------- */
  let termStarted = false;
  function startTerminalWhenVisible() {
    if (termStarted) return runTerminal(); // changement de langue : on rejoue
    const t = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { t.disconnect(); termStarted = true; runTerminal(); }
    }, { threshold: 0.35 });
    t.observe($(".term"));
  }

  async function runTerminal() {
    const id = ++termRun;
    const T = D.terminal, box = $("#term"), portrait = $("#portrait");
    const alive = () => id === termRun;
    box.innerHTML = "";
    portrait.classList.remove("on");
    $("#replay").classList.remove("show");

    const line = (html, cls = "") => {
      const p = document.createElement("p");
      p.className = `t-line ${cls}`;
      p.innerHTML = html;
      box.append(p);
      return p;
    };
    const cursor = '<span class="cursor"></span>';

    // la commande se tape
    const cmdLine = line(`<span class="t-prompt">$</span> <span class="t-cmd"></span>${cursor}`);
    const cmd = $(".t-cmd", cmdLine);
    await sleep(500);
    for (const ch of T.command) {
      if (!alive()) return;
      cmd.textContent += ch;
      await sleep(28 + Math.random() * 40);
    }
    $(".cursor", cmdLine)?.remove();
    await sleep(250);

    const loading = line(`<span class="t-dim">${esc(T.loading)}</span>`);
    for (let i = 0; i < 3; i++) { await sleep(180); if (!alive()) return; loading.firstChild.textContent += "."; }
    await sleep(200);

    for (const check of T.checks) {
      if (!alive()) return;
      const p = line(`<span class="t-dim">[ .. ]</span> ${esc(check)}`);
      await sleep(170 + Math.random() * 160);
      p.firstChild.outerHTML = '<span class="t-ok">[ ok ]</span>';
    }
    await sleep(260);
    if (!alive()) return;
    line(`<span class="t-ok">✓</span> ${esc(T.result.replace("{n}", T.checks.length))}`, "t-res");
    line(`  ${esc(T.ready)}`, "t-dim");
    await sleep(380);
    if (!alive()) return;
    const last = line(`<span class="t-prompt">$</span> <span class="t-cmd"></span>${cursor}`);
    const c2 = $(".t-cmd", last);
    for (const ch of "open portrait.jpg") { if (!alive()) return; c2.textContent += ch; await sleep(35); }
    await sleep(200);
    portrait.classList.add("on");
    $("#replay").classList.add("show");
  }

  /* ---------------- démo Mail Scrapper ---------------- */
  const verified = new Map(); // adresse -> valide ?
  let apiCredits = 0, cacheHits = 0, scBusy = false;
  const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9-]/g, "");
  const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

  function candidates(f, l, d) {
    return [`${f}.${l}`, `${f[0]}.${l}`, `${f}${l}`, `${f[0]}${l}`, `${f}`, `${l}.${f}`, `${f}_${l}`]
      .filter((v, i, a) => v && a.indexOf(v) === i).map((x) => `${x}@${d}`);
  }

  async function runScrapper(e) {
    e.preventDefault();
    if (scBusy) return;
    const s = D.scrapper;
    const f = norm($("#sc-first").value), l = norm($("#sc-last").value);
    const d = $("#sc-domain").value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/[^a-z0-9.-]/g, "");
    if (!f || !l || !d.includes(".")) return;
    scBusy = true; $("#sc-run").disabled = true;
    const list = candidates(f, l, d);
    const winner = list[hash(d + f + l) % Math.min(3, list.length)]; // un seul format retenu par entreprise
    const ul = $("#sc-results");
    ul.innerHTML = "";
    let found = false;
    for (const addr of list) {
      if (found) break; // l'outil s'arrête au premier format valide : moins de crédits consommés
      const li = document.createElement("li");
      li.innerHTML = `<span class="sc-addr">${esc(addr)}</span><span class="sc-state"></span>`;
      ul.append(li);
      const st = $(".sc-state", li);
      let ok;
      if (verified.has(addr)) {
        ok = verified.get(addr);
        cacheHits++; bump("#sc-cache", cacheHits);
        st.textContent = `${s.cached}: ${ok ? s.valid : s.invalid}`;
        st.className = "sc-state cache";
        await sleep(120);
      } else {
        st.innerHTML = `<span class="spin"></span>${esc(s.checking)}`;
        await sleep(420 + Math.random() * 300);
        ok = addr === winner;
        verified.set(addr, ok);
        apiCredits++; bump("#sc-api", apiCredits);
        st.textContent = ok ? `✓ ${s.valid}` : s.invalid;
        st.className = `sc-state ${ok ? "ok" : "ko"}`;
      }
      if (ok) { li.classList.add("sc-li-ok"); found = true; }
    }
    scBusy = false; $("#sc-run").disabled = false;
  }

  function bump(sel, n) {
    const el = $(sel);
    el.textContent = n;
    if (!reduced) el.animate([{ transform: "scale(1.35)", color: "var(--brass)" }, { transform: "scale(1)" }], { duration: 400, easing: "ease-out" });
  }

  /* ---------------- démo emailing ---------------- */
  let mailIdx = 0;
  function fill(tpl, rec, swap) {
    return esc(tpl).replace(/\{([^}]+)\}/g, (_, k) =>
      rec[k] !== undefined ? `<mark class="var${swap ? " swap" : ""}">${esc(rec[k])}</mark>` : `{${k}}`);
  }
  function renderMail(swap) {
    const m = D.mailer, r = m.recipients[mailIdx];
    $("#ml-count").textContent = `${mailIdx + 1} / ${m.recipients.length}`;
    $("#ml-subject").innerHTML = fill(m.subject, r, swap);
    $("#ml-body").innerHTML = fill(m.body, r, swap);
    $("#ml-attach").innerHTML = "<span>" + fill(m.attachment, Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.replace(/\s+/g, "_")])), swap) + "</span>";
  }

  /* ---------------- scroll : progression, timeline, apparitions ---------------- */
  let io;
  function observe() {
    io?.disconnect();
    io = new IntersectionObserver((es) => es.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll(".rv").forEach((el) => io.observe(el));
    onScroll();
  }

  const sections = ["experience", "projects", "skills", "contact"];
  function onScroll() {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    $("#progress-bar").style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    $(".bar").classList.toggle("scrolled", y > 8);

    // la ligne du parcours se remplit au fil du défilement
    const tl = $("#timeline"), r = tl.getBoundingClientRect();
    const mark = innerHeight * 0.6;
    const p = Math.min(1, Math.max(0, (mark - r.top) / r.height));
    $("#tl-fill").style.transform = `scaleY(${p})`;
    tl.querySelectorAll(".tl-item").forEach((it) => {
      const d = $(".tl-dot", it).getBoundingClientRect();
      it.classList.toggle("lit", d.top < mark);
    });

    // section active dans le menu
    let cur = "";
    for (const id of sections) { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < innerHeight * 0.4) cur = id; }
    document.querySelectorAll("#nav a").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${cur}`));
  }

  /* ---------------- interactions ---------------- */
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove("show"), 2200);
  }

  async function setLang(l) {
    lang = l;
    store.set("lang", l);
    D = await load(l);
    render();
  }

  async function init() {
    D = await load((lang = pickLang()));
    render();
    addEventListener("scroll", () => requestAnimationFrame(onScroll), { passive: true });
    addEventListener("resize", onScroll);
    $("#lang-toggle").addEventListener("click", () => setLang(lang === "fr" ? "en" : "fr"));
    $("#replay").addEventListener("click", runTerminal);
    $("#sc-form").addEventListener("submit", runScrapper);
    ["#sc-first", "#sc-last", "#sc-domain"].forEach((s) => $(s).addEventListener("input", () => ($("#sc-first").dataset.touched = "1")));
    $("#ml-next").addEventListener("click", () => { mailIdx = (mailIdx + 1) % D.mailer.recipients.length; renderMail(true); });
    $("#ct-copy").addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(email()); toast(D.ui.copied); }
      catch { toast(email()); }
    });
  }

  init();
})();
