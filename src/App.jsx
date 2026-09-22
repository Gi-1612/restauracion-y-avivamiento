import React, { useState, useEffect, useRef } from "react";
import {
  Flame,
  Calendar,
  Bell,
  Clock,
  MapPin,
  Menu,
  X,
  Play,
  Pause,
  Share2,
  BookOpen,
  ChevronDown,
  MessageCircle,
  Link as LinkIcon,
  Instagram,
  Facebook,
  Youtube,
  Image as ImageIcon,
  Sparkles,
  HandCoins,
  ArrowUpRight,
  Settings,
} from "lucide-react";
import { aFecha, fechaConDia, fechaLarga, tiempoRelativo, cargarRacha, alternarLecturaDeHoy } from "./lib/formato";

const LOGO_IGLESIA = "/logo.png";

function Flama({ racha }) {
  const intensidad = Math.min(racha / 30, 1);
  return (
    <div className="relative flex items-center justify-center">
      <div
        className="absolute w-14 h-14 rounded-full blur-xl"
        style={{
          background: `radial-gradient(circle, rgba(232,163,61,${0.5 + intensidad * 0.4}) 0%, rgba(193,80,46,0) 70%)`,
        }}
      />
      <Flame
        size={30}
        strokeWidth={1.5}
        className="relative"
        style={{ color: `rgb(${232 - intensidad * 20}, ${163 - intensidad * 40}, ${61 - intensidad * 20})` }}
        fill={`rgba(232,163,61,${0.25 + intensidad * 0.5})`}
      />
    </div>
  );
}

function Etiqueta({ children }) {
  return (
    <span className="text-[10px] tracking-[0.15em] uppercase font-medium" style={{ color: "#8A7F6A" }}>
      {children}
    </span>
  );
}

function Titulo({ children }) {
  return (
    <h2 className="text-2xl sm:text-3xl mt-1.5" style={{ color: "#2A2620", fontFamily: "'Lora', serif" }}>
      {children}
    </h2>
  );
}

