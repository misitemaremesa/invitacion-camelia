import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CountdownTimer from "./CountdownTimer";

export default function InvitacionMiaFernanda() {
  // =========================
  // EDITABLE DATA
  // =========================
  const DATA = useMemo(
    () => ({
      festejada: "Mía Fernanda",
      edad: "8 Años",
      fecha: "Domingo, 05 de abril 2026",
      hora: "2:00 p.m.",
      lugar: "21 de Marzo, Guelatao 132, 71228 Santa Lucía del Camino, Oax.",
      mapsLink: "https://share.google/J7Vn0EB9LgaVYxK1U",
      eventISO: "2026-04-05T14:00:00-06:00",
    }),
    []
  );

  const calendarLink = useMemo(() => {
    const title = encodeURIComponent("Cumpleaños de Camelia");
    const details = encodeURIComponent(
      "Acompáñanos a celebrar el cumpleaños de Camelia."
    );
    const location = encodeURIComponent(DATA.lugar);

    // 05 abril 2026 2:00 p.m. (UTC-6) => 20:00Z
    const start = "20260405T200000Z";
    const end = "20260405T230000Z";

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
  }, [DATA.lugar, DATA.padres]);

  // =========================
  // VIDEO + AUDIO SETTINGS
  // =========================
  const INTRO_IMAGE_SRC = "/intro_01.png"; // public/intro_01.png
  const PLAY_IMAGE_SRC = "/dale_paly.png"; // public/dale_paly.png
  const YOUTUBE_VIDEO_ID = "dwL2zgUApK8";
  const YOUTUBE_EMBED_SRC = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&start=7&mute=1&controls=1&rel=0&playsinline=1`;
  const AUDIO_SRC = "/tema.mp3"; // public/tema.mp3 (sin audio en el video)

  const [phase, setPhase] = useState("intro"); // "intro" | "video" | "invite"

  // caption overlay (aparece 1s después de iniciar reproducción)
  const [showVideoCaption, setShowVideoCaption] = useState(false);

  // transiciones suaves
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [inviteVisible, setInviteVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef(null);
  const captionTimeoutRef = useRef(null);
  const autoInviteTimeoutRef = useRef(null);

  const clearCaptionTimer = useCallback(() => {
    if (captionTimeoutRef.current) {
      window.clearTimeout(captionTimeoutRef.current);
      captionTimeoutRef.current = null;
    }
  }, []);


  const clearAutoInviteTimer = useCallback(() => {
    if (autoInviteTimeoutRef.current) {
      window.clearTimeout(autoInviteTimeoutRef.current);
      autoInviteTimeoutRef.current = null;
    }
  }, []);

  const scheduleCaption = useCallback(() => {
    clearCaptionTimer();
    setShowVideoCaption(false);
    captionTimeoutRef.current = window.setTimeout(() => {
      setShowVideoCaption(true);
    }, 1000);
  }, [clearCaptionTimer]);

  const startAudio = useCallback(async () => {
    const a = audioRef.current;
    if (!a || isMuted) return;

    // no reiniciar si ya está sonando
    if (!a.paused) return;

    try {
      a.volume = 0.7; // ajusta a gusto
      await a.play();
    } catch {
      // Autoplay puede ser bloqueado (normal en móviles). Se intentará de nuevo con interacción.
    }
  }, [isMuted]);

  const goInvite = useCallback(() => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    clearCaptionTimer();
    clearAutoInviteTimer();
    setShowVideoCaption(false);

    // Fade-out overlay primero, luego mostramos invitación con fade-in
    window.setTimeout(() => {
      setPhase("invite");
      requestAnimationFrame(() => setInviteVisible(true));
      window.setTimeout(() => setIsTransitioning(false), 500);
    }, 450);
  }, [clearAutoInviteTimer, clearCaptionTimer, isTransitioning]);

  const startExperience = useCallback(async () => {
    setPhase("video");
    scheduleCaption();
    await startAudio();
  }, [scheduleCaption, startAudio]);

  // Preparar audio y avance automático cuando entramos a fase video
  useEffect(() => {
    if (phase !== "video") return;

    startAudio();
    clearAutoInviteTimer();

    // Inicia en 00:07 y dura hasta 00:15 => 8s
    autoInviteTimeoutRef.current = window.setTimeout(() => {
      goInvite();
    }, 8_000);

    return () => {
      clearCaptionTimer();
      clearAutoInviteTimer();
    };
  }, [clearAutoInviteTimer, clearCaptionTimer, goInvite, phase, startAudio]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    a.muted = isMuted;

    if (!isMuted && a.paused) {
      a.volume = 0.7;
      a.play().catch(() => {
        // Puede requerir interacción del usuario en algunos navegadores.
      });
    }
  }, [isMuted]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const pauseAudio = () => {
      a.pause();
    };

    const resumeAudioIfAllowed = () => {
      if (isMuted) return;
      a.volume = 0.7;
      a.play().catch(() => {
        // Puede requerir interacción del usuario en algunos navegadores.
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseAudio();
        return;
      }

      resumeAudioIfAllowed();
    };

    const handleWindowBlur = () => {
      pauseAudio();
    };

    const handleWindowFocus = () => {
      if (document.hidden) return;
      resumeAudioIfAllowed();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [isMuted]);

  useEffect(() => {
    if (isMuted || phase !== "video") return;

    const unlockAudioOnInteraction = () => {
      startAudio();
    };

    window.addEventListener("pointerdown", unlockAudioOnInteraction, {
      passive: true,
      once: true,
    });
    window.addEventListener("keydown", unlockAudioOnInteraction, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlockAudioOnInteraction);
      window.removeEventListener("keydown", unlockAudioOnInteraction);
    };
  }, [isMuted, phase, startAudio]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-950 via-sky-900 to-slate-950 text-white overflow-hidden">
      {/* Audio global: continúa después del video */}
      <audio ref={audioRef} src={AUDIO_SRC} loop preload="auto" muted={isMuted} />

      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute top-40 left-8 h-56 w-56 rounded-full bg-cyan-300/15 blur-3xl" />
        <div className="absolute top-72 right-6 h-64 w-64 rounded-full bg-indigo-300/10 blur-3xl" />
      </div>

      {/* Snow layer */}
      <SnowLayer />

      {/* =========================
          PHASE 0: INTRO CARD
         ========================= */}
      {phase === "intro" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-slate-950/80 p-5 shadow-2xl">
            <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/15" />
            <div className="pointer-events-none absolute -inset-1 rounded-3xl opacity-70 [mask-image:radial-gradient(220px_220px_at_50%_0%,black,transparent)]">
              <div className="h-full w-full animate-shimmer bg-gradient-to-r from-white/0 via-white/15 to-white/0" />
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/55 p-3">
                <img
                  src={INTRO_IMAGE_SRC}
                  alt="Personajes de Frozen"
                  className="mx-auto max-h-[380px] w-full object-contain"
                />
              </div>

              <div className="mt-5 rounded-2xl border border-cyan-200/20 bg-slate-900/55 p-3">
                <img
                  src={PLAY_IMAGE_SRC}
                  alt="Dale play"
                  className="mx-auto h-auto w-full max-w-[280px] object-contain"
                />
              </div>

              <button
                onClick={startExperience}
                className="mt-5 w-full rounded-2xl border border-cyan-200/25 bg-cyan-300/15 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-cyan-300/25 active:scale-[0.99]"
              >
                Iniciar aventura ❄️
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          PHASE 1: VIDEO OVERLAY
         ========================= */}
      {phase === "video" && (
        <div
          className={[
            "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 transition-opacity duration-500",
            isTransitioning ? "opacity-0" : "opacity-100",
          ].join(" ")}
        >
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-slate-950/70 shadow-2xl">
            {/* Frost border shimmer */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/15" />
            <div className="pointer-events-none absolute -inset-1 rounded-3xl opacity-70 [mask-image:radial-gradient(180px_180px_at_50%_0%,black,transparent)]">
              <div className="h-full w-full animate-shimmer bg-gradient-to-r from-white/0 via-white/15 to-white/0" />
            </div>

            <div className="p-4">
              {/* Botón "Saltar" flotante, discreto */}
              <button
                onClick={goInvite}
                className="absolute right-4 top-4 z-10 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs text-white/90 backdrop-blur hover:bg-black/40 active:scale-[0.99]"
              >
                Saltar
              </button>

              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
                <div className="relative w-full aspect-[9/16]">
                  <iframe
                    src={YOUTUBE_EMBED_SRC}
                    title="Video de invitación"
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />

                  {/* Caption overlay (mágico + grande) */}
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <div
                      className={[
                        "relative mx-auto w-fit max-w-[92%] overflow-hidden rounded-2xl border border-white/15 bg-black/45 px-5 py-3 text-center text-3xl sm:text-4xl font-extrabold leading-tight text-white backdrop-blur",
                        "transition-all duration-700 ease-out",
                        showVideoCaption
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-3",
                      ].join(" ")}
                    >
                      <span className="relative z-10">
                        ¡Estás invitado a una aventura congelada!
                      </span>
                      <span className="pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(220px_60px_at_50%_0%,black,transparent)]">
                        <span className="block h-full w-full animate-shimmer bg-gradient-to-r from-white/0 via-white/20 to-white/0" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* =========================
          PHASE 2/3: INVITATION MOBILE
         ========================= */}
      <main
        className={[
          "relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-8 transition-all duration-700",
          phase === "invite" && inviteVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2",
        ].join(" ")}
      >
        {/* Card */}
        <section className="relative mt-4 overflow-hidden rounded-3xl border border-white/15 bg-white/5 shadow-2xl">
          {/* Frost frame */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/15" />
          <div className="pointer-events-none absolute -inset-1 rounded-3xl opacity-70 [mask-image:radial-gradient(220px_220px_at_50%_0%,black,transparent)]">
            <div className="h-full w-full animate-shimmer bg-gradient-to-r from-white/0 via-white/15 to-white/0" />
          </div>

          <div className="relative p-6">
            {/* Header con imagen + nombre/edad dentro del cuadro */}
            <AuroraHeader />

            {/* Divider */}
            <div className="my-6 flex items-center justify-center gap-3">
              <div className="h-px w-16 bg-white/15" />
              <SnowflakeIcon className="h-5 w-5 text-white/70" />
              <div className="h-px w-16 bg-white/15" />
            </div>

            {/* Details */}
            <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <InfoRow label="📅 Fecha" value={DATA.fecha} />
              <InfoRow label="⏰ Hora" value={DATA.hora} />
              <InfoRow label="📍 Lugar" value={DATA.lugar} />
              <InfoRow
                label="💌 Invitados por"
                value={DATA.padres}
                stacked
              />
            </div>

            <CountdownTimer targetISO={DATA.eventISO} />

            {/* CTA */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <a
                href={calendarLink}
                target="_blank"
                rel="noreferrer"
                className="block w-full rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-center text-sm font-semibold text-white hover:bg-white/15 active:scale-[0.99]"
              >
                Agregar al calendario 📅
              </a>
              <a
                href={DATA.mapsLink}
                target="_blank"
                rel="noreferrer"
                className="block w-full rounded-2xl border border-emerald-200/25 bg-emerald-300/15 px-5 py-4 text-center text-sm font-semibold text-white hover:bg-emerald-300/25 active:scale-[0.99]"
              >
                Ver en Google Maps 📍
              </a>
            </div>

            <div className="mt-4">
              <div className="relative mx-auto w-full max-w-[360px] overflow-hidden rounded-2xl border border-cyan-100/20 bg-slate-900/40">
                <img
                  src="/part3.png"
                  alt="Marco no faltes"
                  className="h-auto w-full object-contain"
                  loading="lazy"
                />

                <div className="absolute left-1/2 top-[42%] aspect-square w-[56%] max-w-[210px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full px-3 py-4">
                  <img
                    src="/no_faltes.png"
                    alt="No faltes"
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                </div>

                <div className="absolute inset-x-0 top-[83%] flex -translate-y-1/2 justify-center px-6">
                  <div className="w-[30%] max-w-[110px] overflow-hidden rounded-[38%]">
                    <img
                      src="/mia_01.png"
                      alt="Camelia en placa"
                      className="h-auto w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-white/80">
                ¡Camelia está emocionada por celebrar contigo!
              </p>

              <a
                href="https://wa.me/529514121200?text=Hola%2C%20confirmo%20mi%20asistencia%20al%20cumplea%C3%B1os%20de%20Camelia%20%F0%9F%8E%89"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block w-full rounded-2xl border border-green-200/25 bg-green-400/20 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-green-400/30 active:scale-[0.99]"
              >
                Confirmar asistencia por WhatsApp ✅
              </a>
            </div>
          </div>
        </section>

        <div className="h-10" />
      </main>

      <button
        onClick={() => setIsMuted((prev) => !prev)}
        className="fixed bottom-5 right-5 z-40 rounded-full border border-white/20 bg-slate-900/70 px-4 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur hover:bg-slate-800/80 active:scale-[0.98]"
        aria-label={isMuted ? "Activar música" : "Silenciar música"}
      >
        {isMuted ? "🔇 Música" : "🔊 Música"}
      </button>


      {/* Keyframes (solo en este componente) */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-30%); }
          100% { transform: translateX(30%); }
        }
        .animate-shimmer {
          animation: shimmer 2.8s ease-in-out infinite;
        }


        @keyframes stickerPopIn {
          0% { opacity: 0; transform: translateY(10px) scale(0.9); }
          70% { opacity: 1; transform: translateY(0) scale(1.03); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .sticker-pop-in {
          animation: stickerPopIn 800ms ease-out both;
        }
        .sticker-pop-in-delay {
          animation: stickerPopIn 950ms ease-out 180ms both;
        }

        @keyframes snow {
          0% { transform: translateY(-10%); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(120vh); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

/* =========================
   UI Subcomponents
   ========================= */

function InfoRow({ label, value, stacked = false }) {
  return (
    <div
      className={[
        "flex items-start gap-3",
        stacked ? "flex-col" : "justify-between",
      ].join(" ")}
    >
      <span className="text-sm text-white/70">{label}</span>
      <span className={[
        "text-sm font-medium text-white",
        stacked ? "text-left" : "text-right",
      ].join(" ")}>
        {value}
      </span>
    </div>
  );
}

function getTimeRemaining(targetISO) {
  const targetMs = new Date(targetISO).getTime();
  const nowMs = Date.now();
  const diff = targetMs - nowMs;

  if (Number.isNaN(targetMs) || diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, done: false };
}

function CountdownTimer({ targetISO }) {
  const [remaining, setRemaining] = useState(() => getTimeRemaining(targetISO));

  useEffect(() => {
    const tick = () => {
      setRemaining(getTimeRemaining(targetISO));
    };

    tick();
    const timer = window.setInterval(tick, 1000);

    return () => window.clearInterval(timer);
  }, [targetISO]);

  return (
    <div className="mt-4 rounded-2xl border border-cyan-100/20 bg-slate-900/40 p-4">
      <p className="text-center text-sm font-semibold text-cyan-100">
        ⏳ Cuenta regresiva para la fiesta
      </p>

      {remaining.done ? (
        <p className="mt-2 text-center text-sm text-white">
          ¡La fiesta ya comenzó! 🎉
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          <TimeBox label="Días" value={remaining.days} />
          <TimeBox label="Horas" value={remaining.hours} />
          <TimeBox label="Min" value={remaining.minutes} />
          <TimeBox label="Seg" value={remaining.seconds} />
        </div>
      )}
    </div>
  );
}

function TimeBox({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-2 py-3">
      <p className="text-xl font-extrabold leading-none text-white">
        {String(value).padStart(2, "0")}
      </p>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-white/70">
        {label}
      </p>
    </div>
  );
}

function getTimeRemaining(targetISO) {
  const targetMs = new Date(targetISO).getTime();
  const nowMs = Date.now();
  const diff = targetMs - nowMs;

  if (Number.isNaN(targetMs) || diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, done: false };
}

function CountdownTimer({ targetISO }) {
  const [remaining, setRemaining] = useState(() => getTimeRemaining(targetISO));

  useEffect(() => {
    const tick = () => {
      setRemaining(getTimeRemaining(targetISO));
    };

    tick();
    const timer = window.setInterval(tick, 1000);

    return () => window.clearInterval(timer);
  }, [targetISO]);

  return (
    <div className="mt-4 rounded-2xl border border-cyan-100/20 bg-slate-900/40 p-4">
      <p className="text-center text-sm font-semibold text-cyan-100">
        ⏳ Cuenta regresiva para la fiesta
      </p>

      {remaining.done ? (
        <p className="mt-2 text-center text-sm text-white">
          ¡La fiesta ya comenzó! 🎉
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          <TimeBox label="Días" value={remaining.days} />
          <TimeBox label="Horas" value={remaining.hours} />
          <TimeBox label="Min" value={remaining.minutes} />
          <TimeBox label="Seg" value={remaining.seconds} />
        </div>
      )}
    </div>
  );
}

function TimeBox({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-2 py-3">
      <p className="text-xl font-extrabold leading-none text-white">
        {String(value).padStart(2, "0")}
      </p>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-white/70">
        {label}
      </p>
    </div>
  );
}

function AuroraHeader() {
  return (
    <div className="relative mx-auto w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/30">
      <div className="relative h-[34rem] sm:h-[38rem] overflow-hidden">
        <img
          src="/fond_01_complet.jpg"
          alt="Marco de Frozen"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />

        {/* Overlay suave para mejorar legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/25" />

        {/* Stickers posicionados dentro del pizarrón */}
        <div className="absolute inset-0">
          <div className="absolute inset-x-0 top-[43%] flex -translate-y-1/2 justify-center px-4">
            <img
              src="/mia_01.png"
              alt="Camelia"
              className="sticker-pop-in w-[68%] max-w-[340px] object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.55)]"
              loading="eager"
            />
          </div>

          <div className="absolute inset-x-0 top-[67%] flex -translate-y-1/2 justify-center px-4">
            <img
              src="/cumple_01.png"
              alt="Cumple 8 años"
              className="sticker-pop-in-delay w-[74%] max-w-[360px] object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.55)]"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SnowflakeIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M12 2v20M4 6l16 12M20 6L4 18M7 3l2 3M15 3l-2 3M7 21l2-3M15 21l-2-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================
   Snow animation (pure CSS)
   ========================= */

function SnowLayer() {
  // 18 flakes, deterministic layout
  const flakes = Array.from({ length: 18 }).map((_, i) => {
    const left = (i * 100) / 18; // %
    const size = 6 + (i % 6) * 2; // px
    const duration = 8 + (i % 7); // s
    const delay = -(i % 9); // start mid-animation
    const opacity = 0.25 + (i % 5) * 0.12;
    return { left, size, duration, delay, opacity, i };
  });

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {flakes.map((f) => (
        <span
          key={f.i}
          className="absolute -top-10 rounded-full bg-white"
          style={{
            left: `${f.left}%`,
            width: `${f.size}px`,
            height: `${f.size}px`,
            opacity: f.opacity,
            filter: "blur(0.2px)",
            animation: `snow ${f.duration}s linear infinite`,
            animationDelay: `${f.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
