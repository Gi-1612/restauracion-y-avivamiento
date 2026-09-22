import React, { useEffect, useState } from "react";
import { api } from "./api";
import SubidorImagen from "./SubidorImagen";
import { Tarjeta, Campo, Input, Boton, Alerta } from "./ui";

const CAMPOS_CONTACTO = [
  { clave: "contacto_direccion", etiqueta: "Dirección", placeholder: "Av. Ejemplo 123, Ciudad" },
  { clave: "contacto_mapa_url", etiqueta: "Link a Google Maps", placeholder: "https://maps.google.com/?q=..." },
  { clave: "contacto_whatsapp", etiqueta: "WhatsApp", placeholder: "https://wa.me/5491100000000" },
  { clave: "contacto_instagram", etiqueta: "Instagram", placeholder: "https://instagram.com/tuiglesia" },
  { clave: "contacto_facebook", etiqueta: "Facebook", placeholder: "https://facebook.com/tuiglesia" },
  { clave: "contacto_youtube", etiqueta: "YouTube", placeholder: "https://youtube.com/@tuiglesia" },
];

export default function AdminApariencia() {
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
          Apariencia
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "#8A7F6A" }}>
          La foto de portada y los datos de contacto que se muestran en el sitio.
        </p>
      </div>

      {error && <Alerta>{error}</Alerta>}
      {mensaje && <Alerta tipo="ok">{mensaje}</Alerta>}

      <Tarjeta className="space-y-3">
        <h2 className="text-[13px] font-medium uppercase tracking-wide" style={{ color: "#8A7F6A" }}>
          Portada
        </h2>
        <Campo etiqueta="Foto de fondo (opcional)">
          <SubidorImagen value={config.hero_imagen_url} onChange={(v) => set("hero_imagen_url", v)} carpeta="portada" />
        </Campo>
      </Tarjeta>

      <Tarjeta className="space-y-3">
        <h2 className="text-[13px] font-medium uppercase tracking-wide" style={{ color: "#8A7F6A" }}>
          Contacto y redes sociales
        </h2>
        {CAMPOS_CONTACTO.map((c) => (
          <Campo key={c.clave} etiqueta={c.etiqueta}>
            <Input value={config[c.clave] || ""} onChange={(e) => set(c.clave, e.target.value)} placeholder={c.placeholder} />
          </Campo>
        ))}
      </Tarjeta>

      <Boton type="submit" cargando={guardando}>
        Guardar cambios
      </Boton>
    </form>
  );
}
