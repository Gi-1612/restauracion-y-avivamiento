const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const MESES_ABR = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function aFecha(valor) {
  if (!valor) return null;
  const d = new Date(valor);
  return isNaN(d.getTime()) ? null : d;
}

export function nombreMes(date) {
  return date ? MESES[date.getMonth()] : "";
}

export function fechaCorta(date) {
  return date ? `${date.getDate()} ${MESES_ABR[date.getMonth()]}` : "";
}

export function fechaConDia(date) {
  return date ? `${DIAS[date.getUTCDay()]} ${date.getUTCDate()}/${String(date.getUTCMonth() + 1).padStart(2, "0")}` : "";
}

export function fechaLarga(date) {
  return date ? `${DIAS[date.getUTCDay()]} ${date.getUTCDate()} de ${MESES[date.getUTCMonth()]}` : "";
}

export function tiempoRelativo(fecha) {
  if (!fecha) return "";
  const diffMs = Date.now() - fecha.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  if (diffH < 1) return "hace instantes";
  if (diffH < 24) return `hace ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  return `hace ${diffD} día${diffD > 1 ? "s" : ""}`;
}

const CLAVE_RACHA = "restauracion-racha-lectura";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function ayerISO() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Lee la racha guardada en este celular/navegador y si ya se marcó como leído hoy. */
export function cargarRacha() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_RACHA) || "null");
    if (!guardado) return { racha: 0, leidoHoy: false };
    return { racha: guardado.racha || 0, leidoHoy: guardado.ultimaLectura === hoyISO() };
  } catch {
    return { racha: 0, leidoHoy: false };
  }
}

/** Alterna el estado de "leído" de hoy y devuelve la nueva racha calculada. */
export function alternarLecturaDeHoy(rachaActual, leidoActualmente) {
  if (leidoActualmente) {
    const nuevaRacha = Math.max(rachaActual - 1, 0);
    try {
      localStorage.setItem(CLAVE_RACHA, JSON.stringify({ racha: nuevaRacha, ultimaLectura: null }));
    } catch {}
    return { racha: nuevaRacha, leidoHoy: false };
  }
  let guardado = null;
  try {
    guardado = JSON.parse(localStorage.getItem(CLAVE_RACHA) || "null");
  } catch {}
  const continuaRacha = guardado && guardado.ultimaLectura === ayerISO();
  const nuevaRacha = continuaRacha ? (guardado.racha || 0) + 1 : 1;
  try {
    localStorage.setItem(CLAVE_RACHA, JSON.stringify({ racha: nuevaRacha, ultimaLectura: hoyISO() }));
  } catch {}
  return { racha: nuevaRacha, leidoHoy: true };
}
