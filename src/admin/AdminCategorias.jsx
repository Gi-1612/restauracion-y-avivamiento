import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, ChevronRight } from "lucide-react";
import { api } from "./api";
import { Tarjeta, Boton, Input, Select, Campo, Interruptor, Alerta } from "./ui";

const TIPOS = [
  { valor: "evento", label: "Evento (con fecha, hora y lugar)" },
  { valor: "articulo", label: "Artículo (novedad, misión, testimonio...)" },
  { valor: "devocional", label: "Devocional (versículo, oración, aplicación)" },
];

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState(null);
  const [error, setError] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("articulo");
  const [creando, setCreando] = useState(false);

  const cargar = () => api.get("/api/admin/categorias").then(setCategorias).catch((e) => setError(e.message));

  useEffect(() => {
    cargar();
  }, []);

  const crear = async (e) => {
    e.preventDefault();
    setCreando(true);
    setError("");
    try {
      await api.post("/api/admin/categorias", { nombre, tipo });
      setNombre("");
      setTipo("articulo");
      setMostrarForm(false);
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreando(false);
    }
  };

  const alternarActiva = async (c) => {
    setCategorias(categorias.map((x) => (x.id === c.id ? { ...x, activa: !x.activa } : x)));
    try {
      await api.put(`/api/admin/categorias/${c.id}`, { activa: !c.activa });
    } catch (err) {
      setError(err.message);
      cargar();
    }
  };

  const eliminar = async (c) => {
    if (!confirm(`¿Eliminar "${c.nombre}" y todas sus publicaciones? No se puede deshacer.`)) return;
    try {
      await api.del(`/api/admin/categorias/${c.id}`);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl" style={{ color: "#F2ECDD", fontFamily: "'Lora', serif" }}>
            Categorías
          </h1>
          <p className="text-[13px] mt-1" style={{ color: "#8A94A6" }}>
            Activá o desactivá secciones del sitio, o creá una nueva (por ejemplo "Misiones").
          </p>
        </div>
        <Boton onClick={() => setMostrarForm(!mostrarForm)}>
          <Plus size={15} />
          Nueva
        </Boton>
      </div>

      {error && <Alerta>{error}</Alerta>}

      {mostrarForm && (
        <Tarjeta className="space-y-4">
          <form onSubmit={crear} className="space-y-4">
            <Campo etiqueta="Nombre de la categoría">
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Misiones" required autoFocus />
            </Campo>
            <Campo etiqueta="Tipo de contenido">
              <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                {TIPOS.map((t) => (
                  <option key={t.valor} value={t.valor}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </Campo>
            <Boton type="submit" cargando={creando}>
              Crear categoría
            </Boton>
          </form>
        </Tarjeta>
      )}

      <div className="space-y-2">
        {categorias?.map((c) => (
          <Tarjeta key={c.id} className="flex items-center gap-4">
            <Interruptor activo={c.activa} onChange={() => alternarActiva(c)} />
            <Link to={`/admin/categorias/${c.slug}`} className="flex-1 min-w-0">
              <p className="text-[14px] font-medium truncate" style={{ color: "#F2ECDD" }}>
                {c.nombre}
              </p>
              <p className="text-[11px]" style={{ color: "#5A6272" }}>
                {TIPOS.find((t) => t.valor === c.tipo)?.label.split(" (")[0]} · {c.publicados}/{c.total_items} publicado
                {c.publicados === 1 ? "" : "s"}
              </p>
            </Link>
            <button onClick={() => eliminar(c)} aria-label="Eliminar categoría">
              <Trash2 size={16} style={{ color: "#5A6272" }} />
            </button>
            <Link to={`/admin/categorias/${c.slug}`} aria-label="Administrar publicaciones">
              <ChevronRight size={18} style={{ color: "#5A6272" }} />
            </Link>
          </Tarjeta>
        ))}
      </div>
    </div>
  );
}
