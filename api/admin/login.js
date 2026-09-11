import bcrypt from "bcryptjs";
import { query } from "../_lib/db.js";
import { firmarSesion, setCookieSesion } from "../_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    res.status(400).json({ error: "Falta email o contraseña." });
    return;
  }

  const { rows } = await query("SELECT id, nombre, email, password_hash FROM administradores WHERE email = $1", [
    email.toLowerCase().trim(),
  ]);
  const admin = rows[0];
  const ok = admin ? await bcrypt.compare(password, admin.password_hash) : false;
  if (!ok) {
    res.status(401).json({ error: "Email o contraseña incorrectos." });
    return;
  }

  setCookieSesion(res, firmarSesion(admin));
  res.status(200).json({ nombre: admin.nombre, email: admin.email });
}
