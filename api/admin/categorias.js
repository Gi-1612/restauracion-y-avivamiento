import { query } from "../_lib/db.js";
import { exigirSesion } from "../_lib/auth.js";

const TIPOS_VALIDOS = ["evento", "articulo", "devocional"];

function slugify(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default async function handler(req, res) {
  const sesion = exigirSesion(req, res);
  if (!sesion) return;

  if (req.method === "GET") {
    const { rows } = await query(
      `SELECT c.*,
         (SELECT count(*)::int FROM items i WHERE i.categoria_id = c.id) AS total_items,
         (SELECT count(*)::int FROM items i WHERE i.categoria_id = c.id AND i.publicado) AS publicados
       FROM categorias c ORDER BY orden ASC, id ASC`
    );
    res.status(200).json(rows);
    return;
  }

  if (req.method === "POST") {
    const { nombre, tipo } = req.body || {};
    if (!nombre || !TIPOS_VALIDOS.includes(tipo)) {
      res.status(400).json({ error: "Falta el nombre o el tipo de categoría no es válido." });
      return;
    }
    const slug = slugify(nombre);
    const { rows: maxRows } = await query("SELECT COALESCE(MAX(orden), 0) + 1 AS siguiente FROM categorias");
    try {
      const { rows } = await query(
        "INSERT INTO categorias (slug, nombre, tipo, activa, orden) VALUES ($1, $2, $3, true, $4) RETURNING *",
        [slug, nombre, tipo, maxRows[0].siguiente]
      );
      res.status(201).json(rows[0]);
    } catch (e) {
      if (e.code === "23505") {
        res.status(409).json({ error: "Ya existe una categoría con un nombre muy parecido." });
        return;
      }
      throw e;
    }
    return;
  }

  res.status(405).json({ error: "Método no permitido" });
}
