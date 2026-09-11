import { query } from "../_lib/db.js";
import { exigirSesion } from "../_lib/auth.js";

const CAMPOS = [
  "titulo",
  "cuerpo",
  "imagen_url",
  "fecha",
  "hora",
  "lugar",
  "enlace",
  "referencia",
  "versiculo",
  "oracion",
  "aplicacion",
  "audio_url",
  "autor",
  "publicado",
  "orden",
];

export default async function handler(req, res) {
  const sesion = exigirSesion(req, res);
  if (!sesion) return;

  if (req.method === "GET") {
    const categoriaId = Number(req.query.categoria_id);
    if (!categoriaId) {
      res.status(400).json({ error: "Falta categoria_id" });
      return;
    }
    const { rows } = await query(
      "SELECT * FROM items WHERE categoria_id = $1 ORDER BY orden ASC, fecha DESC NULLS LAST, id DESC",
      [categoriaId]
    );
    res.status(200).json(rows);
    return;
  }

  if (req.method === "POST") {
    const body = req.body || {};
    const categoriaId = Number(body.categoria_id);
    if (!categoriaId || !body.titulo) {
      res.status(400).json({ error: "Falta categoria_id o título." });
      return;
    }
    const columnas = ["categoria_id"];
    const marcadores = ["$1"];
    const valores = [categoriaId];
    for (const campo of CAMPOS) {
      if (campo in body) {
        valores.push(body[campo]);
        columnas.push(campo);
        marcadores.push(`$${valores.length}`);
      }
    }
    const { rows } = await query(
      `INSERT INTO items (${columnas.join(", ")}) VALUES (${marcadores.join(", ")}) RETURNING *`,
      valores
    );
    res.status(201).json(rows[0]);
    return;
  }

  res.status(405).json({ error: "Método no permitido" });
}
