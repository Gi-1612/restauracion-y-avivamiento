import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Plus, Pencil, Trash2, Clock, MapPin } from "lucide-react";
import { api } from "./api";
import SubidorImagen from "./SubidorImagen";
import { Tarjeta, Boton, Input, TextArea, Campo, Interruptor, Alerta, Modal } from "./ui";

const VACIO = {
  titulo: "",
  cuerpo: "",
  imagen_url: "",
  fecha: "",
  hora: "",
  lugar: "",
  enlace: "",
  referencia: "",
  versiculo: "",
  oracion: "",
  aplicacion: "",
  audio_url: "",
  autor: "",
  publicado: true,
};

function formularioPorTipo(tipo, item, set) {
  if (tipo === "evento") {
    return (
      <>
        <Campo etiqueta="Título">
          <Input value={item.titulo} onChange={(e) => set({ titulo: e.target.value })} required autoFocus />
        </Campo>
        <div className="grid grid-cols-2 gap-3">
          <Campo etiqueta="Fecha">
            <Input type="date" value={item.fecha} onChange={(e) => set({ fecha: e.target.value })} />
          </Campo>
          <Campo etiqueta="Hora">
            <Input placeholder="19:00" value={item.hora} onChange={(e) => set({ hora: e.target.value })} />
          </Campo>
        </div>
        <Campo etiqueta="Lugar">
          <Input value={item.lugar} onChange={(e) => set({ lugar: e.target.value })} />
        </Campo>
        <Campo etiqueta="Link (opcional, ej. inscripción)">
          <Input value={item.enlace} onChange={(e) => set({ enlace: e.target.value })} placeholder="https://..." />
        </Campo>
        <Campo etiqueta="Foto (opcional)">
          <SubidorImagen value={item.imagen_url} onChange={(v) => set({ imagen_url: v })} carpeta="agenda" />
        </Campo>
      </>
    );
  }

  if (tipo === "devocional") {
    return (
      <>
        <Campo etiqueta="Título">
          <Input value={item.titulo} onChange={(e) => set({ titulo: e.target.value })} required autoFocus />
        </Campo>
        <div className="grid grid-cols-2 gap-3">
          <Campo etiqueta="Fecha">
            <Input type="date" value={item.fecha} onChange={(e) => set({ fecha: e.target.value })} />
          </Campo>
          <Campo etiqueta="Referencia bíblica">
            <Input placeholder="Juan 15:5" value={item.referencia} onChange={(e) => set({ referencia: e.target.value })} />
          </Campo>
        </div>
        <Campo etiqueta="Versículo">
          <TextArea rows={2} value={item.versiculo} onChange={(e) => set({ versiculo: e.target.value })} />
        </Campo>
        <Campo etiqueta="Desarrollo">
          <TextArea rows={4} value={item.cuerpo} onChange={(e) => set({ cuerpo: e.target.value })} />
        </Campo>
        <Campo etiqueta="Oración">
          <TextArea rows={3} value={item.oracion} onChange={(e) => set({ oracion: e.target.value })} />
        </Campo>
        <Campo etiqueta="Aplicación">
          <TextArea rows={3} value={item.aplicacion} onChange={(e) => set({ aplicacion: e.target.value })} />
        </Campo>
        <Campo etiqueta="Audio (link, opcional)">
          <Input value={item.audio_url} onChange={(e) => set({ audio_url: e.target.value })} placeholder="https://..." />
        </Campo>
      </>
    );
  }

  // articulo (novedades, misiones, testimonios, etc.)
  return (
    <>
      <Campo etiqueta="Título">
        <Input value={item.titulo} onChange={(e) => set({ titulo: e.target.value })} required autoFocus />
      </Campo>
      <Campo etiqueta="Texto">
        <TextArea rows={4} value={item.cuerpo} onChange={(e) => set({ cuerpo: e.target.value })} />
      </Campo>
      <Campo etiqueta="Autor / área (opcional)">
        <Input value={item.autor} onChange={(e) => set({ autor: e.target.value })} placeholder="Equipo de Medios" />
      </Campo>
      <Campo etiqueta="Link (opcional)">
        <Input value={item.enlace} onChange={(e) => set({ enlace: e.target.value })} placeholder="https://..." />
      </Campo>
      <Campo etiqueta="Foto (opcional)">
        <SubidorImagen value={item.imagen_url} onChange={(v) => set({ imagen_url: v })} carpeta="items" />
      </Campo>
    </>
  );
}

