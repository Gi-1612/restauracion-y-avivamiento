import React, { useState, useEffect, useRef } from "react";
import {
  Flame,
  Calendar,
  Bell,
  Newspaper,
  Settings,
  Check,
  Plus,
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
} from "lucide-react";
import { fetchSheet, mapDevocional, mapReunion, mapNovedad, elegirDevocionalDeHoy, cargarRacha, alternarLecturaDeHoy } from "./lib/sheets";
import {
  HERO_IMAGEN_URL,
  CONTACTO_DIRECCION,
  CONTACTO_MAPA_URL,
  CONTACTO_WHATSAPP,
  CONTACTO_INSTAGRAM,
  CONTACTO_FACEBOOK,
  CONTACTO_YOUTUBE,
} from "./config";

const LOGO_IGLESIA = "/logo.png";

const HISTORIAL_EJEMPLO = [
  { id: 1, fecha: "13 jul", fechaLabel: "13 jul", mes: "Julio", tema: "Perseverancia", referencia: "Juan 15:5", titulo: "Permanecer en la Vid", versiculo: "“Yo soy la vid, vosotros los pámpanos…”", extracto: "El fruto llega como consecuencia de permanecer conectados, no del esfuerzo aislado." },
  { id: 2, fecha: "12 jul", fechaLabel: "12 jul", mes: "Julio", tema: "Perseverancia", referencia: "Hebreos 10:36", titulo: "La Paciencia que Sostiene", versiculo: "“Vosotros tenéis necesidad de paciencia…”", extracto: "La promesa se recibe después de haber hecho la voluntad de Dios, no antes." },
  { id: 3, fecha: "10 jul", fechaLabel: "10 jul", mes: "Julio", tema: "Fe", referencia: "Marcos 11:24", titulo: "Pedir Creyendo", versiculo: "“Todo lo que pidiereis orando, creed que lo recibiréis…”", extracto: "La fe no es negar la dificultad, es confiar en Quién la puede resolver." },
  { id: 4, fecha: "8 jul", fechaLabel: "8 jul", mes: "Julio", tema: "Restauración", referencia: "Joel 2:25", titulo: "Los Años que la Oruga Comió", versiculo: "“Y os restituiré los años que comió la oruga…”", extracto: "Dios no solo perdona: también restaura lo que el tiempo perdido se llevó." },
  { id: 5, fecha: "29 jun", fechaLabel: "29 jun", mes: "Junio", tema: "Gracia", referencia: "Efesios 2:8", titulo: "Salvos por Gracia", versiculo: "“Porque por gracia sois salvos, por medio de la fe…”", extracto: "No hay mérito propio que alcance: todo es don, y eso nos libera." },
  { id: 6, fecha: "22 jun", fechaLabel: "22 jun", mes: "Junio", tema: "Fe", referencia: "Hebreos 11:1", titulo: "La Certeza de lo que se Espera", versiculo: "“Es, pues, la fe la certeza de lo que se espera…”", extracto: "Creer no es ver primero: es sostenerse en lo que Dios ya prometió." },
  { id: 7, fecha: "15 jun", fechaLabel: "15 jun", mes: "Junio", tema: "Restauración", referencia: "Isaías 61:3", titulo: "Gloria en Vez de Ceniza", versiculo: "“…para ordenar que a los afligidos de Sion se les dé gloria en lugar de ceniza…”", extracto: "Donde hubo pérdida, Dios promete un intercambio: belleza a cambio de ceniza." },
  { id: 8, fecha: "8 jun", fechaLabel: "8 jun", mes: "Junio", tema: "Gracia", referencia: "2 Corintios 12:9", titulo: "Poder en la Debilidad", versiculo: "“Bástate mi gracia; porque mi poder se perfecciona en la debilidad…”", extracto: "La debilidad no es un obstáculo para Dios: es el lugar donde su poder se nota más." },
];

