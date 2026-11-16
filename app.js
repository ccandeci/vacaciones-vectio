import { REPO, RAMA, PERSONAS } from "./config.js";
import { MN, MS, DOW, DOW_L, key, dow, isWk, addDays, daysInMonth, expand, runs, fmt } from "./js/fechas.js";
import { holidays } from "./js/feriados.js";
import { ics, eventosVacaciones, eventosFeriados } from "./js/ics.js";

const $ = id => document.getElementById(id);
const hoy = new Date();
const TODAY = key(hoy.getFullYear(), hoy.getMonth() + 1, hoy.getDate());
let YEAR = hoy.getFullYear();
let me = PERSONAS[PERSONAS.length - 1].id;
try { const s = localStorage.getItem("vac-me"); if (PERSONAS.some(p => p.id === s)) me = s; } catch (e) {}

let data = {};      // id -> [{desde,hasta,nota}] tal como está en GitHub
let draft = {};     // id -> borrador de la persona
let extras = [];
let loadError = false;
const H = y => holidays(y, extras);
const nombre = id => PERSONAS.find(p => p.id === id).nombre;
const clone = x => JSON.parse(JSON.stringify(x));
const sorted = a => a.slice().sort((x, y) => x.desde.localeCompare(y.desde) || x.hasta.localeCompare(y.hasta));

async function cargar() {
  const q = "?v=" + Date.now();
  await Promise.all(PERSONAS.map(async p => {
    try {
      const r = await fetch(`data/${p.id}.json${q}`); if (!r.ok) throw 0;
      data[p.id] = sorted((await r.json()).vacaciones || []);
    } catch (e) { data[p.id] = []; loadError = true; }
  }));
  try { const r = await fetch("data/extras.json" + q); if (r.ok) extras = (await r.json()).feriados || []; } catch (e) {}
  PERSONAS.forEach(p => draft[p.id] = clone(data[p.id]));
  const b = $("banner");
  if (loadError) { b.hidden = false; b.textContent = "No pude leer los archivos de data/. Si abriste index.html con doble clic, probá desde la dirección publicada en GitHub Pages."; }
  else if (REPO.startsWith("TU-USUARIO")) { b.hidden = false; b.textContent = "Falta configurar REPO en config.js con tu usuario y el nombre del repositorio."; }
}

