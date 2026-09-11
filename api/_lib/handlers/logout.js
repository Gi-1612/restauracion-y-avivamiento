import { borrarCookieSesion } from "../auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }
  borrarCookieSesion(res);
  res.status(200).json({ ok: true });
}
