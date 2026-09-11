import { query } from "../../_lib/db.js";
import { exigirSesion } from "../../_lib/auth.js";

const CAMPOS_EDITABLES = ["nombre", "activa", "orden"];

export default async function handler(req, res) {
  const sesion = exigirSesion(req, res);
  if (!sesion) return;

  const id = Number(req.query.id);

  if (req.method === "PUT") {
    const cambios = req.body || {};
    const sets = [];
    const valores = [];
    for (const campo of CAMPOS_EDITABLES) {
      if (campo in cambios) {
        valores.push(cambios[campo]);
        sets.push(`${campo} = $${valores.length}`);
      }
    }
    if (sets.length === 0) {
      res.status(400).json({ error: "No se envió ningún campo para actualizar." });
      return;
    }
    valores.push(id);
    const { rows } = await query(
      `UPDATE categorias SET ${sets.join(", ")} WHERE id = $${valores.length} RETURNING *`,
      valores
    );
    if (rows.length === 0) {
      res.status(404).json({ error: "No se encontró la categoría." });
      return;
    }
    res.status(200).json(rows[0]);
    return;
  }

  if (req.method === "DELETE") {
    await query("DELETE FROM categorias WHERE id = $1", [id]);
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: "Método no permitido" });
}