// ---------- Calendario ----------
function diasPorPersona() {
  const m = {};
  PERSONAS.forEach(p => data[p.id].forEach(r => expand(r.desde, r.hasta).forEach(k => (m[k] = m[k] || new Set()).add(p.id))));
  return m;
}
function renderCal() {
  const D = diasPorPersona(), HY = H(YEAR);
  $("yr").textContent = YEAR;
  $("legend").innerHTML = PERSONAS.map(p => `<span style="--c:var(--${p.id})"><i></i>${p.nombre}</span>`).join("") +
    `<span><i class="o"></i>Coinciden dos o más</span><span><i class="h"></i>Feriado (AR Argentina, ES España)</span>`;

  $("people").innerHTML = PERSONAS.map(p => {
    const rs = data[p.id].filter(r => r.desde.slice(0, 4) <= YEAR && r.hasta.slice(0, 4) >= YEAR);
    return `<article class="card pc" style="--c:var(--${p.id})"><h3><i></i>${p.nombre}</h3>` +
      (rs.length ? `<ul>${rs.map(r => `<li>${fmt([r.desde, r.hasta])}${r.nota ? ` <small>· ${esc(r.nota)}</small>` : ""}</li>`).join("")}</ul>`
        : `<div class="none">Sin vacaciones cargadas en ${YEAR}.</div>`) + `</article>`;
  }).join("");

  const grupos = {};
  Object.keys(D).forEach(k => { if (k.slice(0, 4) !== "" + YEAR || D[k].size < 2) return;
    const g = PERSONAS.filter(p => D[k].has(p.id)).map(p => p.nombre).join(" + "); (grupos[g] = grupos[g] || []).push(k); });
  const ov = $("overlap"), gs = Object.keys(grupos);
  ov.hidden = !gs.length;
  ov.innerHTML = gs.length ? `<h2>Días en que coinciden</h2><ul>${gs.map(g => `<li><b>${g}</b>: ${runs(grupos[g]).map(r => fmt(r)).join(", ")}</li>`).join("")}</ul>` : "";

  let out = "";
  for (let m = 1; m <= 12; m++) {
    let h = DOW.map(d => `<div class="dow">${d}</div>`).join("") + '<div class="d empty"></div>'.repeat(dow(key(YEAR, m, 1)));
    for (let d = 1; d <= daysInMonth(YEAR, m); d++) {
      const k = key(YEAR, m, d), w = isWk(k), who = w ? [] : PERSONAS.filter(p => D[k] && D[k].has(p.id)), hs = HY[k] || [];
      const flags = [...new Set(hs.map(x => x.c))].join(" ");
      const tip = hs.map(x => `${x.c}: ${x.n}`).concat(who.map(p => `${p.nombre} de vacaciones`)).join(" · ");
      h += `<div class="d${w ? " we" : ""}${hs.length ? " hol" : ""}${k === TODAY ? " today" : ""}${who.length > 1 ? " multi" : ""}" title="${esc(tip)}">${d}` +
        (flags ? `<span class="fl">${flags}</span>` : "") + `<span class="bars">${who.map(p => `<b style="--c:var(--${p.id})"></b>`).join("")}</span></div>`;
    }
    out += `<div class="card month"><h3>${MN[m - 1]}</h3><div class="grid">${h}</div></div>`;
  }
  $("months").innerHTML = out;
  $("holtitle").textContent = "Feriados " + YEAR;
  $("hols").innerHTML = [["AR", "Argentina"], ["ES", "España"]].map(([c, n]) => {
    const li = Object.keys(HY).sort().flatMap(k => HY[k].filter(x => x.c === c).map(x => { const p = k.split("-");
      return `<li><span>${DOW_L[dow(k)]} ${+p[2]} ${MS[p[1] - 1]}</span><span>${esc(x.n)}</span></li>`; }));
    return `<div><h3>${n}</h3><ul>${li.join("")}</ul></div>`;
  }).join("");
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// ---------- Cargar ----------
function jsonDe(id) {
  const filas = sorted(draft[id]).map(r => `    { "desde": "${r.desde}", "hasta": "${r.hasta}", "nota": ${JSON.stringify(r.nota || "")} }`);
  return `{\n  "nombre": ${JSON.stringify(nombre(id))},\n  "vacaciones": [${filas.length ? "\n" + filas.join(",\n") + "\n  " : ""}]\n}\n`;
}
function renderCargar() {
  $("picker").innerHTML = PERSONAS.map(p => `<button type="button" class="chip" style="--c:var(--${p.id})" data-p="${p.id}" aria-pressed="${me === p.id}"><i></i>${p.nombre}</button>`).join("");
  $("add").style.setProperty("--pc", `var(--${me})`);
  $("minetitle").textContent = `Lista de ${nombre(me)}`;
  const l = sorted(draft[me]);
  $("mine").innerHTML = l.length ? l.map((r, i) => `<li><span>${fmt([r.desde, r.hasta])}${r.nota ? ` · ${esc(r.nota)}` : ""}</span><button type="button" class="rm" data-i="${i}" aria-label="Quitar ${fmt([r.desde, r.hasta])}">Quitar</button></li>`).join("")
    : `<li style="color:var(--muted)">Todavía no hay vacaciones cargadas.</li>`;
  $("json").value = jsonDe(me);
  $("dirty").hidden = JSON.stringify(sorted(draft[me])) === JSON.stringify(sorted(data[me]));
  $("gh").href = `https://github.com/${REPO}/edit/${RAMA}/data/${me}.json`;
}
const msg = (t, err) => { $("msg").textContent = t; $("msg").className = "msg" + (err ? " err" : ""); };

// ---------- Exportar ----------
function descargar(nombreArchivo, texto) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([texto], { type: "text/calendar" })); a.download = nombreArchivo;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function exportables() {
  const y = hoy.getFullYear();
  const items = [{ f: "vacaciones.ics", t: "Vacaciones de todo el equipo", ev: () => PERSONAS.flatMap(p => eventosVacaciones(p, data[p.id])), n: "Vacaciones del equipo" }];
  PERSONAS.forEach(p => items.push({ f: p.id + ".ics", t: `Vacaciones de ${p.nombre}`, ev: () => eventosVacaciones(p, data[p.id]), n: `Vacaciones ${p.nombre}` }));
  items.push({ f: "feriados-ar.ics", t: "Feriados de Argentina", ev: () => eventosFeriados(holidays, "AR", y, y + 10, extras), n: "Feriados Argentina" });
  items.push({ f: "feriados-es.ics", t: "Feriados de España", ev: () => eventosFeriados(holidays, "ES", y, y + 10, extras), n: "Feriados España" });
  return items;
}
function renderExp() {
  const base = new URL(".", location.href).href;
  $("exp").innerHTML = exportables().map((x, i) => `<div class="card"><h3>${x.t}</h3><div class="url">${base}${x.f}</div>
    <div class="row"><button type="button" class="btn alt" data-dl="${i}">Descargar .ics</button><button type="button" class="btn alt" data-cp="${i}">Copiar enlace</button></div></div>`).join("");
}

