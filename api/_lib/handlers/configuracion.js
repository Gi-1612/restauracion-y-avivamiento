import { query } from "../db.js";
import { exigirSesion } from "../auth.js";

export default async function handler(req, res) {
  const sesion = exigirSesion(req, res);
  if (!sesion) return;

  if (req.method === "GET") {
    const { rows } = await query("SELECT clave, valor FROM configuracion");
    const objeto = Object.fromEntries(rows.map((r) => [r.clave, r.valor || ""]));
    res.status(200).json(objeto);
    return;
  }

  if (req.method === "PUT") {
    const cambios = req.body || {};
    const entradas = Object.entries(cambios);
    for (const [clave, valor] of entradas) {
      await query(
        "INSERT INTO configuracion (clave, valor) VALUES ($1, $2) ON CONFLICT (clave) DO UPDATE SET valor = $2",
        [clave, valor]
      );
    }
    const { rows } = await query("SELECT clave, valor FROM configuracion");
    res.status(200).json(Object.fromEntries(rows.map((r) => [r.clave, r.valor || ""])));
    return;
  }

  res.status(405).json({ error: "Método no permitido" });
}
