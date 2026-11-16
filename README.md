# Vacaciones Vectio

Calendario compartido de vacaciones. Cada persona tiene su archivo en `data/` y solo edita el suyo, así no se pisan.
La página muestra quién está de vacaciones y cuándo, con feriados de Argentina y España, y permite pasar las fechas a Google Calendar u Outlook/Teams.

## Puesta en marcha (una sola vez)

1. Creá un repositorio en GitHub, por ejemplo `vacaciones-vectio`, y subí todo el contenido de esta carpeta.
2. Abrí `config.js` y cambiá `TU-USUARIO/vacaciones-vectio` por el usuario o la organización y el nombre real del repositorio.
3. En el repositorio: Settings, Pages, Source: **GitHub Actions**. Después de cada cambio, el flujo de `.github/workflows/pages.yml` publica la página (tarda uno o dos minutos).
4. En Settings, Collaborators, invitá a Dani y a Free con permiso de escritura (write).

Privacidad: si el repositorio es público, las fechas de vacaciones las puede ver cualquiera. GitHub Pages desde un repositorio privado necesita un plan de pago (Pro, Team o Enterprise).

## Cómo carga cada uno sus vacaciones

1. Abrir la página y entrar en la pestaña “Cargar mis vacaciones”.
2. Elegir su nombre, poner desde y hasta, y apretar “Agregar a mi lista”.
3. Copiar el texto, abrir su archivo en GitHub con el botón, pegar y apretar “Commit changes”.
4. En uno o dos minutos la página publicada se actualiza para todos.

También se puede editar `data/<nombre>.json` a mano. Formato de cada período: `{ "desde": "2026-12-14", "hasta": "2026-12-18", "nota": "" }`.

## Pasar a Google Calendar o Outlook/Teams

En la pestaña “Pasar a mi calendario” hay un enlace de suscripción por cada calendario (equipo, cada persona, feriados AR y ES).
Los enlaces se actualizan solos; Google puede tardar hasta un día en reflejar cambios.
Teams usa el calendario de Outlook, así que se suscribe desde Outlook.

## Feriados

Los calcula `js/feriados.js` por regla para cualquier año (fijos, Semana Santa, Carnaval y trasladables argentinos; nacionales de España).
Los feriados puente que decreta el Gobierno cada año no se pueden calcular: se suman en `data/extras.json`.

## Sumar a otra persona

Agregala en `config.js` (en `PERSONAS`), creá `data/<id>.json` copiando uno existente y agregá su color en `index.html` (variables `--<id>`).
