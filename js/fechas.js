// Utilidades de fechas. Todas las fechas son texto "AAAA-MM-DD" y se calculan en UTC para evitar corrimientos por huso horario.
export const MN = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
export const MS = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
export const DOW = ["D","L","M","X","J","V","S"];
export const DOW_L = ["dom","lun","mar","mié","jue","vie","sáb"];

export const pad = n => (n < 10 ? "0" + n : "" + n);
export const key = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
export const dow = k => { const [y, m, d] = k.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); };
export const isWk = k => { const w = dow(k); return w === 0 || w === 6; };
export const addDays = (k, n) => {
  const [y, m, d] = k.split("-").map(Number);
  const x = new Date(Date.UTC(y, m - 1, d + n));
  return key(x.getUTCFullYear(), x.getUTCMonth() + 1, x.getUTCDate());
};
export const daysInMonth = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();

// Días laborables (lunes a viernes) entre dos fechas, ambas incluidas
export function expand(desde, hasta) {
  const out = [];
  for (let k = desde; k <= hasta; k = addDays(k, 1)) if (!isWk(k)) out.push(k);
  return out;
}

// Agrupa fechas laborables en rangos. Un fin de semana entre dos días no corta el rango.
export function runs(list) {
  const out = [];
  [...list].sort().forEach(k => {
    const last = out[out.length - 1];
    if (last) {
      let n = addDays(last[1], 1);
      while (isWk(n) && n < k) n = addDays(n, 1);
      if (n === k) { last[1] = k; last[2].push(k); return; }
    }
    out.push([k, k, [k]]);
  });
  return out;
}

// "14–18 dic 2026", "28 dic 2026 – 8 ene 2027"
export function fmt([desde, hasta]) {
  const a = desde.split("-").map(Number), b = hasta.split("-").map(Number);
  if (desde === hasta) return `${a[2]} ${MS[a[1] - 1]} ${a[0]}`;
  if (a[0] === b[0] && a[1] === b[1]) return `${a[2]}–${b[2]} ${MS[a[1] - 1]} ${a[0]}`;
  return `${a[2]} ${MS[a[1] - 1]} ${a[0]} – ${b[2]} ${MS[b[1] - 1]} ${b[0]}`;
}
