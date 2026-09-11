import { query } from "./_lib/db.js";

// Endpoint público: todo lo que necesita la landing page en una sola llamada.
// No requiere sesión — solo devuelve categorías activas e items publicados.
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=120");

  const [{ rows: categorias }, { rows: items }, { rows: config }] = await Promise.all([
    query("SELECT id, slug, nombre, tipo, orden FROM categorias WHERE activa = true ORDER BY orden ASC, id ASC"),
    query(
      `SELECT * FROM items WHERE publicado = true AND categoria_id IN
       (SELECT id FROM categorias WHERE activa = true)
       ORDER BY orden ASC, id ASC`
    ),
    query("SELECT clave, valor FROM configuracion"),
  ]);

  const itemsPorCategoria = {};
  for (const item of items) {
    if (!itemsPorCategoria[item.categoria_id]) itemsPorCategoria[item.categoria_id] = [];
    itemsPorCategoria[item.categoria_id].push(item);
  }

  // Los eventos se muestran del más próximo al más lejano; los artículos y
  // devocionales, del más reciente al más antiguo.
  function tiempoOrden(item) {
    const fecha = item.fecha ? new Date(item.fecha).getTime() : null;
    if (fecha !== null) return fecha;
    return new Date(item.creado_en).getTime();
  }

  const categoriasConItems = categorias.map((c) => {
    const propios = [...(itemsPorCategoria[c.id] || [])];
    if (c.tipo === "evento") {
      propios.sort((a, b) => tiempoOrden(a) - tiempoOrden(b));
    } else {
      propios.sort((a, b) => tiempoOrden(b) - tiempoOrden(a));
    }
    return { ...c, items: propios };
  });

  res.status(200).json({
    categorias: categoriasConItems,
    configuracion: Object.fromEntries(config.map((r) => [r.clave, r.valor || ""])),
  });
}
