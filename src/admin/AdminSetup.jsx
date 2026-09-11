import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { api } from "./api";
import { Campo, Input, Boton, Alerta } from "./ui";

export default function AdminSetup({ onAutenticado }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const datos = await api.post("/api/admin/setup", { nombre, email, password });
      onAutenticado(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ backgroundColor: "#12151C" }}>
      <form onSubmit={enviar} className="w-full max-w-sm space-y-5">
        <div className="flex flex-col items-center gap-2 text-center">
          <Sparkles size={28} style={{ color: "#E8A33D" }} />
          <h1 className="text-xl" style={{ color: "#F2ECDD", fontFamily: "'Lora', serif" }}>
            Creá el primer administrador
          </h1>
          <p className="text-[13px]" style={{ color: "#8A94A6" }}>
            Esta pantalla solo funciona una vez. Después vas a poder invitar a más
            personas desde el panel.
          </p>
        </div>

        {error && <Alerta>{error}</Alerta>}

        <Campo etiqueta="Tu nombre">
          <Input required value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus />
        </Campo>
        <Campo etiqueta="Email">
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Campo>
        <Campo etiqueta="Contraseña (mínimo 8 caracteres)">
          <Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        </Campo>

        <Boton type="submit" cargando={cargando} className="w-full">
          Crear cuenta y entrar
        </Boton>
      </form>
    </div>
  );
}
