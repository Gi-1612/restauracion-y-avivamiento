import { query } from "../../_lib/db.js";
import { exigirSesion } from "../../_lib/auth.js";

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

  const id = Number(req.query.id);

  if (req.method === "PUT") {
    const body = req.body || {};
    const sets = [];
    const valores = [];
    for (const campo of CAMPOS) {
      if (campo in body) {
        valores.push(body[campo]);
        sets.push(`${campo} = $${valores.length}`);
      }
    }
    if (sets.length === 0) {
      res.status(400).json({ error: "No se envió ningún campo para actualizar." });
      return;
    }
    sets.push("actualizado_en = now()");
    valores.push(id);
    const { rows } = await query(
      `UPDATE items SET ${sets.join(", ")} WHERE id = $${valores.length} RETURNING *`,
      valores
    );
    if (rows.length === 0) {
      res.status(404).json({ error: "No se encontró la publicación." });
      return;
    }
    res.status(200).json(rows[0]);
    return;
  }

  if (req.method === "DELETE") {
    await query("DELETE FROM items WHERE id = $1", [id]);
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: "Método no permitido" });
}
