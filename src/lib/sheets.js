import Papa from "papaparse";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const MESES_ABR = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

/** Descarga y parsea una planilla publicada como CSV. Devuelve null si no está configurada o falla. */
export async function fetchSheet(url) {
  if (!url || url.includes("PEGAR_AQUI")) return null;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const texto = await res.text();
    const parseado = Papa.parse(texto, { header: true, skipEmptyLines: true });
    // Google Forms a veces agrega espacios extra al final de los títulos de columna
    // (ej: "Tema " en vez de "Tema"). Los recortamos para que no rompa la lectura.
    const filas = parseado.data.map((fila) => {
      const limpia = {};
      Object.keys(fila).forEach((clave) => {
        limpia[clave.trim()] = fila[clave];
      });
      return limpia;
    });
    return filas;
  } catch (e) {
    console.error("No se pudo cargar la planilla:", e);
    return null;
  }
}

const NOMBRES_MES_ES = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, setiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
};

/** Admite "14/07/2026", "2026-07-14", o el formato largo de Google Forms "Miércoles 15 de Julio 2026". */
export function parseFecha(fechaStr) {
  if (!fechaStr) return null;
  let d;
  if (fechaStr.includes("/")) {
    const partes = fechaStr.split("/").map((s) => parseInt(s, 10));
    const [dd, mm, yyyy] = partes;
    d = new Date(yyyy, (mm || 1) - 1, dd || 1);
  } else {
    const match = fechaStr
      .toLowerCase()
      .match(/(\d{1,2})\s+de\s+([a-záéíóúñ]+)\s+(?:de\s+)?(\d{4})/i);
    if (match) {
      const [, dia, mesNombre, anio] = match;
      const mesIndex = NOMBRES_MES_ES[mesNombre];
      d = mesIndex !== undefined ? new Date(parseInt(anio, 10), mesIndex, parseInt(dia, 10)) : new Date(fechaStr);
    } else {
      d = new Date(fechaStr);
    }
  }
  return isNaN(d.getTime()) ? null : d;
}

export function nombreMes(date) {
  return date ? MESES[date.getMonth()] : "";
}

export function fechaCorta(date) {
  return date ? `${date.getDate()} ${MESES_ABR[date.getMonth()]}` : "";
}

export function fechaConDia(date) {
  return date ? `${DIAS[date.getDay()]} ${date.getDate()}/${String(date.getMonth() + 1).padStart(2, "0")}` : "";
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

/** Intenta parsear el timestamp que agrega Google Forms automáticamente. */
function parseMarcaTemporal(str) {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

export function mapDevocional(row, i) {
  const fecha = parseFecha(row["Fecha"]);
  const desarrollo = row["Desarrollo"] || "";
  return {
    id: `${row["Fecha"] || i}-${i}`,
    fecha,
    fechaLabel: fecha ? fechaConDia(fecha) : row["Fecha"] || "",
    mes: nombreMes(fecha),
    tema: row["Tema"] || "General",
    referencia: row["Referencia"] || "",
    titulo: row["Titulo"] || row["Título"] || "",
    versiculo: row["Versiculo"] || row["Versículo"] || "",
    desarrollo,
    oracion: row["Oracion"] || row["Oración"] || "",
    aplicacion: row["Aplicacion"] || row["Aplicación"] || "",
    audioUrl: (row["Audio"] || "").trim(),
    extracto: desarrollo.length > 150 ? desarrollo.slice(0, 150).trim() + "…" : desarrollo,
  };
}

export function mapReunion(row, i) {
  const fecha = parseFecha(row["Fecha"]);
  return {
    id: `${row["Titulo"] || i}-${i}`,
    titulo: row["Titulo"] || row["Título"] || "",
    fecha,
    dia: fecha ? fechaConDia(fecha) : row["Fecha"] || "",
    hora: row["Hora"] || "",
    lugar: row["Lugar"] || "",
    recordar: false,
  };
}

export function mapNovedad(row, i) {
  const marca = parseMarcaTemporal(row["Marca temporal"]);
  return {
    id: `${row["Titulo"] || i}-${i}`,
    titulo: row["Titulo"] || row["Título"] || "",
    cuerpo: row["Cuerpo"] || "",
    autor: row["Autor"] || "Equipo de Medios",
    marca,
    hace: tiempoRelativo(marca),
  };
}

/** De una lista de devocionales mapeados, elige el de hoy (o el más reciente ya publicado). */
export function elegirDevocionalDeHoy(devocionales) {
  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999);
  const pasados = devocionales
    .filter((d) => d.fecha && d.fecha.getTime() <= hoy.getTime())
    .sort((a, b) => b.fecha - a.fecha);
  if (pasados.length) return pasados[0];
  return devocionales[0] || null;
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
