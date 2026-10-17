/* Fahd Abd El All — site CV (multi-pages)
   Le texte vient de content/fr.json et content/en.json.
   L'email est reconstruit ici (user + host) pour limiter la collecte par les robots.
   Easter eggs : appuyez sur « / », essayez le code Konami, cliquez 5 fois sur le logo. */

(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, reduced ? 0 : ms));
  const PAGE = document.body.dataset.page;
  const PAGES = [
    { id: "home", url: "index.html", cmd: ["accueil", "home"] },
    { id: "experience", url: "parcours.html", cmd: ["parcours", "experience"] },
    { id: "projects", url: "projets.html", cmd: ["projets", "projects"] },
    { id: "skills", url: "competences.html", cmd: ["competences", "compétences", "skills"] },
    { id: "contact", url: "contact.html", cmd: ["contact"] },
  ];
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };
  const LANGS = ["fr", "en", "ar"];
  const cache = {};
  let D, lang;

  function pickLang() {
    const q = new URLSearchParams(location.search).get("lang");
    if (LANGS.includes(q)) { store.set("lang", q); return q; }
    const saved = store.get("lang");
    if (LANGS.includes(saved)) return saved;
    const nav = (navigator.language || "fr").toLowerCase();
    return nav.startsWith("ar") ? "ar" : nav.startsWith("fr") ? "fr" : "en";
  }
  async function load(l) {
    if (!cache[l]) cache[l] = await (await fetch(`content/${l}.json`, { cache: "no-cache" })).json();
    return cache[l];
  }
  const email = () => `${D.contact.user}@${D.contact.host}`;
  const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  /* ======================= coquille commune ======================= */
  function shell() {
    const u = D.ui;
    $("#shell-top").innerHTML = `
      <div class="progress" aria-hidden="true"><span id="progress-bar"></span></div>
      <header class="bar">
        <a class="mark" id="mark" href="index.html" aria-label="Fahd Abd El All, ${esc(u.nav.home)}">
          <svg viewBox="0 0 40 40" aria-hidden="true"><rect x="1" y="1" width="38" height="38" rx="9"/><path d="M12 28V12h10M12 20h8M24 28l5-16 5 16M26 23h6"/></svg>
        </a>
        <nav class="nav" id="nav" aria-label="Pages">
          ${PAGES.map((p) => `<a href="${p.url}"${p.id === PAGE ? ' aria-current="page"' : ""}>${esc(u.nav[p.id])}</a>`).join("")}
        </nav>
        <div class="bar-actions">
          <button class="icon-btn" id="term-btn" type="button" aria-label="${esc(u.terminalHint)}" title="${esc(u.terminalHint)}">
            <span class="ib-glyph" aria-hidden="true">&gt;_</span><span class="ib-label">${esc(u.terminalBtn)}</span><kbd>/</kbd>
          </button>
          <div class="langs-switch" role="group" aria-label="${esc(u.langSwitch)}">
            ${LANGS.map((l) => `<button type="button" data-lang="${l}" lang="${l}" aria-pressed="${l === lang}" title="${esc(u.langs[l])}">${l === "ar" ? "ع" : l.toUpperCase()}</button>`).join("")}
          </div>
          <a class="btn btn-ink btn-sm" data-cv href="#" download>${esc(u.download)}</a>
          <button class="icon-btn menu-btn" id="menu-btn" type="button" aria-expanded="false" aria-controls="nav" aria-label="Menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          </button>
        </div>
      </header>`;

    const i = PAGES.findIndex((p) => p.id === PAGE);
    const next = i >= 0 && i < PAGES.length - 1 ? PAGES[i + 1] : null;
    $("#shell-bottom").innerHTML = `
      ${next ? `<div class="next-page"><a href="${next.url}"><div><span>${esc(u.next)}</span><strong>${esc(u.nav[next.id])}</strong></div>${arrow}</a></div>` : ""}
      <footer class="foot"><div class="foot-in">
        <span>${esc(D.footer)} ${new Date().getFullYear()}</span>
        <nav aria-label="Pages">${PAGES.map((p) => `<a href="${p.url}">${esc(u.nav[p.id])}</a>`).join("")}</nav>
        <span class="foot-hint">${esc(u.terminalHint).replace("/", "<kbd>/</kbd>")}</span>
      </div></footer>
      <div class="toast" id="toast" role="status"></div>
      <div class="palette" id="palette" aria-hidden="true">
        <div class="pal-box" role="dialog" aria-modal="true" aria-label="Terminal">
          <div class="pal-head"><span>fahd@paris:~ ${esc(D.palette.title)}</span><button type="button" id="pal-close" aria-label="Fermer">esc</button></div>
          <div class="pal-out" id="pal-out"></div>
          <form class="pal-in" id="pal-form"><span class="t-prompt" aria-hidden="true">$</span>
            <input id="pal-input" autocomplete="off" spellcheck="false" autocapitalize="off" aria-label="Commande" placeholder="${esc(D.palette.placeholder)}">
          </form>
        </div>
      </div>`;

    $(".skip").textContent = u.skip;
    $$("[data-cv]").forEach((a) => { a.href = D.hero.cv; });

    $$(".langs-switch button").forEach((b) => b.addEventListener("click", () => b.dataset.lang !== lang && setLang(b.dataset.lang)));
    $("#term-btn").addEventListener("click", () => openPalette());
    $("#menu-btn").addEventListener("click", (e) => {
      const open = $("#nav").classList.toggle("open");
      e.currentTarget.setAttribute("aria-expanded", open);
    });
    $("#mark").addEventListener("click", logoClick);
    $("#pal-close").addEventListener("click", closePalette);
    $("#palette").addEventListener("mousedown", (e) => { if (e.target.id === "palette") closePalette(); });
    $("#pal-form").addEventListener("submit", onCommand);
    $("#pal-input").addEventListener("keydown", onPaletteKey);
  }

  /* ======================= effets ======================= */
  // Texte qui se « décode » : caractères aléatoires qui se figent de gauche à droite
  function decode(el, text, delay = 0, dur = 700) {
    if (!el) return;
    el.setAttribute("aria-label", text);
    if (reduced) { el.textContent = text; return; }
    if (lang === "ar") {
      el.textContent = text;
      el.animate([{ opacity: 0, filter: "blur(8px)", transform: "translateY(.15em)" }, { opacity: 1, filter: "blur(0)", transform: "none" }],
        { duration: dur, delay, easing: "cubic-bezier(.2,.7,.1,1)", fill: "backwards" });
      return;
    }
    const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&$/<>{}";
    const chars = [...text];
    const solid = chars.filter((c) => c !== " ");
    const t0 = performance.now() + delay;
    el.innerHTML = chars.map((c) => (c === " " ? " " : `<span class="dc" aria-hidden="true">${esc(c)}</span>`)).join("");
    const spans = $$(".dc", el);
    spans.forEach((s) => (s.style.opacity = 0));
    const frame = (now) => {
      const p = (now - t0) / dur;
      let k = 0;
      chars.forEach((c, idx) => {
        if (c === " ") return;
        const s = spans[k++];
        const start = idx / chars.length * 0.6;
        if (p < start) return;
        s.style.opacity = 1;
        if (p >= start + 0.4) { s.textContent = c; s.classList.remove("scr"); }
        else { s.textContent = glyphs[(Math.random() * glyphs.length) | 0]; s.classList.add("scr"); }
      });
      if (p < 1.05) requestAnimationFrame(frame);
      else spans.forEach((s, j) => { s.textContent = solid[j]; s.classList.remove("scr"); s.style.opacity = 1; });
    };
    requestAnimationFrame(frame);
  }

  // Boutons « magnétiques » qui suivent légèrement le curseur
  function magnetic() {
    if (!fine || reduced) return;
    $$(".magnetic").forEach((b) => {
      if (b.dataset.mag) return;
      b.dataset.mag = 1;
      b.addEventListener("mousemove", (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      });
      b.addEventListener("mouseleave", () => (b.style.transform = ""));
    });
  }

  // Halo lumineux qui suit la souris sur les cartes
  function spotlight() {
    $$(".spot").forEach((el) => {
      if (el.dataset.spot) return;
      el.dataset.spot = 1;
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });
  }

  // Portrait : léger effet 3D + reflet
  function tilt() {
    const fig = $("#portrait"), card = $("#portrait-in");
    if (!fig || !fine || reduced || fig.dataset.tilt) return;
    fig.dataset.tilt = 1;
    fig.addEventListener("pointermove", (e) => {
      const r = fig.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.transform = `rotateY(${(x - 0.5) * 10}deg) rotateX(${(0.5 - y) * 10}deg)`;
      card.style.setProperty("--gx", `${x * 100}%`);
      card.style.setProperty("--gy", `${y * 100}%`);
    });
    fig.addEventListener("pointerleave", () => (card.style.transform = ""));
  }

  // Rôles qui se tapent et s'effacent en boucle
  let rotRun = 0;
  async function rotator(words) {
    const el = $("#rot");
    if (!el) return;
    const id = ++rotRun;
    el.textContent = "";
    if (reduced) { el.textContent = words.join(", "); return; }
    await sleep(900);
    for (let w = 0; id === rotRun; w = (w + 1) % words.length) {
      for (const ch of words[w]) { if (id !== rotRun) return; el.textContent += ch; await sleep(55); }
      await sleep(1700);
      while (el.textContent.length) { if (id !== rotRun) return; el.textContent = el.textContent.slice(0, -1); await sleep(24); }
      await sleep(250);
    }
  }

  let io;
  function observe() {
    io?.disconnect();
    io = new IntersectionObserver((es) => es.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    $$(".rv").forEach((el) => io.observe(el));
    onScroll();
  }
  function onScroll() {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    const bar = $("#progress-bar");
    if (bar) bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    $(".bar")?.classList.toggle("scrolled", y > 8);
    const tl = $("#timeline");
    if (tl) {
      const r = tl.getBoundingClientRect(), mark = innerHeight * 0.62;
      $("#tl-fill").style.transform = `scaleY(${Math.min(1, Math.max(0, (mark - r.top) / r.height))})`;
      $$(".tl-item", tl).forEach((it) => it.classList.toggle("lit", $(".tl-dot", it).getBoundingClientRect().top < mark));
    }
  }

  /* ======================= pages ======================= */
  const R = {
    home() {
      const h = D.hero, H = D.home;
      $("#prompt").innerHTML = `<span dir="ltr"><span class="p-user">fahd@paris</span>:~$ whoami</span>`;
      decode($("#name-first"), h.first, 60, 550);
      decode($("#name-last"), h.last, 220, 650);
      $("#tagline").textContent = h.tagline;
      rotator(h.roles);
      $("#pitch").textContent = h.pitch;
      $("#status").textContent = h.status;
      $("#badge").textContent = h.badge;
      $("#hero-mail").textContent = D.ui.emailMe;
      $("#home-title").textContent = H.title;
      $("#home-intro").textContent = H.intro;
      $("#pillars").innerHTML = H.pillars.map((p, i) => `
        <a class="pillar spot rv" href="${p.link}" style="--d:${i * 70}ms">
          <h3>${esc(p.verb)}</h3><p>${esc(p.text)}</p><span class="go">${esc(p.cta)} ${arrow}</span>
        </a>`).join("");
      $("#now-title").textContent = H.nowTitle;
      $("#now").textContent = H.now;
      $("#cta-title").textContent = H.ctaTitle;
      $("#cta").textContent = H.cta;
      $("#now-mail").textContent = D.ui.emailMe;
      tilt();
    },

    experience() {
      head(D.experienceTitle, D.experienceIntro);
      const tl = $("#timeline");
      $$(".tl-item", tl).forEach((n) => n.remove());
      tl.insertAdjacentHTML("beforeend", D.experience.map((e) => `
        <li class="tl-item rv">
          <span class="tl-dot" aria-hidden="true"></span>
          <p class="tl-when">${esc(e.period)}<small>${esc(e.location)}</small></p>
          <div><h2 class="tl-role">${esc(e.role)}</h2><p class="tl-co">${esc(e.company)}</p>
          <ul>${e.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div>
        </li>`).join(""));
      $("#edu-title").textContent = D.educationTitle;
      $("#edu-list").innerHTML = D.education.map((e) => `
        <li class="rv"><strong>${esc(e.school)}</strong><span class="yr">${esc(e.period)}</span><span>${esc(e.degree)}, ${esc(e.place)}</span></li>`).join("");
    },

    projects() {
      head(D.projectsTitle, D.projectsIntro);
      const s = D.scrapper, m = D.mailer;
      $("#sc-name").textContent = s.name;
      $("#sc-stack").textContent = s.stack;
      const L = D.projectLabels;
      const ctx = (o) => `
        <h3>${esc(L.need)}</h3><p>${esc(o.need)}</p>
        <h3>${esc(L.how)}</h3><ol>${o.how.map((h) => `<li>${esc(h)}</li>`).join("")}</ol>
        <h3>${esc(L.impact)}</h3><p>${esc(o.impact)}</p>`;
      $("#sc-ctx").innerHTML = ctx(s);
      $("#ml-ctx").innerHTML = ctx(m);
      $("#sc-note").textContent = D.ui.simulation;
      $("#sc-l-first").textContent = s.fields.first;
      $("#sc-l-last").textContent = s.fields.last;
      $("#sc-l-domain").textContent = s.fields.domain;
      if (!$("#sc-first").dataset.touched) {
        $("#sc-first").value = s.defaults.first;
        $("#sc-last").value = s.defaults.last;
        $("#sc-domain").value = s.defaults.domain;
      }
      $("#sc-run").textContent = s.run;
      if (!scBusy) $("#sc-results").innerHTML = "";
      $("#sc-api-l").textContent = s.statsApi;
      $("#sc-cache-l").textContent = s.statsCache;
      $("#sc-hint").textContent = s.hint;
      $("#ml-name").textContent = m.name;
      $("#ml-stack").textContent = m.stack;
      $("#ml-next").textContent = m.next;
      mailIdx = 0; renderMail(false);
      if (!R.projects.bound) {
        R.projects.bound = true;
        $("#sc-form").addEventListener("submit", runScrapper);
        ["#sc-first", "#sc-last", "#sc-domain"].forEach((q) => $(q).addEventListener("input", () => ($("#sc-first").dataset.touched = "1")));
        $("#ml-next").addEventListener("click", () => { mailIdx = (mailIdx + 1) % D.mailer.recipients.length; renderMail(true); });
      }
    },

    skills() {
      head(D.skillsTitle, D.skillsIntro);
      $("#skills-list").innerHTML = D.skills.map((g) => `
        <div class="rv"><h2>${esc(g.group)}</h2><ul>${g.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>`).join("");
      $("#lang-title").textContent = D.languagesTitle;
      $("#lang-list").innerHTML = D.languages.map((l) => `
        <li class="rv"><strong>${esc(l.name)}</strong><span class="lvl">${esc(l.level)}</span>
        <span class="dots" aria-hidden="true">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= l.value ? "on" : ""}" style="transition-delay:${i * 60}ms"></i>`).join("")}</span></li>`).join("");
      $("#int-title").textContent = D.interestsTitle;
      $("#int-list").textContent = D.interests.join(", ") + ".";
    },

    contact() {
      const c = D.contact, mail = email();
      head(c.title, D.contactIntro);
      $("#ct-mail").textContent = mail;
      $("#ct-mail").href = `mailto:${mail}`;
      $("#ct-write").href = `mailto:${mail}`;
      $("#ct-write").textContent = D.ui.emailMe;
      $("#ct-copy").textContent = D.ui.copy;
      $("#ct-text").textContent = c.text;
      $("#ct-loc").textContent = c.location;
      if (!R.contact.bound) {
        R.contact.bound = true;
        $("#ct-copy").addEventListener("click", async () => {
          try { await navigator.clipboard.writeText(email()); toast(D.ui.copied); } catch { toast(email()); }
        });
      }
    },

    404() {
      $("#nf-path").textContent = location.pathname;
      $("#nf-line").textContent = D.notFound.line;
      decode($("#nf-title"), D.notFound.title, 100, 600);
      $("#nf-back").textContent = D.notFound.back;
    },
  };

  function head(title, intro) {
    decode($("#page-title"), title, 80, 600);
    $("#page-intro").textContent = intro;
  }

  /* ---------- démo Mail Scrapper ---------- */
  const verified = new Map();
  let apiCredits = 0, cacheHits = 0, scBusy = false;
  const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9-]/g, "");
  const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  async function runScrapper(e) {
    e.preventDefault();
    if (scBusy) return;
    const s = D.scrapper;
    const f = norm($("#sc-first").value), l = norm($("#sc-last").value);
    const d = $("#sc-domain").value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/[^a-z0-9.-]/g, "");
    if (!f || !l || !d.includes(".")) return;
    scBusy = true; $("#sc-run").disabled = true;
    const list = [`${f}.${l}`, `${f[0]}.${l}`, `${f}${l}`, `${f[0]}${l}`, f, `${l}.${f}`, `${f}_${l}`]
      .filter((v, i, a) => a.indexOf(v) === i).map((x) => `${x}@${d}`);
    const winner = list[hash(d + f + l) % 3];
    const ul = $("#sc-results");
    ul.innerHTML = "";
    for (const addr of list) {
      const li = document.createElement("li");
      li.innerHTML = `<span class="sc-addr">${esc(addr)}</span><span class="sc-state"></span>`;
      ul.append(li);
      const st = $(".sc-state", li);
      let ok;
      if (verified.has(addr)) {
        ok = verified.get(addr);
        bump("#sc-cache", ++cacheHits);
        st.textContent = `${s.cached}: ${ok ? s.valid : s.invalid}`;
        st.className = "sc-state cache";
        await sleep(120);
      } else {
        st.innerHTML = `<span class="spin"></span>${esc(s.checking)}`;
        await sleep(420 + Math.random() * 300);
        ok = addr === winner;
        verified.set(addr, ok);
        bump("#sc-api", ++apiCredits);
        st.textContent = ok ? `✓ ${s.valid}` : s.invalid;
        st.className = `sc-state ${ok ? "ok" : "ko"}`;
      }
      if (ok) { li.classList.add("sc-li-ok"); break; }
    }
    scBusy = false; $("#sc-run").disabled = false;
  }
  function bump(sel, n) {
    const el = $(sel);
    el.textContent = n;
    if (!reduced) el.animate([{ transform: "scale(1.35)", color: "var(--brass)" }, { transform: "scale(1)" }], { duration: 400, easing: "ease-out" });
  }

  /* ---------- démo emailing ---------- */
  let mailIdx = 0;
  const fill = (tpl, rec, swap) => esc(tpl).replace(/\{([^}]+)\}/g, (_, k) =>
    rec[k] !== undefined ? `<mark class="var${swap ? " swap" : ""}">${esc(rec[k])}</mark>` : `{${k}}`);
  function renderMail(swap) {
    const m = D.mailer, r = m.recipients[mailIdx];
    $("#ml-count").textContent = `${mailIdx + 1} / ${m.recipients.length}`;
    $("#ml-subject").innerHTML = fill(m.subject, r, swap);
    $("#ml-body").innerHTML = fill(m.body, r, swap);
    $("#ml-attach").innerHTML = `<span>${fill(m.attachment, Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.replace(/\s+/g, "_")])), swap)}</span>`;
  }

  /* ======================= terminal caché ======================= */
  const hist = []; let hi = 0;
  function openPalette() {
    const p = $("#palette");
    p.classList.add("open"); p.setAttribute("aria-hidden", "false");
    if (!$("#pal-out").childElementCount) out(`<span class="t-dim">${esc(D.palette.welcome)}</span>`);
    setTimeout(() => $("#pal-input").focus(), 30);
  }
  function closePalette() {
    const p = $("#palette");
    p.classList.remove("open"); p.setAttribute("aria-hidden", "true");
    $("#pal-input").blur();
  }
  function out(html) {
    const o = $("#pal-out");
    const el = document.createElement("p");
    el.innerHTML = html;
    o.append(el);
    o.scrollTop = o.scrollHeight;
  }
  const allCmds = () => [...PAGES.flatMap((p) => p.cmd), "help", "cv", "email", "recette", "test-plan", "lang", "theme", "clear", "exit", "whoami", "ls", "sudo hire fahd"];
  function onPaletteKey(e) {
    const inp = e.currentTarget;
    if (e.key === "Escape") { e.preventDefault(); closePalette(); }
    else if (e.key === "ArrowUp" && hist.length) { e.preventDefault(); hi = Math.max(0, hi - 1); inp.value = hist[hi]; }
    else if (e.key === "ArrowDown" && hist.length) { e.preventDefault(); hi = Math.min(hist.length, hi + 1); inp.value = hist[hi] || ""; }
    else if (e.key === "Tab") {
      e.preventDefault();
      const v = inp.value.trim().toLowerCase();
      const m = allCmds().filter((c) => v && c.startsWith(v));
      if (m.length === 1) inp.value = m[0];
      else if (m.length > 1) out(`<span class="t-dim">${m.map(esc).join("   ")}</span>`);
    }
  }
  async function onCommand(e) {
    e.preventDefault();
    const inp = $("#pal-input"), raw = inp.value.trim();
    inp.value = "";
    if (!raw) return;
    hist.push(raw); hi = hist.length;
    out(`<span class="t-prompt">$</span> ${esc(raw)}`);
    const c = raw.toLowerCase().replace(/\s+/g, " "), P = D.palette;
    const page = PAGES.find((p) => p.cmd.includes(c.replace(/^cd /, "")));
    if (c === "help" || c === "aide" || c === "?") {
      P.help.forEach(([k, v]) => out(`<span class="t-cmdname">${esc(k)}</span><span class="t-dim">${esc(v)}</span>`));
    } else if (page) {
      out(`<span class="t-dim">${esc(P.going.replace("{page}", D.ui.nav[page.id]))}</span>`);
      await sleep(350); location.href = page.url;
    } else if (c === "cv") {
      const a = document.createElement("a"); a.href = D.hero.cv; a.download = ""; document.body.append(a); a.click(); a.remove();
      out(`<span class="t-ok">✓</span> ${esc(D.hero.cv.split("/").pop())}`);
    } else if (c === "email" || c === "mail") {
      location.href = `mailto:${email()}`;
    } else if (c === "sudo hire fahd" || c === "sudo hire") {
      out(`<span class="t-ok">✓</span> ${esc(P.hire)}`); confetti();
      await sleep(1100); location.href = `mailto:${email()}`;
    } else if (c.startsWith("sudo")) {
      out(`<span class="t-fail">${esc(P.sudo)}</span>`);
    } else if (c === "recette" || c === "test-plan") {
      for (const chk of D.terminal.checks) { out(`<span class="t-ok">[ ok ]</span> ${esc(chk)}`); await sleep(110); }
      out(`<span class="t-ok">✓</span> <strong>${esc(D.terminal.result.replace("{n}", D.terminal.checks.length))}</strong>`);
      out(`<span class="t-dim">  ${esc(D.terminal.ready)}</span>`);
    } else if (c === "whoami") {
      out(`${esc(D.hero.first)} ${esc(D.hero.last)} : ${esc(D.hero.roles.join(", "))}`);
    } else if (c === "ls") {
      out(PAGES.map((p) => `<span class="t-ok">${esc(p.url)}</span>`).join("   ") + `   <span class="t-prompt">${esc(D.hero.cv.split("/").pop())}</span>`);
    } else if (c === "lang") {
      closePalette(); setLang(LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length]);
    } else if (c === "theme") {
      toggleTheme(); out(`<span class="t-dim">${esc(P.theme)}</span>`);
    } else if (c === "clear" || c === "cls") {
      $("#pal-out").innerHTML = "";
    } else if (c === "exit" || c === "quit" || c === "q") {
      closePalette();
    } else {
      out(`<span class="t-fail">${esc(P.unknown.replace("{cmd}", raw))}</span>`);
    }
  }
  function toggleTheme() {
    const root = document.documentElement;
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    store.set("theme", root.dataset.theme);
  }

  /* ======================= easter eggs ======================= */
  const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let kIdx = 0;
  function onKey(e) {
    const typing = /input|textarea|select/i.test(e.target.tagName) || e.target.isContentEditable;
    if (!typing && (e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"))) { e.preventDefault(); openPalette(); return; }
    if (e.key === "Escape" && $("#palette")?.classList.contains("open")) closePalette();
    if (typing) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    kIdx = k === KONAMI[kIdx] ? kIdx + 1 : k === KONAMI[0] ? 1 : 0;
    if (kIdx === KONAMI.length) { kIdx = 0; confetti(); toast(D.palette.konami); }
  }

  let clicks = [], blueprint = false;
  function logoClick(e) {
    const now = Date.now();
    clicks = clicks.filter((t) => now - t < 1500).concat(now);
    if (clicks.length >= 5) {
      e.preventDefault(); clicks = [];
      blueprint = !blueprint;
      document.documentElement.classList.toggle("blueprint", blueprint);
      toast(blueprint ? D.palette.blueprintOn : D.palette.blueprintOff);
    } else if (PAGE === "home" || clicks.length > 1) e.preventDefault();
  }

  function confetti() {
    if (reduced) return;
    const c = document.createElement("canvas");
    c.className = "confetti"; c.width = innerWidth * devicePixelRatio; c.height = innerHeight * devicePixelRatio;
    c.style.width = "100%"; c.style.height = "100%";
    document.body.append(c);
    const g = c.getContext("2d"); g.scale(devicePixelRatio, devicePixelRatio);
    const cols = ["#b98d35", "#d9b66a", "#101c2e", "#e9edf1", "#3fb27a"];
    const ps = Array.from({ length: 140 }, () => ({
      x: innerWidth / 2, y: innerHeight * 0.35, vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 14 - 4,
      s: 5 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: cols[(Math.random() * cols.length) | 0],
    }));
    let t = 0;
    (function step() {
      g.clearRect(0, 0, innerWidth, innerHeight);
      ps.forEach((p) => {
        p.vy += 0.38; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c; g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); g.restore();
      });
      if (++t < 150) requestAnimationFrame(step); else c.remove();
    })();
  }

  function consoleHello() {
    console.log("%c ┌─┐┌─┐\n ├┤ ├─┤  Fahd Abd El All\n ┴  ┴ ┴", "font: 12px monospace; color: #b98d35");
    console.log(`%c${D.palette.console} ${email()}`, "font: 700 14px/1.6 sans-serif; color: #b98d35");
    console.log("%c/  terminal   |   ↑ ↑ ↓ ↓ ← → ← → B A", "font: 12px monospace; color: #7d8aa0");
  }

  /* ======================= utilitaires ======================= */
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove("show"), 2800);
  }

  function render() {
    document.documentElement.lang = D.lang;
    document.documentElement.dir = D.dir || "ltr";
    const meta = $('meta[name="description"]');
    if (PAGE === "home") { document.title = D.meta.title; meta.content = D.meta.description; }
    else if (PAGE === "404") document.title = `404 — ${D.hero.first} ${D.hero.last}`;
    else document.title = `${D.ui.nav[PAGE]} — ${D.hero.first} ${D.hero.last}`;
    shell();
    R[PAGE]?.();
    $$("main [data-cv]").forEach((a) => { a.href = D.hero.cv; a.textContent = D.ui.download; });
    observe();
    magnetic();
    spotlight();
  }

  async function setLang(l) {
    lang = l; store.set("lang", l);
    D = await load(l);
    render();
  }

  async function init() {
    D = await load((lang = pickLang()));
    render();
    addEventListener("scroll", () => requestAnimationFrame(onScroll), { passive: true });
    addEventListener("resize", onScroll);
    addEventListener("keydown", onKey);
    consoleHello();
  }

  init();
})();