function FormularioItem({ categoria, item, onCerrar, onGuardado }) {
  const [valores, setValores] = useState({
    ...VACIO,
    ...item,
    fecha: item?.fecha ? item.fecha.slice(0, 10) : "",
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const set = (cambios) => setValores((v) => ({ ...v, ...cambios }));

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");
    try {
      const payload = { ...valores, fecha: valores.fecha || null };
      if (item?.id) {
        await api.put(`/api/admin/items/${item.id}`, payload);
      } else {
        await api.post("/api/admin/items", { ...payload, categoria_id: categoria.id });
      }
      onGuardado();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal titulo={item?.id ? "Editar publicación" : "Nueva publicación"} onCerrar={onCerrar}>
      <form onSubmit={guardar} className="space-y-4">
        {error && <Alerta>{error}</Alerta>}
        {formularioPorTipo(categoria.tipo, valores, set)}
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          <label className="flex items-center gap-2 text-[13px]" style={{ color: "#5C5240" }}>
            <Interruptor activo={valores.publicado} onChange={(v) => set({ publicado: v })} />
            Publicado (visible en el sitio)
          </label>
          <Boton type="submit" cargando={guardando}>
            Guardar
          </Boton>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminItems() {
  const { slug } = useParams();
  const [categoria, setCategoria] = useState(null);
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [editando, setEditando] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  const cargar = async () => {
    try {
      const categorias = await api.get("/api/admin/categorias");
      const cat = categorias.find((c) => c.slug === slug);
      setCategoria(cat || null);
      if (cat) {
        const lista = await api.get(`/api/admin/items?categoria_id=${cat.id}`);
        setItems(lista);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const eliminar = async (item) => {
    if (!confirm(`¿Eliminar "${item.titulo}"?`)) return;
    try {
      await api.del(`/api/admin/items/${item.id}`);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const alternarPublicado = async (item) => {
    setItems(items.map((i) => (i.id === item.id ? { ...i, publicado: !i.publicado } : i)));
    try {
      await api.put(`/api/admin/items/${item.id}`, { publicado: !item.publicado });
    } catch (err) {
      setError(err.message);
      cargar();
    }
  };

  if (categoria === null && items === null && !error) {
    return <p style={{ color: "#8A7F6A" }}>Cargando...</p>;
  }

  if (!categoria) {
    return (
      <div className="space-y-4">
        <Alerta>No se encontró esa categoría.</Alerta>
        <Link to="/admin/categorias" className="text-[13px] underline" style={{ color: "#E8A33D" }}>
          Volver a categorías
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/admin/categorias" className="flex items-center gap-1 text-[12px]" style={{ color: "#8A7F6A" }}>
        <ChevronLeft size={14} />
        Categorías
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl" style={{ color: "#2A2620", fontFamily: "'Lora', serif" }}>
          {categoria.nombre}
        </h1>
        <Boton
          onClick={() => {
            setEditando(null);
            setMostrarForm(true);
          }}
        >
          <Plus size={15} />
          Nueva
        </Boton>
      </div>

      {error && <Alerta>{error}</Alerta>}

      <div className="space-y-2">
        {items?.length === 0 && (
          <p className="text-[13px] py-8 text-center" style={{ color: "#A89A82" }}>
            Todavía no hay publicaciones en esta categoría.
          </p>
        )}
        {items?.map((item) => (
          <Tarjeta key={item.id} className="flex items-center gap-4">
            <Interruptor activo={item.publicado} onChange={() => alternarPublicado(item)} />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium truncate" style={{ color: "#2A2620" }}>
                {item.titulo}
              </p>
              <div className="flex items-center gap-3 text-[11px] mt-0.5" style={{ color: "#A89A82" }}>
                {item.fecha && (
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {new Date(item.fecha).toLocaleDateString("es-AR", { timeZone: "UTC" })}
                  </span>
                )}
                {item.lugar && (
                  <span className="flex items-center gap-1">
                    <MapPin size={11} />
                    {item.lugar}
                  </span>
                )}
                {!item.publicado && <span>Borrador</span>}
              </div>
            </div>
            <button
              onClick={() => {
                setEditando(item);
                setMostrarForm(true);
              }}
              aria-label="Editar"
            >
              <Pencil size={16} style={{ color: "#A89A82" }} />
            </button>
            <button onClick={() => eliminar(item)} aria-label="Eliminar">
              <Trash2 size={16} style={{ color: "#A89A82" }} />
            </button>
          </Tarjeta>
        ))}
      </div>

      {mostrarForm && (
        <FormularioItem
          categoria={categoria}
          item={editando}
          onCerrar={() => setMostrarForm(false)}
          onGuardado={() => {
            setMostrarForm(false);
            cargar();
          }}
        />
      )}
    </div>
  );
}
