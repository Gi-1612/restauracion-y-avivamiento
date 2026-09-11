import { query } from "../../_lib/db.js";
import { exigirSesion } from "../../_lib/auth.js";

export default async function handler(req, res) {
  const sesion = exigirSesion(req, res);
  if (!sesion) return;

  if (req.method !== "DELETE") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  const id = Number(req.query.id);

  if (id === sesion.sub) {
    res.status(400).json({ error: "No podés eliminar tu propia cuenta mientras estás conectado con ella." });
    return;
  }

  const { count } = (await query("SELECT count(*)::int AS count FROM administradores")).rows[0];
  if (count <= 1) {
    res.status(400).json({ error: "Tiene que quedar al menos un administrador." });
    return;
  }

  await query("DELETE FROM administradores WHERE id = $1", [id]);
  res.status(200).json({ ok: true });
}