const DEVOCIONAL_EJEMPLO = {
  fechaLabel: "Lunes 13 de julio",
  referencia: "Juan 15:5 (RVR1960)",
  titulo: "Permanecer en la Vid",
  versiculo:
    "“Yo soy la vid, vosotros los pámpanos; el que permanece en mí… este lleva mucho fruto; porque separados de mí nada podéis hacer.”",
  desarrollo:
    "Jesús se presenta como la vid verdadera: la vida y el fruto no nacen del esfuerzo aislado, sino de mantenerse unidos a Él día a día. Un pámpano no lucha por dar fruto; simplemente permanece conectado, y el fruto llega como consecuencia natural de esa conexión. Muchas veces medimos nuestra vida espiritual por cuánto hacemos, cuando en realidad se mide por cuánto permanecemos.",
  oracion:
    "Señor, quiero permanecer en Vos hoy. Ayudame a no depender de mi propio esfuerzo, sino a mantenerme conectado a tu presencia en cada decisión del día. Que mi vida dé fruto porque está unida a la tuya. Amén.",
  aplicacion:
    "Elegí un momento concreto de tu día (al levantarte, en el trabajo, antes de dormir) para detenerte 2 minutos y recordar que estás unido a Él. No se trata de hacer más, sino de permanecer.",
  audioUrl: "",
};

const REUNIONES_EJEMPLO = [
  { id: 1, titulo: "Culto Central", dia: "Domingo 19/07", hora: "19:00", lugar: "Templo Central", imagen: "https://picsum.photos/id/1015/900/600", recordar: true },
  { id: 2, titulo: "Escuela para Padres", dia: "Martes 21/07", hora: "20:00", lugar: "Salón Anexo", imagen: "", recordar: false },
  { id: 3, titulo: "Mi Peña Cristiana", dia: "Viernes 24/07", hora: "21:00", lugar: "Patio Central", imagen: "https://picsum.photos/id/1021/900/600", recordar: true },
  { id: 4, titulo: "Escuela Bíblica Niños", dia: "Sábado 25/07", hora: "16:00", lugar: "Aula 2", imagen: "", recordar: false },
];

const NOVEDADES_EJEMPLO = [
  {
    id: 1,
    titulo: "Inscripciones abiertas: Escuela para Padres",
    cuerpo: "Ya podés anotarte para el próximo ciclo. Cupos limitados.",
    autor: "Equipo de Medios",
    imagen: "https://picsum.photos/id/1024/900/600",
    hace: "hace 2 h",
  },
  {
    id: 2,
    titulo: "Nuevo horario de Escuela Bíblica",
    cuerpo: "A partir de agosto, la Escuela Bíblica de niños pasa a las 16:00.",
    autor: "Ministerio de Niños",
    imagen: "",
    hace: "hace 1 día",
  },
  {
    id: 3,
    titulo: "Se viene Mi Peña Cristiana",
    cuerpo: "Una noche de música, testimonios y comunidad. Traé a un amigo.",
    autor: "Equipo de Medios",
    imagen: "",
    hace: "hace 2 días",
  },
];

const NAV_LINKS = [
  { href: "#agenda", label: "Agenda" },
  { href: "#novedades", label: "Novedades" },
  { href: "#devocional", label: "Devocional" },
];

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
    <span className="text-[10px] tracking-[0.15em] uppercase font-medium" style={{ color: "#8A94A6" }}>
      {children}
    </span>
  );
}

function ImagenConReserva({ src, alt, className, iconSize = 26 }) {
  const [fallo, setFallo] = useState(false);
  if (!src || fallo) {
    return (
      <div
        className={`flex items-center justify-center ${className || ""}`}
        style={{ background: "linear-gradient(135deg, #2A3140 0%, #1B2029 100%)" }}
      >
        <ImageIcon size={iconSize} style={{ color: "#3E4658" }} strokeWidth={1.4} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFallo(true)}
      className={`object-cover ${className || ""}`}
    />
  );
}

