import React, { useEffect, useState } from "react";
import { api } from "./api";
import { Tarjeta, Campo, Input, Boton, Alerta } from "./ui";

export default function AdminOfrendas() {
  const [config, setConfig] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/admin/configuracion").then(setConfig).catch((e) => setError(e.message));
  }, []);

  const set = (clave, valor) => setConfig((c) => ({ ...c, [clave]: valor }));

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");
    setMensaje("");
    try {
      await api.put("/api/admin/configuracion", config);
      setMensaje("Guardado.");
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  if (!config) return <p style={{ color: "#8A7F6A" }}>Cargando...</p>;

  return (
    <form onSubmit={guardar} className="space-y-6">
      <div>
        <h1 className="text-2xl" style={{ color: "#2A2620", fontFamily: "'Lora', serif" }}>
          Ofrendas
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "#8A7F6A" }}>
          Si completás un link, va a aparecer un botón para colaborar en el sitio. Si lo dejás vacío, no se muestra nada.
        </p>
      </div>

      {error && <Alerta>{error}</Alerta>}
      {mensaje && <Alerta tipo="ok">{mensaje}</Alerta>}

      <Tarjeta className="space-y-3">
        <Campo etiqueta="Texto del botón">
          <Input value={config.ofrendas_titulo || ""} onChange={(e) => set("ofrendas_titulo", e.target.value)} placeholder="Colaborá con la obra" />
        </Campo>
        <Campo etiqueta="Link para ofrendar (Mercado Pago, transferencia, etc.)">
          <Input value={config.ofrendas_url || ""} onChange={(e) => set("ofrendas_url", e.target.value)} placeholder="https://..." />
        </Campo>
      </Tarjeta>

      <Boton type="submit" cargando={guardando}>
        Guardar cambios
      </Boton>
    </form>
  );
}
