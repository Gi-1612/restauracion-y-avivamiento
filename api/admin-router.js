// Enrutador único para /api/admin/* — el plan gratuito de Vercel limita la
// cantidad de funciones serverless por deploy, así que en vez de un archivo
// por endpoint, esta única función atiende a todos. vercel.json reescribe
// /api/admin/<lo-que-sea> hacia acá con ?path=<lo-que-sea>.
import setup from "./_lib/handlers/setup.js";
import login from "./_lib/handlers/login.js";
import logout from "./_lib/handlers/logout.js";
import me from "./_lib/handlers/me.js";
import admins from "./_lib/handlers/admins.js";
import categorias from "./_lib/handlers/categorias.js";
import items from "./_lib/handlers/items.js";
import configuracion from "./_lib/handlers/configuracion.js";
import upload from "./_lib/handlers/upload.js";

const RUTAS = { setup, login, logout, me, admins, categorias, items, configuracion, upload };

export default async function handler(req, res) {
  const segmentos = String(req.query.path || "")
    .split("/")
    .filter(Boolean);
  const [recurso, id] = segmentos;
  const manejador = RUTAS[recurso];

  if (!manejador) {
    res.status(404).json({ error: "No encontrado" });
    return;
  }

  req.query.id = id;
  await manejador(req, res);
}
