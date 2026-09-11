import jwt from "jsonwebtoken";
import { stringifySetCookie } from "cookie";

const COOKIE_NAME = "admin_session";
const SECRET = process.env.ADMIN_JWT_SECRET;

function requireSecret() {
  if (!SECRET) {
    throw new Error(
      "Falta la variable de entorno ADMIN_JWT_SECRET. Generá una clave larga al azar y configurala en Vercel."
    );
  }
  return SECRET;
}

export function firmarSesion(admin) {
  return jwt.sign(
    { sub: admin.id, email: admin.email, nombre: admin.nombre },
    requireSecret(),
    { expiresIn: "30d" }
  );
}

export function setCookieSesion(res, token) {
  const cookie = stringifySetCookie({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  res.setHeader("Set-Cookie", cookie);
}

export function borrarCookieSesion(res) {
  const cookie = stringifySetCookie({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  res.setHeader("Set-Cookie", cookie);
}

/** Devuelve el admin autenticado (del token) o null si no hay sesión válida. */
export function obtenerSesion(req) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  try {
    return jwt.verify(token, requireSecret());
  } catch {
    return null;
  }
}

/** Corta la petición con 401 si no hay sesión. Devuelve el admin si la hay. */
export function exigirSesion(req, res) {
  const admin = obtenerSesion(req);
  if (!admin) {
    res.status(401).json({ error: "No autenticado" });
    return null;
  }
  return admin;
}
