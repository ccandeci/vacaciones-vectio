// Feriados calculados por regla, válidos para cualquier año.
// Argentina: fijos, Carnaval, Semana Santa y trasladables (ley 27.399: martes y miércoles pasan al lunes anterior; jueves y viernes, al lunes siguiente).
// España: solo feriados nacionales. No incluye autonómicos ni locales.
// No incluye los "feriados puente" que el Gobierno argentino decreta cada año: esos se agregan a mano en data/extras.json.
import { key, dow, addDays } from "./fechas.js";

export function pascua(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4,
    f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
    i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
    mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
  return key(y, mes, dia);
}

const cache = {};
export function holidays(y, extras = []) {
  const ck = y + "|" + extras.length;
  if (cache[ck]) return cache[ck];
  const H = {}, P = pascua(y);
  const add = (k, c, n) => (H[k] = H[k] || []).push({ c, n });

  [[1,1,"Año Nuevo"],[3,24,"Día de la Memoria"],[4,2,"Día del Veterano de Malvinas"],[5,1,"Día del Trabajador"],
   [5,25,"Revolución de Mayo"],[6,20,"Paso a la Inmortalidad de Belgrano"],[7,9,"Día de la Independencia"],
   [12,8,"Inmaculada Concepción"],[12,25,"Navidad"]].forEach(([m, d, n]) => add(key(y, m, d), "AR", n));

  [[6,17,"Paso a la Inmortalidad de Güemes"],[8,17,"Paso a la Inmortalidad de San Martín"],
   [10,12,"Día de la Diversidad Cultural"],[11,20,"Día de la Soberanía Nacional"]].forEach(([m, d, n]) => {
    const orig = key(y, m, d), w = dow(orig);
    let k = orig;
    if (w === 2 || w === 3) k = addDays(orig, -(w - 1));
    else if (w === 4 || w === 5) k = addDays(orig, 8 - w);
    add(k, "AR", n + (k !== orig ? " (trasladado)" : ""));
  });
  add(addDays(P, -48), "AR", "Carnaval"); add(addDays(P, -47), "AR", "Carnaval");
  add(addDays(P, -3), "AR", "Jueves Santo (no laborable)"); add(addDays(P, -2), "AR", "Viernes Santo");

  [[1,1,"Año Nuevo"],[1,6,"Epifanía del Señor"],[5,1,"Fiesta del Trabajo"],[8,15,"Asunción de la Virgen"],
   [10,12,"Fiesta Nacional de España"],[11,1,"Todos los Santos"],[12,6,"Día de la Constitución"],
   [12,8,"Inmaculada Concepción"],[12,25,"Navidad"]].forEach(([m, d, n]) => add(key(y, m, d), "ES", n));
  add(addDays(P, -2), "ES", "Viernes Santo");

  extras.forEach(x => { if (x.fecha && x.fecha.startsWith(String(y))) add(x.fecha, x.pais || "AR", x.nombre || "Feriado puente"); });
  return (cache[ck] = H);
}
