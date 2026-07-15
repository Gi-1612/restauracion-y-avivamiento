jsimport Papa from "papaparse";

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
    return parseado.data;
  } catch (e) {
    console.error("No se pudo cargar la planilla:", e);
    return null;
  }
}

/** Admite "14/07/2026" o "2026-07-14". Devuelve un Date o null. */
export function parseFecha(fechaStr) {
  if (!fechaStr) return null;
  let d;
  if (fechaStr.includes("/")) {
    const partes = fechaStr.split("/").map((s) => parseInt(s, 10));
    const [dd, mm, yyyy] = partes;
    d = new Date(yyyy, (mm || 1) - 1, dd || 1);
  } else {
    d = new Date(fechaStr);
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