function Titulo({ children }) {
  return (
    <h2
      className="text-2xl sm:text-3xl mt-1.5"
      style={{ color: "#F2ECDD", fontFamily: "'Lora', serif" }}
    >
      {children}
    </h2>
  );
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
    if (reproduciendo) {
      audio.pause();
    } else {
      audio.play().catch(() => setError(true));
    }
  };

  const formatoTiempo = (segundos) => {
    if (!segundos || isNaN(segundos)) return "0:00";
    const m = Math.floor(segundos / 60);
    const s = Math.floor(segundos % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="rounded-xl p-3 flex items-center gap-3" style={{ backgroundColor: "#241B0E" }}>
      <audio ref={audioRef} src={src} preload="auto" />
      {error ? (
        <a
          href={src}
          className="flex-1 text-[11px] underline text-center py-2"
          style={{ color: "#E8A33D" }}
        >
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
            {reproduciendo ? (
              <Pause size={15} style={{ color: "#241B0E" }} fill="#241B0E" />
            ) : (
              <Play size={15} style={{ color: "#241B0E" }} fill="#241B0E" />
            )}
          </button>
          <div className="flex-1">
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(232,163,61,0.2)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progreso}%`, backgroundColor: "#E8A33D" }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px]" style={{ color: "#C9B892" }}>
                Audio del devocional
              </span>
              <span className="text-[10px]" style={{ color: "#C9B892" }}>
                {formatoTiempo(duracion)}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SeccionDevocionalTexto({ etiqueta, children, cursiva }) {
  return (
    <div>
      <Etiqueta>{etiqueta}</Etiqueta>
      <p
        className={`text-[14px] leading-relaxed mt-1.5 ${cursiva ? "italic" : ""}`}
        style={{ color: cursiva ? "#6B5F47" : "#3D372E" }}
      >
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
        style={{ backgroundColor: "#1B2029" }}
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
    { id: "enlace", label: copiado ? "¡Enlace copiado!" : "Copiar enlace", icon: LinkIcon, color: "#3A4150" },
  ];
  return (
    <ModalCentrado onCerrar={onCerrar}>
      <div className="flex items-center justify-between">
        <div>
          <Etiqueta>Compartir</Etiqueta>
          <p className="text-[13px] mt-0.5" style={{ color: "#F2ECDD" }}>
            {titulo}
          </p>
        </div>
        <button onClick={onCerrar} aria-label="Cerrar">
          <X size={18} style={{ color: "#8A94A6" }} />
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
            <op.icon size={20} style={{ color: "#F2ECDD" }} />
            <span className="text-[11px]" style={{ color: "#F2ECDD" }}>
              {op.label}
            </span>
          </button>
        ))}
      </div>
    </ModalCentrado>
  );
}

function Encabezado({ esAdmin, setEsAdmin }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  return (
    <header
      className="sticky top-0 z-40 backdrop-blur border-b"
      style={{ backgroundColor: "rgba(18,21,28,0.9)", borderColor: "rgba(255,255,255,0.06)" }}
    >
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2">
          <img src={LOGO_IGLESIA} alt="Restauración y Avivamiento" className="h-9 w-auto object-contain" />
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[13px] font-medium tracking-wide"
              style={{ color: "#B7BFCC" }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setEsAdmin(!esAdmin)}
            className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: esAdmin ? "rgba(232,163,61,0.15)" : "rgba(255,255,255,0.06)",
              color: esAdmin ? "#E8A33D" : "#8A94A6",
            }}
          >
            <Settings size={11} />
            {esAdmin ? "Modo admin" : "Modo lector"}
          </button>
        </div>

        <button
          className="md:hidden"
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
        >
          {menuAbierto ? (
            <X size={22} style={{ color: "#F2ECDD" }} />
          ) : (
            <Menu size={22} style={{ color: "#F2ECDD" }} />
          )}
        </button>
      </div>

      {menuAbierto && (
        <div className="md:hidden px-5 pb-5 space-y-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuAbierto(false)}
              className="block pt-3 text-[14px] font-medium"
              style={{ color: "#F2ECDD" }}
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => {
              setEsAdmin(!esAdmin);
              setMenuAbierto(false);
            }}
            className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-full mt-2"
            style={{
              backgroundColor: esAdmin ? "rgba(232,163,61,0.15)" : "rgba(255,255,255,0.06)",
              color: esAdmin ? "#E8A33D" : "#8A94A6",
            }}
          >
            <Settings size={12} />
            {esAdmin ? "Modo admin" : "Modo lector"}
          </button>
        </div>
      )}
    </header>
  );
}

function Hero({ proximaReunion }) {
  const tieneFoto = Boolean(HERO_IMAGEN_URL);
  return (
    <section
      id="top"
      className="relative px-5 pt-24 pb-16 sm:pt-36 sm:pb-24 text-center overflow-hidden min-h-[80vh] sm:min-h-[88vh] flex items-center justify-center"
      style={
        tieneFoto
          ? {
              backgroundImage: `linear-gradient(180deg, rgba(11,13,18,0.55) 0%, rgba(11,13,18,0.75) 55%, #12151C 100%), url(${HERO_IMAGEN_URL})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : { backgroundColor: "#12151C" }
      }
    >
      {!tieneFoto && (
        <>
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(232,163,61,0.16) 0%, rgba(232,163,61,0) 70%)" }}
          />
          <div
            className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(62,92,70,0.25) 0%, rgba(62,92,70,0) 70%)" }}
          />
        </>
      )}

      <div className="relative max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 justify-center">
          <Sparkles size={14} style={{ color: "#E8A33D" }} />
          <Etiqueta>Bienvenido a nuestra comunidad</Etiqueta>
        </div>
        <h1
          className="text-4xl sm:text-6xl leading-tight"
          style={{ color: "#F2ECDD", fontFamily: "'Lora', serif" }}
        >
          Restauración y Avivamiento
        </h1>
        <p className="text-[15px] sm:text-lg leading-relaxed max-w-xl mx-auto" style={{ color: "#C7CEDA" }}>
          Un lugar para encontrarte con Dios, crecer en comunidad y enterarte de todo lo que pasa en la iglesia:
          reuniones, actividades y novedades, en un solo lugar.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href="#agenda"
            className="rounded-xl px-6 py-3.5 text-[14px] font-semibold shadow-lg"
            style={{ backgroundColor: "#E8A33D", color: "#241B0E" }}
          >
            Ver agenda de actividades
          </a>
          <a
            href="#novedades"
            className="rounded-xl px-6 py-3.5 text-[14px] font-medium border backdrop-blur"
            style={{ borderColor: "rgba(255,255,255,0.25)", color: "#F2ECDD", backgroundColor: "rgba(255,255,255,0.04)" }}
          >
            Ver novedades
          </a>
        </div>

        {proximaReunion && (
          <div
            className="mt-8 inline-flex items-center gap-3 rounded-xl px-4 py-3 mx-auto backdrop-blur"
            style={{ backgroundColor: "rgba(27,32,41,0.85)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#2A3140" }}>
              <Calendar size={16} style={{ color: "#E8A33D" }} />
            </div>
            <div className="text-left">
              <Etiqueta>Próxima actividad</Etiqueta>
              <p className="text-[13px] font-medium" style={{ color: "#F2ECDD" }}>
                {proximaReunion.titulo} · {proximaReunion.dia} · {proximaReunion.hora}
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
      style={{
        backgroundColor: activo ? "rgba(232,163,61,0.15)" : "rgba(255,255,255,0.06)",
        color: activo ? "#E8A33D" : "#8A94A6",
      }}
    >
      <Bell size={13} fill={activo ? "#E8A33D" : "none"} />
      {activo ? "Recordatorio activo" : "Avisarme"}
    </button>
  );
}

function TarjetaReunion({ r, toggleRecordar }) {
  return (
    <div className="rounded-xl overflow-hidden flex flex-col" style={{ backgroundColor: "#1B2029" }}>
      <ImagenConReserva src={r.imagen} alt={r.titulo} className="w-full aspect-[16/10]" />
      <div className="p-4 space-y-2 flex-1 flex flex-col">
        <p className="text-[14px] font-medium" style={{ color: "#F2ECDD" }}>
          {r.titulo}
        </p>
        <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "#8A94A6" }}>
          <Clock size={12} />
          {r.dia} · {r.hora}
        </div>
        <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "#8A94A6" }}>
          <MapPin size={12} />
          {r.lugar}
        </div>
        <div className="pt-1 mt-auto">
          <BotonRecordar activo={r.recordar} onClick={() => toggleRecordar(r.id)} />
        </div>
      </div>
    </div>
  );
}

