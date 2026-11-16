// Genera archivos .ics (calendario) que abren Google Calendar, Outlook y Apple Calendar.
import { addDays } from "./fechas.js";

const esc = s => String(s).replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
const d8 = k => k.replace(/-/g, "");

// eventos: [{uid, desde, hasta, titulo, nota?}] con fechas inclusivas
export function ics(nombreCalendario, eventos) {
  const stamp = new Date().toISOString().replace(/[-:]|\.\d{3}/g, "");
  const L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Vacaciones Vectio//ES", "CALSCALE:GREGORIAN",
    "X-WR-CALNAME:" + esc(nombreCalendario), "REFRESH-INTERVAL;VALUE=DURATION:PT12H", "X-PUBLISHED-TTL:PT12H"];
  eventos.forEach(e => {
    L.push("BEGIN:VEVENT", "UID:" + e.uid + "@vacaciones-vectio", "DTSTAMP:" + stamp,
      "DTSTART;VALUE=DATE:" + d8(e.desde), "DTEND;VALUE=DATE:" + d8(addDays(e.hasta, 1)),
      "SUMMARY:" + esc(e.titulo));
    if (e.nota) L.push("DESCRIPTION:" + esc(e.nota));
    L.push("TRANSP:TRANSPARENT", "END:VEVENT");
  });
  L.push("END:VCALENDAR");
  return L.join("\r\n") + "\r\n";
}

export const eventosVacaciones = (persona, rangos) =>
  rangos.map(r => ({ uid: `${persona.id}-${r.desde}-${r.hasta}`, desde: r.desde, hasta: r.hasta,
    titulo: `${persona.nombre} de vacaciones`, nota: r.nota || "" }));

export function eventosFeriados(holidays, pais, desdeAnio, hastaAnio, extras = []) {
  const out = [];
  for (let y = desdeAnio; y <= hastaAnio; y++) {
    const H = holidays(y, extras);
    Object.keys(H).sort().forEach(k => H[k].filter(x => x.c === pais).forEach((x, i) =>
      out.push({ uid: `feriado-${pais}-${k}-${i}`, desde: k, hasta: k, titulo: `Feriado ${pais}: ${x.n}` })));
  }
  return out;
}
