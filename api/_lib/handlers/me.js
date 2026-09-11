import bcrypt from "bcryptjs";
import { query } from "../db.js";
import { obtenerSesion, exigirSesion, firmarSesion, setCookieSesion } from "../auth.js";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const sesion = obtenerSesion(req);
    if (!sesion) {
      const { count } = (await query("SELECT count(*)::int AS count FROM administradores")).rows[0];
      res.status(200).json({ autenticado: false, requiereConfiguracionInicial: count === 0 });
      return;
    }
    res.status(200).json({ autenticado: true, id: sesion.sub, nombre: sesion.nombre, email: sesion.email });
    return;
  }

  if (req.method === "PUT") {
    const sesion = exigirSesion(req, res);
    if (!sesion) return;

    const { nombre, password } = req.body || {};
    const sets = [];
    const valores = [];
    if (nombre) {
      valores.push(nombre);
      sets.push(`nombre = $${valores.length}`);
    }
    if (password) {
      if (password.length < 8) {
        res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres." });
        return;
      }
      valores.push(await bcrypt.hash(password, 10));
      sets.push(`password_hash = $${valores.length}`);
    }
    if (sets.length === 0) {
      res.status(400).json({ error: "No se envió ningún cambio." });
      return;
    }
    valores.push(sesion.sub);
    const { rows } = await query(
      `UPDATE administradores SET ${sets.join(", ")} WHERE id = $${valores.length} RETURNING id, nombre, email`,
      valores
    );
    const admin = rows[0];
    setCookieSesion(res, firmarSesion(admin));
    res.status(200).json({ autenticado: true, id: admin.id, nombre: admin.nombre, email: admin.email });
    return;
  }

  res.status(405).json({ error: "Método no permitido" });
}
