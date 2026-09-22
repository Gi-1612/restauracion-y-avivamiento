import React, { useState } from "react";
import { Flame } from "lucide-react";
import { api } from "./api";
import { Campo, Input, Boton, Alerta } from "./ui";

export default function AdminLogin({ onAutenticado }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const datos = await api.post("/api/admin/login", { email, password });
      onAutenticado(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ backgroundColor: "#FAF5EA" }}>
      <form onSubmit={enviar} className="w-full max-w-sm space-y-5">
        <div className="flex flex-col items-center gap-2 text-center">
          <Flame size={28} style={{ color: "#E8A33D" }} />
          <h1 className="text-xl" style={{ color: "#2A2620", fontFamily: "'Lora', serif" }}>
            Panel de administración
          </h1>
          <p className="text-[13px]" style={{ color: "#8A7F6A" }}>
            Restauración y Avivamiento
          </p>
        </div>

        {error && <Alerta>{error}</Alerta>}

        <Campo etiqueta="Email">
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
        </Campo>
        <Campo etiqueta="Contraseña">
          <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </Campo>

        <Boton type="submit" cargando={cargando} className="w-full">
          Entrar
        </Boton>

        <a href="/" className="block text-center text-[12px]" style={{ color: "#A89A82" }}>
          Volver al sitio
        </a>
      </form>
    </div>
  );
}