// ---------- Eventos ----------
function tab(id) {
  for (const t of ["cal", "load", "exp"]) { $("tab-" + t).setAttribute("aria-selected", t === id); $("pane-" + t).hidden = t !== id; }
}
["cal", "load", "exp"].forEach(t => $("tab-" + t).addEventListener("click", () => tab(t)));
$("prev").onclick = () => { YEAR--; renderCal(); };
$("next").onclick = () => { YEAR++; renderCal(); };
$("today").onclick = () => { YEAR = hoy.getFullYear(); renderCal(); };
$("picker").addEventListener("click", e => { const b = e.target.closest(".chip"); if (!b) return; me = b.dataset.p;
  try { localStorage.setItem("vac-me", me); } catch (x) {} msg(""); renderCargar(); });
$("add").onclick = () => {
  const a = $("from").value, b = $("to").value || a;
  if (!a) return msg("Elegí la fecha de inicio.", true);
  if (b < a) return msg("La fecha final es anterior a la de inicio.", true);
  if (!expand(a, b).length) return msg("Ese rango cae solo en fin de semana.", true);
  draft[me].push({ desde: a, hasta: b, nota: $("nota").value.trim() });
  $("from").value = ""; $("to").value = ""; $("nota").value = "";
  msg(`Agregaste ${fmt([a, b])}. Falta el paso 3 para guardarlo.`); renderCargar();
};
$("mine").addEventListener("click", e => { const b = e.target.closest(".rm"); if (!b) return;
  const r = sorted(draft[me])[+b.dataset.i]; draft[me] = draft[me].filter(x => x !== r && !(x.desde === r.desde && x.hasta === r.hasta && x.nota === r.nota)); msg(""); renderCargar(); });
$("copy").onclick = async () => {
  const t = $("json").value, m = $("copymsg");
  try { await navigator.clipboard.writeText(t); m.textContent = "Copiado."; }
  catch (e) { $("json").select(); m.textContent = "Seleccioné el texto, copialo con Ctrl+C."; }
};
$("exp").addEventListener("click", async e => {
  const items = exportables(), d = e.target.closest("[data-dl]"), c = e.target.closest("[data-cp]");
  if (d) { const x = items[+d.dataset.dl]; descargar(x.f, ics(x.n, x.ev())); }
  if (c) { const x = items[+c.dataset.cp], u = new URL(x.f, location.href).href;
    try { await navigator.clipboard.writeText(u); c.textContent = "Copiado"; } catch (err) { c.textContent = "Copialo a mano"; }
    setTimeout(() => c.textContent = "Copiar enlace", 1800); }
});

await cargar();
renderCal(); renderCargar(); renderExp();
