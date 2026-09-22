import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { api } from "./api";
import { Tarjeta, Campo, Input, Boton, Alerta } from "./ui";

function TarjetaMiCuenta({ sesion, onActualizado }) {
  const [nombre, setNombre] = useState(sesion.nombre);
  const [password, setPassword] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");
    setMensaje("");
    try {
      const cambios = {};
      if (nombre !== sesion.nombre) cambios.nombre = nombre;
      if (password) cambios.password = password;
      if (Object.keys(cambios).length === 0) {
        setMensaje("No hay cambios para guardar.");
        return;
      }
      const datos = await api.put("/api/admin/me", cambios);
      onActualizado(datos);
      setPassword("");
      setMensaje("Guardado.");
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Tarjeta className="space-y-3">
      <h2 className="text-[13px] font-medium uppercase tracking-wide" style={{ color: "#8A7F6A" }}>
        Mi cuenta
      </h2>
      {error && <Alerta>{error}</Alerta>}
      {mensaje && <Alerta tipo="ok">{mensaje}</Alerta>}
      <form onSubmit={guardar} className="space-y-3">
        <Campo etiqueta="Nombre">
          <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </Campo>
        <Campo etiqueta="Nueva contraseña (dejar vacío para no cambiarla)">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} />
        </Campo>
        <Boton type="submit" cargando={guardando}>
          Guardar
        </Boton>
      </form>
    </Tarjeta>
  );
}

export default function AdminAdministradores() {
  const { sesion, setSesion } = useOutletContext();
  const [admins, setAdmins] = useState(null);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState("");

  const cargar = () => api.get("/api/admin/admins").then(setAdmins).catch((e) => setError(e.message));

  useEffect(() => {
    cargar();
  }, []);

  const invitar = async (e) => {
    e.preventDefault();
    setCreando(true);
    setError("");
    try {
      await api.post("/api/admin/admins", { nombre, email, password });
      setNombre("");
      setEmail("");
      setPassword("");
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreando(false);
    }
  };

  const eliminar = async (a) => {
    if (!confirm(`¿Eliminar a ${a.nombre}?`)) return;
    try {
      await api.del(`/api/admin/admins/${a.id}`);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl" style={{ color: "#2A2620", fontFamily: "'Lora', serif" }}>
          Administradores
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "#8A7F6A" }}>
          Cada persona entra con su propio usuario y contraseña.
        </p>
      </div>

      <TarjetaMiCuenta sesion={sesion} onActualizado={setSesion} />

      {error && <Alerta>{error}</Alerta>}

      <Tarjeta className="space-y-3">
        <h2 className="text-[13px] font-medium uppercase tracking-wide" style={{ color: "#8A7F6A" }}>
          Invitar a alguien nuevo
        </h2>
        <form onSubmit={invitar} className="space-y-3">
          <Campo etiqueta="Nombre">
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </Campo>
          <Campo etiqueta="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Campo>
          <Campo etiqueta="Contraseña temporal (que después puede cambiar)">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
          </Campo>
          <Boton type="submit" cargando={creando}>
            Crear acceso
          </Boton>
        </form>
      </Tarjeta>

      <div className="space-y-2">
        {admins?.map((a) => (
          <Tarjeta key={a.id} className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium" style={{ color: "#2A2620" }}>
                {a.nombre} {a.id === sesion.id && <span style={{ color: "#A89A82" }}>(vos)</span>}
              </p>
              <p className="text-[11px]" style={{ color: "#A89A82" }}>
                {a.email}
              </p>
            </div>
            {a.id !== sesion.id && (
              <button onClick={() => eliminar(a)} aria-label="Eliminar administrador">
                <Trash2 size={16} style={{ color: "#A89A82" }} />
              </button>
            )}
          </Tarjeta>
        ))}
      </div>
    </div>
  );
}