function ImagenConReserva({ src, alt, className, iconSize = 26 }) {
  const [fallo, setFallo] = useState(false);
  if (!src || fallo) {
    return (
      <div
        className={`flex items-center justify-center ${className || ""}`}
        style={{ background: "linear-gradient(135deg, #F2E9D6 0%, #FFFFFF 100%)" }}
      >
        <ImageIcon size={iconSize} style={{ color: "#3E4658" }} strokeWidth={1.4} />
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFallo(true)} className={`object-cover ${className || ""}`} />;
}

function ReproductorAudio({ src }) {
  const audioRef = useRef(null);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [duracion, setDuracion] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setProgreso(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    const onLoaded = () => setDuracion(audio.duration || 0);
    const onPlay = () => setReproduciendo(true);
    const onPause = () => setReproduciendo(false);
    const onEnded = () => {
      setReproduciendo(false);
      setProgreso(0);
    };
    const onError = () => setError(true);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [src]);

  const alternar = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (reproduciendo) audio.pause();
    else audio.play().catch(() => setError(true));
  };

  const formatoTiempo = (segundos) => {
    if (!segundos || isNaN(segundos)) return "0:00";
    const m = Math.floor(segundos / 60);
    const s = Math.floor(segundos % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="rounded-xl p-3 flex items-center gap-3" style={{ backgroundColor: "#F1E4C9" }}>
      <audio ref={audioRef} src={src} preload="auto" />
      {error ? (
        <a href={src} className="flex-1 text-[11px] underline text-center py-2" style={{ color: "#E8A33D" }}>
          No se pudo reproducir acá — tocá para escuchar el audio directo
        </a>
      ) : (
        <>
          <button
            onClick={alternar}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: "#E8A33D" }}
            aria-label={reproduciendo ? "Pausar audio" : "Reproducir audio"}
          >
            {reproduciendo ? <Pause size={15} style={{ color: "#241B0E" }} fill="#241B0E" /> : <Play size={15} style={{ color: "#241B0E" }} fill="#241B0E" />}
          </button>
          <div className="flex-1">
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(232,163,61,0.2)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${progreso}%`, backgroundColor: "#E8A33D" }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px]" style={{ color: "#6B5F47" }}>
                Audio del devocional
              </span>
              <span className="text-[10px]" style={{ color: "#6B5F47" }}>
                {formatoTiempo(duracion)}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function BloqueTexto({ etiqueta, children, cursiva }) {
  if (!children) return null;
  return (
    <div>
      <Etiqueta>{etiqueta}</Etiqueta>
      <p className={`text-[14px] leading-relaxed mt-1.5 ${cursiva ? "italic" : ""}`} style={{ color: cursiva ? "#6B5F47" : "#3D372E" }}>
        {children}
      </p>
    </div>
  );
}

function ModalCentrado({ onCerrar, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      onClick={onCerrar}
    >
      <div
        className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: "#FFFFFF" }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function ModalCompartir({ titulo, onCerrar }) {
  const [copiado, setCopiado] = useState(false);
  const opciones = [
    { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "#3E5C46" },
    { id: "enlace", label: copiado ? "¡Enlace copiado!" : "Copiar enlace", icon: LinkIcon, color: "#EFE7D3" },
  ];
  return (
    <ModalCentrado onCerrar={onCerrar}>
      <div className="flex items-center justify-between">
        <div>
          <Etiqueta>Compartir</Etiqueta>
          <p className="text-[13px] mt-0.5" style={{ color: "#2A2620" }}>
            {titulo}
          </p>
        </div>
        <button onClick={onCerrar} aria-label="Cerrar">
          <X size={18} style={{ color: "#8A7F6A" }} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {opciones.map((op) => (
          <button
            key={op.id}
            onClick={() => (op.id === "enlace" ? setCopiado(true) : null)}
            className="flex flex-col items-center gap-2 rounded-xl py-4"
            style={{ backgroundColor: op.color }}
          >
            <op.icon size={20} style={{ color: "#2A2620" }} />
            <span className="text-[11px]" style={{ color: "#2A2620" }}>
              {op.label}
            </span>
          </button>
        ))}
      </div>
    </ModalCentrado>
  );
}

function Encabezado({ categorias }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  return (
    <header className="sticky top-0 z-40 backdrop-blur border-b" style={{ backgroundColor: "rgba(250,245,234,0.9)", borderColor: "rgba(0,0,0,0.06)" }}>
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2">
          <img src={LOGO_IGLESIA} alt="Restauración y Avivamiento" className="h-9 w-auto object-contain" style={{ filter: "invert(1)" }} />
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {categorias.map((c) => (
            <a key={c.slug} href={`#cat-${c.slug}`} className="text-[13px] font-medium tracking-wide" style={{ color: "#5C5240" }}>
              {c.nombre}
            </a>
          ))}
        </nav>

        <button className="md:hidden" onClick={() => setMenuAbierto(!menuAbierto)} aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}>
          {menuAbierto ? <X size={22} style={{ color: "#2A2620" }} /> : <Menu size={22} style={{ color: "#2A2620" }} />}
        </button>
      </div>

      {menuAbierto && (
        <div className="md:hidden px-5 pb-5 space-y-3 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          {categorias.map((c) => (
            <a
              key={c.slug}
              href={`#cat-${c.slug}`}
              onClick={() => setMenuAbierto(false)}
              className="block pt-3 text-[14px] font-medium"
              style={{ color: "#2A2620" }}
            >
              {c.nombre}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

function Hero({ configuracion, categorias }) {
  const tieneFoto = Boolean(configuracion.hero_imagen_url);
  const primeras = categorias.slice(0, 2);
  const categoriaEventos = categorias.find((c) => c.tipo === "evento" && c.items.length > 0);
  const proximaActividad = categoriaEventos?.items[0];

  // Con foto de fondo el texto va claro sobre un velo oscuro (legible sobre cualquier
  // foto); sin foto, el fondo es claro y el texto va oscuro.
  const colorTitulo = tieneFoto ? "#FAF5EA" : "#2A2620";
  const colorTexto = tieneFoto ? "#E4DCC8" : "#5C5240";
  const outlineBorde = tieneFoto ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.15)";
  const outlineFondo = tieneFoto ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.02)";

  return (
    <section
      id="top"
      className="relative px-5 pt-24 pb-16 sm:pt-36 sm:pb-24 text-center overflow-hidden min-h-[80vh] sm:min-h-[88vh] flex items-center justify-center"
      style={
        tieneFoto
          ? {
              backgroundImage: `linear-gradient(180deg, rgba(11,13,18,0.55) 0%, rgba(11,13,18,0.75) 55%, #FAF5EA 100%), url(${configuracion.hero_imagen_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : { backgroundColor: "#FAF5EA" }
      }
    >
      {!tieneFoto && (
        <>
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(232,163,61,0.22) 0%, rgba(232,163,61,0) 70%)" }}
          />
          <div
            className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(62,92,70,0.16) 0%, rgba(62,92,70,0) 70%)" }}
          />
        </>
      )}

      <div className="relative max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 justify-center">
          <Sparkles size={14} style={{ color: "#E8A33D" }} />
          <Etiqueta>Bienvenido a nuestra comunidad</Etiqueta>
        </div>
        <h1 className="text-4xl sm:text-6xl leading-tight" style={{ color: colorTitulo, fontFamily: "'Lora', serif" }}>
          Restauración y Avivamiento
        </h1>
        <p className="text-[15px] sm:text-lg leading-relaxed max-w-xl mx-auto" style={{ color: colorTexto }}>
          Un lugar para encontrarte con Dios, crecer en comunidad y enterarte de todo lo que pasa en la iglesia, en un
          solo lugar.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {primeras.map((c, i) => (
            <a
              key={c.slug}
              href={`#cat-${c.slug}`}
              className={`rounded-xl px-6 py-3.5 text-[14px] font-semibold shadow-lg ${i > 0 ? "border backdrop-blur" : ""}`}
              style={
                i === 0
                  ? { backgroundColor: "#E8A33D", color: "#241B0E" }
                  : { borderColor: outlineBorde, color: colorTitulo, backgroundColor: outlineFondo }
              }
            >
              Ver {c.nombre.toLowerCase()}
            </a>
          ))}
          {configuracion.ofrendas_url && (
            <a
              href={configuracion.ofrendas_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl px-6 py-3.5 text-[14px] font-semibold flex items-center gap-2"
              style={{ backgroundColor: "#3E5C46", color: "#DCEBDF" }}
            >
              <HandCoins size={16} />
              {configuracion.ofrendas_titulo || "Colaborá con la obra"}
            </a>
          )}
        </div>

        {proximaActividad && (
          <div className="mt-8 inline-flex items-center gap-3 rounded-xl px-4 py-3 mx-auto backdrop-blur shadow-sm" style={{ backgroundColor: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,0,0,0.06)" }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#F2E9D6" }}>
              <Calendar size={16} style={{ color: "#E8A33D" }} />
            </div>
            <div className="text-left">
              <Etiqueta>Próxima actividad</Etiqueta>
              <p className="text-[13px] font-medium" style={{ color: "#2A2620" }}>
                {proximaActividad.titulo}
                {proximaActividad.fecha && ` · ${fechaConDia(aFecha(proximaActividad.fecha))}`}
                {proximaActividad.hora && ` · ${proximaActividad.hora}`}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function BotonRecordar({ activo, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium shrink-0"
      style={{ backgroundColor: activo ? "rgba(232,163,61,0.15)" : "rgba(0,0,0,0.06)", color: activo ? "#E8A33D" : "#8A7F6A" }}
    >
      <Bell size={13} fill={activo ? "#E8A33D" : "none"} />
      {activo ? "Recordatorio activo" : "Avisarme"}
    </button>
  );
}

function TarjetaEvento({ item, recordado, onRecordar }) {
  return (
    <div className="rounded-xl overflow-hidden flex flex-col" style={{ backgroundColor: "#FFFFFF" }}>
      <ImagenConReserva src={item.imagen_url} alt={item.titulo} className="w-full aspect-[16/10]" />
      <div className="p-4 space-y-2 flex-1 flex flex-col">
        <p className="text-[14px] font-medium" style={{ color: "#2A2620" }}>
          {item.titulo}
        </p>
        {(item.fecha || item.hora) && (
          <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "#8A7F6A" }}>
            <Clock size={12} />
            {item.fecha && fechaConDia(aFecha(item.fecha))}
            {item.fecha && item.hora && " · "}
            {item.hora}
          </div>
        )}
        {item.lugar && (
          <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "#8A7F6A" }}>
            <MapPin size={12} />
            {item.lugar}
          </div>
        )}
        {item.enlace && (
          <a href={item.enlace} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[12px]" style={{ color: "#E8A33D" }}>
            Más información <ArrowUpRight size={12} />
          </a>
        )}
        <div className="pt-1 mt-auto">
          <BotonRecordar activo={recordado} onClick={onRecordar} />
        </div>
      </div>
    </div>
  );
}

