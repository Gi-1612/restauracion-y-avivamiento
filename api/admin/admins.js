import bcrypt from "bcryptjs";
import { query } from "../_lib/db.js";
import { exigirSesion } from "../_lib/auth.js";

export default async function handler(req, res) {
  const sesion = exigirSesion(req, res);
  if (!sesion) return;

  if (req.method === "GET") {
    const { rows } = await query(
      "SELECT id, nombre, email, creado_en FROM administradores ORDER BY creado_en ASC"
    );
    res.status(200).json(rows);
    return;
  }

  if (req.method === "POST") {
    const { nombre, email, password } = req.body || {};
    if (!nombre || !email || !password || password.length < 8) {
      res.status(400).json({ error: "Completá nombre, email y una contraseña de al menos 8 caracteres." });
      return;
    }
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const { rows } = await query(
        "INSERT INTO administradores (nombre, email, password_hash) VALUES ($1, $2, $3) RETURNING id, nombre, email, creado_en",
        [nombre, email.toLowerCase().trim(), passwordHash]
      );
      res.status(201).json(rows[0]);
    } catch (e) {
      if (e.code === "23505") {
        res.status(409).json({ error: "Ya hay un administrador con ese email." });
        return;
      }
      throw e;
    }
    return;
  }

  res.status(405).json({ error: "Método no permitido" });
}