function SeccionAgenda({ reuniones, toggleRecordar }) {
  const [destacada, ...resto] = reuniones;
  return (
    <section id="agenda" className="px-5 py-14 sm:py-20 scroll-mt-16" style={{ backgroundColor: "#0E1119" }}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <Etiqueta>Agenda</Etiqueta>
          <Titulo>Próximas actividades</Titulo>
          <p className="text-[14px] mt-2" style={{ color: "#8A94A6" }}>
            Cultos, escuelas y encuentros de la comunidad. Activá el recordatorio para no perdértelos.
          </p>
        </div>

        {reuniones.length === 0 ? (
          <p className="text-center text-[13px] py-8" style={{ color: "#5A6272" }}>
            Todavía no hay actividades cargadas.
          </p>
        ) : (
          <>
            <div
              className="rounded-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-2"
              style={{ backgroundColor: "#1B2029", boxShadow: "0 12px 30px rgba(0,0,0,0.3)" }}
            >
              <ImagenConReserva
                src={destacada.imagen}
                alt={destacada.titulo}
                className="w-full aspect-[16/10] sm:aspect-auto sm:h-full"
                iconSize={40}
              />
              <div className="p-6 sm:p-8 flex flex-col justify-center gap-3">
                <Etiqueta>Próxima actividad</Etiqueta>
                <h3 className="text-xl sm:text-2xl" style={{ color: "#F2ECDD", fontFamily: "'Lora', serif" }}>
                  {destacada.titulo}
                </h3>
                <div className="flex items-center gap-1.5 text-[13px]" style={{ color: "#B7BFCC" }}>
                  <Clock size={14} />
                  {destacada.dia} · {destacada.hora}
                </div>
                <div className="flex items-center gap-1.5 text-[13px]" style={{ color: "#B7BFCC" }}>
                  <MapPin size={14} />
                  {destacada.lugar}
                </div>
                <div className="pt-1">
                  <BotonRecordar activo={destacada.recordar} onClick={() => toggleRecordar(destacada.id)} />
                </div>
              </div>
            </div>

            {resto.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {resto.map((r) => (
                  <TarjetaReunion key={r.id} r={r} toggleRecordar={toggleRecordar} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function TarjetaNovedad({ n }) {
  return (
    <div className="rounded-xl overflow-hidden flex flex-col" style={{ backgroundColor: "#1B2029" }}>
      <ImagenConReserva src={n.imagen} alt={n.titulo} className="w-full aspect-[16/10]" />
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-[14px] font-medium" style={{ color: "#F2ECDD" }}>
          {n.titulo}
        </p>
        <p className="text-[13px] mt-1 leading-relaxed" style={{ color: "#B7BFCC" }}>
          {n.cuerpo}
        </p>
        <div className="flex items-center gap-2 mt-3 text-[11px]" style={{ color: "#5A6272" }}>
          <span>{n.autor}</span>
          <span>·</span>
          <span>{n.hace}</span>
        </div>
      </div>
    </div>
  );
}

function SeccionNovedades({ novedades, esAdmin, setMostrarForm }) {
  const [destacada, ...resto] = novedades;
  return (
    <section id="novedades" className="px-5 py-14 sm:py-20 scroll-mt-16">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <Etiqueta>Comunidad</Etiqueta>
          <Titulo>Novedades</Titulo>
          <p className="text-[14px] mt-2" style={{ color: "#8A94A6" }}>
            Todo lo que queremos contarte: inscripciones, cambios de horario y anuncios de la iglesia.
          </p>
        </div>

        {esAdmin && (
          <div className="flex justify-center">
            <button
              onClick={() => setMostrarForm(true)}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium"
              style={{ backgroundColor: "#E8A33D", color: "#241B0E" }}
            >
              <Plus size={16} />
              Publicar novedad
            </button>
          </div>
        )}

        {novedades.length === 0 ? (
          <p className="text-center text-[13px] py-8" style={{ color: "#5A6272" }}>
            Todavía no hay novedades publicadas.
          </p>
        ) : (
          <>
            <div
              className="rounded-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-2"
              style={{ backgroundColor: "#1B2029", boxShadow: "0 12px 30px rgba(0,0,0,0.3)" }}
            >
              <ImagenConReserva
                src={destacada.imagen}
                alt={destacada.titulo}
                className="w-full aspect-[16/10] sm:aspect-auto sm:h-full"
                iconSize={40}
              />
              <div className="p-6 sm:p-8 flex flex-col justify-center gap-2">
                <Etiqueta>Lo más reciente</Etiqueta>
                <h3 className="text-xl sm:text-2xl" style={{ color: "#F2ECDD", fontFamily: "'Lora', serif" }}>
                  {destacada.titulo}
                </h3>
                <p className="text-[14px] leading-relaxed" style={{ color: "#B7BFCC" }}>
                  {destacada.cuerpo}
                </p>
                <div className="flex items-center gap-2 text-[12px] pt-1" style={{ color: "#5A6272" }}>
                  <span>{destacada.autor}</span>
                  <span>·</span>
                  <span>{destacada.hace}</span>
                </div>
              </div>
            </div>

            {resto.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {resto.map((n) => (
                  <TarjetaNovedad key={n.id} n={n} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function TarjetaDevocionalDia({ devocional, leido, setLeido, racha }) {
  const [mostrarCompartir, setMostrarCompartir] = useState(false);
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Etiqueta>{devocional.fechaLabel}</Etiqueta>
        </div>
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
        style={{ backgroundColor: "#F7F3EA", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <Etiqueta>{devocional.referencia}</Etiqueta>
            <h3 className="text-lg mt-1" style={{ color: "#2A2620", fontFamily: "'Lora', serif" }}>
              {devocional.titulo}
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

        {devocional.audioUrl && <ReproductorAudio src={devocional.audioUrl} />}

        <blockquote
          className="text-[14px] leading-relaxed italic pl-3 border-l-2"
          style={{ color: "#4A4030", borderColor: "#D9B26B" }}
        >
          {devocional.versiculo}
        </blockquote>

        <div className="space-y-3 pt-1 border-t" style={{ borderColor: "#E4DCC8" }}>
          <SeccionDevocionalTexto etiqueta="Desarrollo">{devocional.desarrollo}</SeccionDevocionalTexto>
          <SeccionDevocionalTexto etiqueta="Oración">{devocional.oracion}</SeccionDevocionalTexto>
          <SeccionDevocionalTexto etiqueta="Aplicación" cursiva>
            {devocional.aplicacion}
          </SeccionDevocionalTexto>
        </div>
      </div>

      <button
        onClick={() => setLeido(!leido)}
        className="w-full rounded-xl py-3 flex items-center justify-center gap-2 text-[14px] font-medium transition-all"
        style={{
          backgroundColor: leido ? "#3E5C46" : "#E8A33D",
          color: leido ? "#DCEBDF" : "#241B0E",
        }}
      >
        <Check size={16} />
        {leido ? "Marcado como leído" : "Marcar como leído"}
      </button>

      {mostrarCompartir && (
        <ModalCompartir titulo={devocional.titulo} onCerrar={() => setMostrarCompartir(false)} />
      )}
    </div>
  );
}

function ArchivoDevocionales({ historial }) {
  const [temaActivo, setTemaActivo] = useState("Todos");
  const [mesActivo, setMesActivo] = useState("Todos");
  const [expandidoId, setExpandidoId] = useState(null);

  const temas = ["Todos", ...Array.from(new Set(historial.map((d) => d.tema)))];
  const meses = ["Todos", ...Array.from(new Set(historial.map((d) => d.mes)))];

  const filtrados = historial.filter(
    (d) => (temaActivo === "Todos" || d.tema === temaActivo) && (mesActivo === "Todos" || d.mes === mesActivo)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {temas.map((t) => (
            <button
              key={t}
              onClick={() => setTemaActivo(t)}
              className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium"
              style={{
                backgroundColor: temaActivo === t ? "#E8A33D" : "#1B2029",
                color: temaActivo === t ? "#241B0E" : "#8A94A6",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative sm:w-56 shrink-0">
          <select
            value={mesActivo}
            onChange={(e) => setMesActivo(e.target.value)}
            className="w-full appearance-none rounded-xl px-3 py-2.5 text-[13px] pr-9"
            style={{ backgroundColor: "#1B2029", color: "#F2ECDD" }}
          >
            {meses.map((m) => (
              <option key={m} value={m}>
                {m === "Todos" ? "Todos los meses" : m}
              </option>
            ))}
          </select>
          <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#8A94A6" }} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {filtrados.length === 0 && (
          <p className="text-[13px] text-center py-8 sm:col-span-2" style={{ color: "#5A6272" }}>
            No hay devocionales para este filtro.
          </p>
        )}
        {filtrados.map((d) => {
          const abierto = expandidoId === d.id;
          return (
            <div key={d.id} className="rounded-xl overflow-hidden self-start" style={{ backgroundColor: "#1B2029" }}>
              <button
                onClick={() => setExpandidoId(abierto ? null : d.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left gap-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#2A3140" }}>
                    <BookOpen size={15} style={{ color: "#E8A33D" }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium" style={{ color: "#F2ECDD" }}>
                      {d.titulo}
                    </p>
                    <p className="text-[11px]" style={{ color: "#8A94A6" }}>
                      {d.fechaLabel || d.fecha} · {d.tema} · {d.referencia}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  size={15}
                  className="shrink-0"
                  style={{ color: "#5A6272", transform: abierto ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                />
              </button>
              {abierto && (
                <div className="px-4 pb-4 space-y-2">
                  <blockquote className="text-[13px] italic pl-3 border-l-2" style={{ color: "#C9B892", borderColor: "#E8A33D" }}>
                    {d.versiculo}
                  </blockquote>
                  <p className="text-[12px] leading-relaxed" style={{ color: "#B7BFCC" }}>
                    {d.extracto}
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

function SeccionDevocional({ devocional, leido, setLeido, racha, historial }) {
  const [mostrarArchivo, setMostrarArchivo] = useState(false);
  return (
    <section id="devocional" className="px-5 py-14 sm:py-20 scroll-mt-16" style={{ backgroundColor: "#0E1119" }}>
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <Etiqueta>Cada día</Etiqueta>
          <Titulo>Devocional del día</Titulo>
        </div>

        <TarjetaDevocionalDia devocional={devocional} leido={leido} setLeido={setLeido} racha={racha} />

        <div className="text-center">
          <button
            onClick={() => setMostrarArchivo(!mostrarArchivo)}
            className="text-[13px] font-medium underline underline-offset-4"
            style={{ color: "#E8A33D" }}
          >
            {mostrarArchivo ? "Ocultar archivo de devocionales" : "Ver archivo de devocionales anteriores"}
          </button>
        </div>

        {mostrarArchivo && <ArchivoDevocionales historial={historial} />}
      </div>
    </section>
  );
}

function FormularioNuevaNovedad({ onCerrar, onPublicar }) {
  const [titulo, setTitulo] = useState("");
  const [cuerpo, setCuerpo] = useState("");
  const [imagen, setImagen] = useState("");
  return (
    <ModalCentrado onCerrar={onCerrar}>
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-medium" style={{ color: "#F2ECDD" }}>
          Nueva novedad
        </h2>
        <button onClick={onCerrar} aria-label="Cerrar">
          <X size={20} style={{ color: "#F2ECDD" }} />
        </button>
      </div>
      <div className="space-y-3">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título"
          className="w-full rounded-lg px-3 py-2.5 text-[14px] outline-none"
          style={{ backgroundColor: "#12151C", color: "#F2ECDD" }}
        />
        <textarea
          value={cuerpo}
          onChange={(e) => setCuerpo(e.target.value)}
          placeholder="¿Qué querés anunciar?"
          rows={5}
          className="w-full rounded-lg px-3 py-2.5 text-[14px] outline-none resize-none"
          style={{ backgroundColor: "#12151C", color: "#F2ECDD" }}
        />
        <div className="flex items-center gap-2 rounded-lg px-3 py-2.5" style={{ backgroundColor: "#12151C" }}>
          <ImageIcon size={15} style={{ color: "#5A6272" }} className="shrink-0" />
          <input
            value={imagen}
            onChange={(e) => setImagen(e.target.value)}
            placeholder="Link a una foto (opcional)"
            className="w-full bg-transparent text-[14px] outline-none"
            style={{ color: "#F2ECDD" }}
          />
        </div>
      </div>
      <button
        onClick={() => {
          if (titulo.trim()) onPublicar(titulo, cuerpo, imagen);
        }}
        className="w-full rounded-xl py-3 text-[14px] font-medium"
        style={{ backgroundColor: "#E8A33D", color: "#241B0E" }}
      >
        Publicar
      </button>
    </ModalCentrado>
  );
}

function Footer() {
  const redes = [
    { url: CONTACTO_INSTAGRAM, icon: Instagram, label: "Instagram" },
    { url: CONTACTO_FACEBOOK, icon: Facebook, label: "Facebook" },
    { url: CONTACTO_YOUTUBE, icon: Youtube, label: "YouTube" },
  ].filter((r) => r.url);

  return (
    <footer className="px-5 pt-12 pb-8 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-5 text-center">
        <img src={LOGO_IGLESIA} alt="Restauración y Avivamiento" className="h-12 w-auto object-contain" />

        {CONTACTO_DIRECCION && (
          <a
            href={CONTACTO_MAPA_URL || undefined}
            className="flex items-center gap-1.5 text-[13px]"
            style={{ color: "#8A94A6" }}
          >
            <MapPin size={14} />
            {CONTACTO_DIRECCION}
          </a>
        )}

        {redes.length > 0 && (
          <div className="flex items-center gap-4">
            {redes.map((r) => (
              <a key={r.label} href={r.url} aria-label={r.label} style={{ color: "#8A94A6" }}>
                <r.icon size={20} />
              </a>
            ))}
          </div>
        )}

        <p className="text-[11px]" style={{ color: "#5A6272" }}>
          © {new Date().getFullYear()} Restauración y Avivamiento
        </p>
      </div>
    </footer>
  );
}

function BotonWhatsApp() {
  if (!CONTACTO_WHATSAPP) return null;
  return (
    <a
      href={CONTACTO_WHATSAPP}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-30 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
      style={{ backgroundColor: "#3E5C46" }}
      aria-label="Escribinos por WhatsApp"
    >
      <MessageCircle size={22} style={{ color: "#F2ECDD" }} />
    </a>
  );
}

export default function AppRestauracion() {
  const [leido, setLeido] = useState(false);
  const [racha, setRacha] = useState(0);
  const [devocional, setDevocional] = useState(DEVOCIONAL_EJEMPLO);
  const [historial, setHistorial] = useState(HISTORIAL_EJEMPLO);
  const [reuniones, setReuniones] = useState(REUNIONES_EJEMPLO);
  const [novedades, setNovedades] = useState(NOVEDADES_EJEMPLO);
  const [usandoEjemplo, setUsandoEjemplo] = useState(true);
  const [esAdmin, setEsAdmin] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);

  useEffect(() => {
    const { racha: r, leidoHoy } = cargarRacha();
    setRacha(r);
    setLeido(leidoHoy);
  }, []);

  useEffect(() => {
    let activo = true;
    async function cargarDatos() {
      const [filasDevo, filasReu, filasNov] = await Promise.all([
        fetchSheet("/api/devocionales"),
        fetchSheet("/api/reuniones"),
        fetchSheet("/api/novedades"),
      ]);
      if (!activo) return;
      let huboDatosReales = false;

      if (filasDevo && filasDevo.length) {
        const mapeados = filasDevo.map(mapDevocional).filter((d) => d.titulo);
        if (mapeados.length) {
          const ordenados = [...mapeados].sort((a, b) => (b.fecha || 0) - (a.fecha || 0));
          setHistorial(ordenados);
          setDevocional(elegirDevocionalDeHoy(mapeados) || ordenados[0]);
          huboDatosReales = true;
        }
      }
      if (filasReu && filasReu.length) {
        const mapeados = filasReu.map(mapReunion).filter((r) => r.titulo);
        if (mapeados.length) {
          setReuniones(mapeados.sort((a, b) => (a.fecha || 0) - (b.fecha || 0)));
          huboDatosReales = true;
        }
      }
      if (filasNov && filasNov.length) {
        const mapeados = filasNov.map(mapNovedad).filter((n) => n.titulo).reverse();
        if (mapeados.length) {
          setNovedades(mapeados);
          huboDatosReales = true;
        }
      }
      setUsandoEjemplo(!huboDatosReales);
    }
    cargarDatos();
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
    setReuniones(reuniones.map((r) => (r.id === id ? { ...r, recordar: !r.recordar } : r)));
  };

  const publicarNovedad = (titulo, cuerpo, imagen) => {
    setNovedades([
      { id: Date.now(), titulo, cuerpo: cuerpo || "—", autor: "Vos (admin)", imagen: imagen || "", hace: "ahora" },
      ...novedades,
    ]);
    setMostrarForm(false);
  };

  return (
    <div style={{ backgroundColor: "#12151C" }}>
      <Encabezado esAdmin={esAdmin} setEsAdmin={setEsAdmin} />

      {esAdmin && usandoEjemplo && (
        <div className="px-5 pt-4">
          <div
            className="max-w-6xl mx-auto px-3 py-1.5 rounded-lg text-[11px] text-center"
            style={{ backgroundColor: "rgba(193,80,46,0.15)", color: "#E0876A" }}
          >
            Mostrando contenido de ejemplo — conectá las planillas en config.js
          </div>
        </div>
      )}

      <main>
        <Hero proximaReunion={reuniones[0]} />
        <SeccionAgenda reuniones={reuniones} toggleRecordar={toggleRecordar} />
        <SeccionNovedades novedades={novedades} esAdmin={esAdmin} setMostrarForm={setMostrarForm} />
        <SeccionDevocional devocional={devocional} leido={leido} setLeido={marcarLeido} racha={racha} historial={historial} />
      </main>

      <Footer />
      <BotonWhatsApp />

      {mostrarForm && <FormularioNuevaNovedad onCerrar={() => setMostrarForm(false)} onPublicar={publicarNovedad} />}
    </div>
  );
}
