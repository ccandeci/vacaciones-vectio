// Arma la carpeta _site para GitHub Pages: copia la página y genera los .ics de suscripción.
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, readdirSync } from "node:fs";
import { PERSONAS } from "../config.js";
import { holidays } from "../js/feriados.js";
import { ics, eventosVacaciones, eventosFeriados } from "../js/ics.js";

rmSync("_site", { recursive: true, force: true });
mkdirSync("_site", { recursive: true });
for (const f of ["index.html", "app.js", "config.js", "js", "data"]) cpSync(f, "_site/" + f, { recursive: true });

const extras = JSON.parse(readFileSync("data/extras.json", "utf8")).feriados || [];
const todos = [];
for (const p of PERSONAS) {
  const rangos = JSON.parse(readFileSync(`data/${p.id}.json`, "utf8")).vacaciones || [];
  const ev = eventosVacaciones(p, rangos);
  todos.push(...ev);
  writeFileSync(`_site/${p.id}.ics`, ics(`Vacaciones ${p.nombre}`, ev));
}
writeFileSync("_site/vacaciones.ics", ics("Vacaciones del equipo", todos));
const y = new Date().getFullYear();
writeFileSync("_site/feriados-ar.ics", ics("Feriados Argentina", eventosFeriados(holidays, "AR", y, y + 10, extras)));
writeFileSync("_site/feriados-es.ics", ics("Feriados España", eventosFeriados(holidays, "ES", y, y + 10, extras)));
console.log("Listo:", readdirSync("_site").join(", "));
