async function llamar(path, options = {}) {
  const res = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    method: options.method || "GET",
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  const texto = await res.text();
  const datos = texto ? JSON.parse(texto) : {};
  if (!res.ok) {
    throw new Error(datos.error || "Ocurrió un error inesperado.");
  }
  return datos;
}

export const api = {
  get: (path) => llamar(path),
  post: (path, body) => llamar(path, { method: "POST", body }),
  put: (path, body) => llamar(path, { method: "PUT", body }),
  del: (path) => llamar(path, { method: "DELETE" }),
};
