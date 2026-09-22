import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FolderKanban, FileText, Eye, Plus } from "lucide-react";
import { api } from "./api";
import { Tarjeta } from "./ui";

export default function AdminInicio() {
  const [categorias, setCategorias] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/api/admin/categorias")
      .then(setCategorias)
      .catch((e) => setError(e.message));
  }, []);

  const activas = categorias?.filter((c) => c.activa) || [];
  const totalPublicado = categorias?.reduce((acc, c) => acc + c.publicados, 0) || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl" style={{ color: "#2A2620", fontFamily: "'Lora', serif" }}>
          Hola 👋
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "#8A7F6A" }}>
          Así está el sitio en este momento.
        </p>
      </div>

      {error && <p style={{ color: "#C1523A" }}>{error}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Tarjeta className="flex items-center gap-3">
          <FolderKanban size={20} style={{ color: "#E8A33D" }} />
          <div>
            <p className="text-xl font-medium" style={{ color: "#2A2620" }}>
              {activas.length}
            </p>
            <p className="text-[11px]" style={{ color: "#8A7F6A" }}>
              Categorías activas
            </p>
          </div>
        </Tarjeta>
        <Tarjeta className="flex items-center gap-3">
          <FileText size={20} style={{ color: "#E8A33D" }} />
          <div>
            <p className="text-xl font-medium" style={{ color: "#2A2620" }}>
              {totalPublicado}
            </p>
            <p className="text-[11px]" style={{ color: "#8A7F6A" }}>
              Publicaciones publicadas
            </p>
          </div>
        </Tarjeta>
        <Tarjeta className="flex items-center gap-3 col-span-2 sm:col-span-1">
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3">
            <Eye size={20} style={{ color: "#E8A33D" }} />
            <div>
              <p className="text-[13px] font-medium" style={{ color: "#2A2620" }}>
                Ver sitio
              </p>
              <p className="text-[11px]" style={{ color: "#8A7F6A" }}>
                Se abre en otra pestaña
              </p>
            </div>
          </a>
        </Tarjeta>
      </div>

      <div>
        <h2 className="text-[13px] font-medium uppercase tracking-wide mb-3" style={{ color: "#8A7F6A" }}>
          Tus categorías
        </h2>
        <div className="space-y-2">
          {categorias?.map((c) => (
            <Link
              key={c.id}
              to={`/admin/categorias/${c.slug}`}
              className="flex items-center justify-between rounded-lg px-4 py-3"
              style={{ backgroundColor: "#FFFFFF" }}
            >
              <div>
                <p className="text-[13px] font-medium" style={{ color: "#2A2620" }}>
                  {c.nombre}
                </p>
                <p className="text-[11px]" style={{ color: "#A89A82" }}>
                  {c.publicados} publicado{c.publicados === 1 ? "" : "s"} · {c.activa ? "Activa" : "Desactivada"}
                </p>
              </div>
              <Plus size={16} style={{ color: "#A89A82" }} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