function SeccionEventos({ categoria, recordatorios, toggleRecordar }) {
  const [destacado, ...resto] = categoria.items;
  return (
    <section id={`cat-${categoria.slug}`} className="px-5 py-14 sm:py-20 scroll-mt-16" style={{ backgroundColor: "#F2E9D6" }}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <Etiqueta>{categoria.nombre}</Etiqueta>
          <Titulo>Próximas actividades</Titulo>
        </div>

        {categoria.items.length === 0 ? (
          <p className="text-center text-[13px] py-8" style={{ color: "#A89A82" }}>
            Todavía no hay actividades cargadas.
          </p>
        ) : (
          <>
            <div className="rounded-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-2" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 12px 30px rgba(0,0,0,0.3)" }}>
              <ImagenConReserva src={destacado.imagen_url} alt={destacado.titulo} className="w-full aspect-[16/10] sm:aspect-auto sm:h-full" iconSize={40} />
              <div className="p-6 sm:p-8 flex flex-col justify-center gap-3">
                <Etiqueta>Próxima actividad</Etiqueta>
                <h3 className="text-xl sm:text-2xl" style={{ color: "#2A2620", fontFamily: "'Lora', serif" }}>
                  {destacado.titulo}
                </h3>
                {(destacado.fecha || destacado.hora) && (
                  <div className="flex items-center gap-1.5 text-[13px]" style={{ color: "#5C5240" }}>
                    <Clock size={14} />
                    {destacado.fecha && fechaConDia(aFecha(destacado.fecha))}
                    {destacado.fecha && destacado.hora && " · "}
                    {destacado.hora}
                  </div>
                )}
                {destacado.lugar && (
                  <div className="flex items-center gap-1.5 text-[13px]" style={{ color: "#5C5240" }}>
                    <MapPin size={14} />
                    {destacado.lugar}
                  </div>
                )}
                {destacado.enlace && (
                  <a href={destacado.enlace} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[13px]" style={{ color: "#E8A33D" }}>
                    Más información <ArrowUpRight size={13} />
                  </a>
                )}
                <div className="pt-1">
                  <BotonRecordar activo={Boolean(recordatorios[destacado.id])} onClick={() => toggleRecordar(destacado.id)} />
                </div>
              </div>
            </div>

            {resto.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {resto.map((item) => (
                  <TarjetaEvento key={item.id} item={item} recordado={Boolean(recordatorios[item.id])} onRecordar={() => toggleRecordar(item.id)} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function TarjetaArticulo({ item }) {
  return (
    <div className="rounded-xl overflow-hidden flex flex-col" style={{ backgroundColor: "#FFFFFF" }}>
      <ImagenConReserva src={item.imagen_url} alt={item.titulo} className="w-full aspect-[16/10]" />
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-[14px] font-medium" style={{ color: "#2A2620" }}>
          {item.titulo}
        </p>
        <p className="text-[13px] mt-1 leading-relaxed" style={{ color: "#5C5240" }}>
          {item.cuerpo}
        </p>
        {item.enlace && (
          <a href={item.enlace} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[12px] mt-2" style={{ color: "#E8A33D" }}>
            Ver más <ArrowUpRight size={12} />
          </a>
        )}
        <div className="flex items-center gap-2 mt-3 text-[11px]" style={{ color: "#A89A82" }}>
          {item.autor && <span>{item.autor}</span>}
          {item.autor && <span>·</span>}
          <span>{tiempoRelativo(aFecha(item.creado_en))}</span>
        </div>
      </div>
    </div>
  );
}

function SeccionArticulos({ categoria }) {
  const [destacado, ...resto] = categoria.items;
  return (
    <section id={`cat-${categoria.slug}`} className="px-5 py-14 sm:py-20 scroll-mt-16">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <Etiqueta>Comunidad</Etiqueta>
          <Titulo>{categoria.nombre}</Titulo>
        </div>

        {categoria.items.length === 0 ? (
          <p className="text-center text-[13px] py-8" style={{ color: "#A89A82" }}>
            Todavía no hay publicaciones en esta categoría.
          </p>
        ) : (
          <>
            <div className="rounded-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-2" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 12px 30px rgba(0,0,0,0.3)" }}>
              <ImagenConReserva src={destacado.imagen_url} alt={destacado.titulo} className="w-full aspect-[16/10] sm:aspect-auto sm:h-full" iconSize={40} />
              <div className="p-6 sm:p-8 flex flex-col justify-center gap-2">
                <Etiqueta>Lo más reciente</Etiqueta>
                <h3 className="text-xl sm:text-2xl" style={{ color: "#2A2620", fontFamily: "'Lora', serif" }}>
                  {destacado.titulo}
                </h3>
                <p className="text-[14px] leading-relaxed" style={{ color: "#5C5240" }}>
                  {destacado.cuerpo}
                </p>
                {destacado.enlace && (
                  <a href={destacado.enlace} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[13px]" style={{ color: "#E8A33D" }}>
                    Ver más <ArrowUpRight size={13} />
                  </a>
                )}
                <div className="flex items-center gap-2 text-[12px] pt-1" style={{ color: "#A89A82" }}>
                  {destacado.autor && <span>{destacado.autor}</span>}
                  {destacado.autor && <span>·</span>}
                  <span>{tiempoRelativo(aFecha(destacado.creado_en))}</span>
                </div>
              </div>
            </div>

            {resto.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {resto.map((item) => (
                  <TarjetaArticulo key={item.id} item={item} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function TarjetaDevocionalDia({ item, leido, setLeido, racha }) {
  const [mostrarCompartir, setMostrarCompartir] = useState(false);
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <Etiqueta>{item.fecha ? fechaLarga(aFecha(item.fecha)) : ""}</Etiqueta>
        {racha > 0 && (
          <div className="flex items-center gap-2">
            <Flama racha={racha} />
            <span className="text-[12px]" style={{ color: "#E8A33D" }}>
              {racha} día{racha > 1 ? "s" : ""} seguidos
            </span>
          </div>
        )}
      </div>

      <div
        className="rounded-2xl p-5 sm:p-7 space-y-4"
        style={{ backgroundColor: "#FFFDF6", boxShadow: "0 8px 24px rgba(42,38,32,0.08)", border: "1px solid rgba(0,0,0,0.06)" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <Etiqueta>{item.referencia}</Etiqueta>
            <h3 className="text-lg mt-1" style={{ color: "#2A2620", fontFamily: "'Lora', serif" }}>
              {item.titulo}
            </h3>
          </div>
          <button
            onClick={() => setMostrarCompartir(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: "#EFE7D3" }}
            aria-label="Compartir devocional"
          >
            <Share2 size={14} style={{ color: "#6B5F47" }} />
          </button>
        </div>

        {item.audio_url && <ReproductorAudio src={item.audio_url} />}

        {item.versiculo && (
          <blockquote className="text-[14px] leading-relaxed italic pl-3 border-l-2" style={{ color: "#4A4030", borderColor: "#D9B26B" }}>
            {item.versiculo}
          </blockquote>
        )}

        <div className="space-y-3 pt-1 border-t" style={{ borderColor: "#E4DCC8" }}>
          <BloqueTexto etiqueta="Desarrollo">{item.cuerpo}</BloqueTexto>
          <BloqueTexto etiqueta="Oración">{item.oracion}</BloqueTexto>
          <BloqueTexto etiqueta="Aplicación" cursiva>
            {item.aplicacion}
          </BloqueTexto>
        </div>
      </div>

      <button
        onClick={() => setLeido(!leido)}
        className="w-full rounded-xl py-3 flex items-center justify-center gap-2 text-[14px] font-medium transition-all"
        style={{ backgroundColor: leido ? "#3E5C46" : "#E8A33D", color: leido ? "#DCEBDF" : "#241B0E" }}
      >
        <Sparkles size={16} />
        {leido ? "Marcado como leído" : "Marcar como leído"}
      </button>

      {mostrarCompartir && <ModalCompartir titulo={item.titulo} onCerrar={() => setMostrarCompartir(false)} />}
    </div>
  );
}

function ArchivoDevocionales({ items }) {
  const [expandidoId, setExpandidoId] = useState(null);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {items.map((d) => {
          const abierto = expandidoId === d.id;
          return (
            <div key={d.id} className="rounded-xl overflow-hidden self-start" style={{ backgroundColor: "#FFFFFF" }}>
              <button onClick={() => setExpandidoId(abierto ? null : d.id)} className="w-full flex items-center justify-between px-4 py-3 text-left gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#F2E9D6" }}>
                    <BookOpen size={15} style={{ color: "#E8A33D" }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium" style={{ color: "#2A2620" }}>
                      {d.titulo}
                    </p>
                    <p className="text-[11px]" style={{ color: "#8A7F6A" }}>
                      {d.fecha ? fechaConDia(aFecha(d.fecha)) : ""} {d.referencia && `· ${d.referencia}`}
                    </p>
                  </div>
                </div>
                <ChevronDown size={15} className="shrink-0" style={{ color: "#A89A82", transform: abierto ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>
              {abierto && (
                <div className="px-4 pb-4 space-y-2">
                  {d.versiculo && (
                    <blockquote className="text-[13px] italic pl-3 border-l-2" style={{ color: "#6B5F47", borderColor: "#E8A33D" }}>
                      {d.versiculo}
                    </blockquote>
                  )}
                  <p className="text-[12px] leading-relaxed" style={{ color: "#5C5240" }}>
                    {d.cuerpo}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function elegirItemDeHoy(items) {
  const hoy = new Date();
  hoy.setUTCHours(23, 59, 59, 999);
  const pasados = items.filter((d) => d.fecha && new Date(d.fecha).getTime() <= hoy.getTime());
  if (pasados.length) return pasados[0];
  return items[0] || null;
}

function SeccionDevocional({ categoria, leido, setLeido, racha }) {
  const [mostrarArchivo, setMostrarArchivo] = useState(false);
  const hoy = elegirItemDeHoy(categoria.items);
  const archivo = categoria.items.filter((i) => i.id !== hoy?.id);

  return (
    <section id={`cat-${categoria.slug}`} className="px-5 py-14 sm:py-20 scroll-mt-16" style={{ backgroundColor: "#F2E9D6" }}>
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <Etiqueta>Cada día</Etiqueta>
          <Titulo>{categoria.nombre}</Titulo>
        </div>

        {!hoy ? (
          <p className="text-center text-[13px] py-8" style={{ color: "#A89A82" }}>
            Todavía no hay devocionales cargados.
          </p>
        ) : (
          <>
            <TarjetaDevocionalDia item={hoy} leido={leido} setLeido={setLeido} racha={racha} />
            {archivo.length > 0 && (
              <div className="text-center">
                <button
                  onClick={() => setMostrarArchivo(!mostrarArchivo)}
                  className="text-[13px] font-medium underline underline-offset-4"
                  style={{ color: "#E8A33D" }}
                >
                  {mostrarArchivo ? "Ocultar archivo de devocionales" : "Ver archivo de devocionales anteriores"}
                </button>
              </div>
            )}
            {mostrarArchivo && <ArchivoDevocionales items={archivo} />}
          </>
        )}
      </div>
    </section>
  );
}

function Footer({ configuracion }) {
  const redes = [
    { url: configuracion.contacto_instagram, icon: Instagram, label: "Instagram" },
    { url: configuracion.contacto_facebook, icon: Facebook, label: "Facebook" },
    { url: configuracion.contacto_youtube, icon: Youtube, label: "YouTube" },
  ].filter((r) => r.url);

  return (
    <footer className="px-5 pt-12 pb-8 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-5 text-center">
        <img src={LOGO_IGLESIA} alt="Restauración y Avivamiento" className="h-12 w-auto object-contain" style={{ filter: "invert(1)" }} />

        {configuracion.contacto_direccion && (
          <a href={configuracion.contacto_mapa_url || undefined} className="flex items-center gap-1.5 text-[13px]" style={{ color: "#8A7F6A" }}>
            <MapPin size={14} />
            {configuracion.contacto_direccion}
          </a>
        )}

        {redes.length > 0 && (
          <div className="flex items-center gap-4">
            {redes.map((r) => (
              <a key={r.label} href={r.url} aria-label={r.label} style={{ color: "#8A7F6A" }}>
                <r.icon size={20} />
              </a>
            ))}
          </div>
        )}

        <p className="text-[11px]" style={{ color: "#A89A82" }}>
          © {new Date().getFullYear()} Restauración y Avivamiento
        </p>

        <a href="/admin" className="flex items-center gap-1 text-[10px]" style={{ color: "#EFE7D3" }}>
          <Settings size={10} />
          Acceso administrador
        </a>
      </div>
    </footer>
  );
}

function BotonWhatsApp({ configuracion }) {
  if (!configuracion.contacto_whatsapp) return null;
  return (
    <a
      href={configuracion.contacto_whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-30 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
      style={{ backgroundColor: "#3E5C46" }}
      aria-label="Escribinos por WhatsApp"
    >
      <MessageCircle size={22} style={{ color: "#2A2620" }} />
    </a>
  );
}

export default function AppRestauracion() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(false);
  const [leido, setLeido] = useState(false);
  const [racha, setRacha] = useState(0);
  const [recordatorios, setRecordatorios] = useState({});

  useEffect(() => {
    const { racha: r, leidoHoy } = cargarRacha();
    setRacha(r);
    setLeido(leidoHoy);
  }, []);

  useEffect(() => {
    let activo = true;
    fetch("/api/sitio")
      .then((r) => {
        if (!r.ok) throw new Error("respuesta no ok");
        return r.json();
      })
      .then((d) => activo && setDatos(d))
      .catch(() => activo && setError(true));
    return () => {
      activo = false;
    };
  }, []);

  const marcarLeido = () => {
    const { racha: nuevaRacha, leidoHoy } = alternarLecturaDeHoy(racha, leido);
    setRacha(nuevaRacha);
    setLeido(leidoHoy);
  };

  const toggleRecordar = (id) => {
    setRecordatorios((r) => ({ ...r, [id]: !r[id] }));
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 text-center" style={{ backgroundColor: "#FAF5EA" }}>
        <div>
          <img src={LOGO_IGLESIA} alt="Restauración y Avivamiento" className="h-16 w-auto object-contain mx-auto mb-4" style={{ filter: "invert(1)" }} />
          <p style={{ color: "#8A7F6A" }}>El sitio se está configurando. Volvé a intentar en un rato.</p>
        </div>
      </div>
    );
  }

  if (!datos) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FAF5EA" }}>
        <p style={{ color: "#8A7F6A" }}>Cargando...</p>
      </div>
    );
  }

  const { categorias, configuracion } = datos;

  return (
    <div style={{ backgroundColor: "#FAF5EA" }}>
      <Encabezado categorias={categorias} />

      <main>
        <Hero configuracion={configuracion} categorias={categorias} />
        {categorias.map((c) => {
          if (c.tipo === "evento") return <SeccionEventos key={c.id} categoria={c} recordatorios={recordatorios} toggleRecordar={toggleRecordar} />;
          if (c.tipo === "articulo") return <SeccionArticulos key={c.id} categoria={c} />;
          if (c.tipo === "devocional") return <SeccionDevocional key={c.id} categoria={c} leido={leido} setLeido={marcarLeido} racha={racha} />;
          return null;
        })}
      </main>

      <Footer configuracion={configuracion} />
      <BotonWhatsApp configuracion={configuracion} />
    </div>
  );
}
