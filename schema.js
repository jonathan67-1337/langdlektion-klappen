/* Bokningsschema: läser tider.txt och visar en veckovy.
   Format per rad: 2026-12-12  10:00  30,45  ledig   (se instruktioner i tider.txt) */
(function () {
  var NAMES = { "30": "Teknikpass 30 min", "45": "Nybörjare 45 min", "60": "Grupp 60 min" };
  var weekEl = document.getElementById("week"), label = document.getElementById("wLabel");
  var prev = document.getElementById("prevW"), next = document.getElementById("nextW");
  var sel = document.getElementById("lektion"), allOpts = [].slice.call(sel.options).map(function (o) { return o.cloneNode(true); });
  var slots = [], weekStart, minWeek, maxWeek;

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function monday(d) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function weekNo(d) { var t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); var day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); var y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return Math.ceil(((t - y) / 864e5 + 1) / 7); }

  function parse(txt) {
    var out = [], demo = false;
    txt.split(/\r?\n/).forEach(function (raw) {
      var line = raw.trim();
      if (!line || line.charAt(0) === "#") return;
      if (/^EXEMPELTIDER$/i.test(line)) { demo = true; return; }
      var p = line.split(/\s+/);
      var m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(p[0] || ""), t = /^(\d{1,2})[:.](\d{2})$/.exec(p[1] || "");
      if (!m || !t) return;
      var types = (p[2] || "").split(",").map(function (s) { return s.trim(); }).filter(function (s) { return NAMES[s]; });
      if (!types.length) return;
      var status = (p[3] || "ledig").toLowerCase();
      var d = new Date(+m[1], +m[2] - 1, +m[3], +t[1], +t[2]);
      out.push({ date: d, day: iso(d), time: pad(+t[1]) + ":" + t[2], types: types, free: status.indexOf("ledig") === 0 && d > new Date() });
    });
    out.sort(function (a, b) { return a.date - b.date; });
    return { slots: out, demo: demo };
  }

  function render() {
    weekEl.innerHTML = "";
    var end = addDays(weekStart, 6);
    label.textContent = "Vecka " + weekNo(weekStart) + " · " + weekStart.toLocaleDateString("sv-SE", { day: "numeric", month: "short" }) + " – " + end.toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" });
    prev.disabled = weekStart <= minWeek; next.disabled = weekStart >= maxWeek;
    var mobile = window.matchMedia("(max-width:760px)").matches;
    for (var i = 0; i < 7; i++) {
      var d = addDays(weekStart, i), key = iso(d);
      var daySlots = slots.filter(function (s) { return s.day === key; });
      if (mobile && !daySlots.length) continue;
      var box = document.createElement("div"); box.className = "day";
      var h = document.createElement("h3"); h.textContent = d.toLocaleDateString("sv-SE", { weekday: "short", day: "numeric", month: "short" }); box.appendChild(h);
      var wrap = document.createElement("div"); wrap.className = "slots";
      if (!daySlots.length) { var n = document.createElement("span"); n.className = "none"; n.textContent = "Inga tider"; wrap.appendChild(n); }
      daySlots.forEach(function (s) {
        var b = document.createElement("button"); b.type = "button"; b.className = "slot" + (s.free ? "" : " off");
        b.innerHTML = s.time + "<small>" + s.types.map(function (t) { return t + " min"; }).join(" · ") + "</small>";
        if (!s.free) { b.disabled = true; b.setAttribute("aria-label", s.time + " ej tillgänglig"); }
        else { b.setAttribute("aria-label", "Välj " + d.toLocaleDateString("sv-SE", { weekday: "long", day: "numeric", month: "long" }) + " kl " + s.time); b.onclick = function () { choose(s, b); }; }
        wrap.appendChild(b);
      });
      box.appendChild(wrap); weekEl.appendChild(box);
    }
    if (mobile && !weekEl.children.length) weekEl.innerHTML = '<p class="none">Inga tider den här veckan.</p>';
  }

  function choose(s, btn) {
    [].forEach.call(document.querySelectorAll(".slot.sel"), function (x) { x.classList.remove("sel"); });
    btn.classList.add("sel");
    document.getElementById("datum").value = s.day;
    document.getElementById("tid").value = s.time;
    var cur = sel.value; sel.innerHTML = "";
    allOpts.forEach(function (o) { if (s.types.indexOf(o.value) > -1) sel.appendChild(o.cloneNode(true)); });
    if (s.types.indexOf(cur) > -1) sel.value = cur;
    var v = document.getElementById("valdTid"); v.hidden = false;
    v.textContent = "Vald tid: " + s.date.toLocaleDateString("sv-SE", { weekday: "long", day: "numeric", month: "long" }) + " kl " + s.time;
    document.getElementById("boka").scrollIntoView({ behavior: "smooth" });
  }

  prev.onclick = function () { weekStart = addDays(weekStart, -7); render(); };
  next.onclick = function () { weekStart = addDays(weekStart, 7); render(); };
  window.addEventListener("resize", function () { if (weekStart) render(); });

  fetch("tider.txt?v=" + Date.now()).then(function (r) { if (!r.ok) throw 0; return r.text(); }).then(function (txt) {
    var res = parse(txt); slots = res.slots;
    document.getElementById("exempeltider").hidden = !res.demo;
    var today = monday(new Date()), firstFree = slots.filter(function (s) { return s.free; })[0];
    minWeek = today;
    maxWeek = slots.length ? monday(slots[slots.length - 1].date) : today;
    if (maxWeek < today) maxWeek = today;
    weekStart = firstFree ? monday(firstFree.date) : today;
    render();
  }).catch(function () { label.textContent = "Kunde inte läsa tiderna – skicka en förfrågan i formuläret."; });
})();
