import { CSV_REUNIONES } from "../src/config.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  if (!CSV_REUNIONES || CSV_REUNIONES.includes("PEGAR_AQUI")) {
    res.status(200).send("");
    return;
  }
  try {
    const r = await fetch(CSV_REUNIONES);
    const texto = await r.text();
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.status(200).send(texto);
  } catch (e) {
    res.status(200).send("");
  }
}
