import bcrypt from "bcryptjs";
import { query } from "../_lib/db.js";
import { firmarSesion, setCookieSesion } from "../_lib/auth.js";

// Crea el primer administrador. Solo funciona mientras no exista ninguno
// (así se puede dejar la ruta pública sin abrir un agujero de seguridad).
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  const { count } = (await query("SELECT count(*)::int AS count FROM administradores")).rows[0];
  if (count > 0) {
    res.status(403).json({ error: "Ya existe un administrador. Pedile a alguien del equipo que te invite desde el panel." });
    return;
  }

  const { nombre, email, password } = req.body || {};
  if (!nombre || !email || !password || password.length < 8) {
    res.status(400).json({ error: "Completá nombre, email y una contraseña de al menos 8 caracteres." });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const { rows } = await query(
    "INSERT INTO administradores (nombre, email, password_hash) VALUES ($1, $2, $3) RETURNING id, nombre, email",
    [nombre, email.toLowerCase().trim(), passwordHash]
  );
  const admin = rows[0];
  setCookieSesion(res, firmarSesion(admin));
  res.status(200).json({ nombre: admin.nombre, email: admin.email });
}
