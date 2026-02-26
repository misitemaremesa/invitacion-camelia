import React, { useEffect, useState } from "react";

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

export default function CountdownTimer({ targetISO }) {
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
