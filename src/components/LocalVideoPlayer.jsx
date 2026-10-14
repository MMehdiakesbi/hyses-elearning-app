'use client';

import { useEffect, useRef, useState } from 'react';

// Lecteur vidéo LOCAL : anti-triche + reprise auto + navigation dans le déjà-vu.
//  - On PEUT reculer / cliquer dans la partie DÉJÀ regardée (pour revoir une info).
//  - On NE PEUT PAS avancer au-delà de ce qui a déjà été vu (anti-triche).
//  - Reprise automatique là où le stagiaire s'était arrêté (mémorisé navigateur).
//  - endAt (s) : coupe la vidéo à ce moment (ex. fin avant écran noir).
//  - Bouton lecture/pause + plein écran maison.
export default function LocalVideoPlayer({ src, onComplete, endAt = 0 }) {
  const videoRef = useRef(null);
  const frameRef = useRef(null);
  const barRef = useRef(null);
  const maxWatched = useRef(0);
  const completedRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);       // position courante (s)
  const [seen, setSeen] = useState(0);      // max déjà vu (s)
  const [dur, setDur] = useState(0);        // durée utile (endAt ou durée réelle)
  const [isFs, setIsFs] = useState(false);
  const [errored, setErrored] = useState(false);

  const finish = () => {
    if (!completedRef.current) {
      completedRef.current = true;
      onComplete && onComplete();
    }
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const KEY = 'hyses_vpos_local_' + src;
    let saved = { pos: 0, max: 0 };
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) saved = JSON.parse(raw) || saved;
    } catch {}
    maxWatched.current = Math.max(saved.max || 0, saved.pos || 0);
    setSeen(maxWatched.current);
    let lastSave = 0;

    const limit = () => (endAt && endAt > 0 ? endAt : v.duration || 0);

    const onLoaded = () => {
      const d = limit();
      setDur(d);
      let resume = saved.pos || 0;
      if (d > 0 && resume > d - 3) resume = 0; // ne pas reprendre pile à la fin
      if (resume > 0) {
        try { v.currentTime = resume; } catch {}
      }
    };

    const onTime = () => {
      const t = v.currentTime || 0;
      const d = limit();
      setCur(t);
      if (t > maxWatched.current) {
        maxWatched.current = t;
        setSeen(t);
      }
      const now = Date.now();
      if (now - lastSave > 1500) {
        lastSave = now;
        try { localStorage.setItem(KEY, JSON.stringify({ pos: t, max: maxWatched.current })); } catch {}
      }
      if (d > 0 && t >= d) {
        v.pause();
        try { v.currentTime = d; } catch {}
        finish();
      } else if (d > 0 && maxWatched.current >= d * 0.95) {
        finish();
      }
    };
    // Anti-triche : seuls les sauts EN AVANT au-delà du déjà-vu sont annulés.
    const onSeeking = () => {
      const d = limit();
      const cap = Math.min(maxWatched.current, d || maxWatched.current);
      if (v.currentTime > cap + 0.5) v.currentTime = cap; // reculer = autorisé
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => finish();
    const onError = () => setErrored(true);
    const onFsChange = () => setIsFs(Boolean(document.fullscreenElement));

    v.addEventListener('loadedmetadata', onLoaded);
    if (v.readyState >= 1) onLoaded();
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('seeking', onSeeking);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('ended', onEnded);
    v.addEventListener('error', onError);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => {
      v.removeEventListener('loadedmetadata', onLoaded);
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('seeking', onSeeking);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('ended', onEnded);
      v.removeEventListener('error', onError);
      document.removeEventListener('fullscreenchange', onFsChange);
    };
  }, [src, endAt, onComplete]);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play(); else v.pause();
  }
  function toggleFullscreen() {
    const el = frameRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
    } else {
      (el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen)?.call(el);
    }
  }
  // Clic sur la barre : on se déplace, mais jamais au-delà du déjà-vu.
  function seekFromBar(e) {
    const v = videoRef.current;
    const bar = barRef.current;
    if (!v || !bar || !dur) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const target = Math.min(ratio * dur, maxWatched.current); // plafonné au vu
    try { v.currentTime = target; } catch {}
  }

  const pctCur = dur ? Math.min(100, (cur / dur) * 100) : 0;
  const pctSeen = dur ? Math.min(100, (seen / dur) * 100) : 0;
  const fmt = (s) => {
    s = Math.max(0, Math.floor(s || 0));
    const m = Math.floor(s / 60);
    const r = String(s % 60).padStart(2, '0');
    return `${m}:${r}`;
  };

  return (
    <div className="ytwrap">
      <div className="ytframe" ref={frameRef}>
        <video
          ref={videoRef}
          src={src}
          playsInline
          preload="metadata"
          onContextMenu={(e) => e.preventDefault()}
        />
        <button
          type="button"
          className={'ytcover' + (playing ? ' playing' : '')}
          onClick={togglePlay}
          aria-label={playing ? 'Pause' : 'Lecture'}
        >
          {!playing && (
            <span className="ytplay">
              <svg width="26" height="26" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </span>
          )}
        </button>
        <button
          type="button"
          className="ytfs-btn"
          onClick={toggleFullscreen}
          aria-label="Plein écran"
        >
          {isFs ? '✕ Quitter' : '⛶ Plein écran'}
        </button>
      </div>

      {/* Barre de navigation : cliquable uniquement dans la zone déjà vue. */}
      <div
        ref={barRef}
        onClick={seekFromBar}
        className="vbar"
        title="Vous pouvez revoir la partie déjà regardée"
      >
        <div className="vbar-track" />
        {/* zone déjà vue (navigable) */}
        <div className="vbar-seen" style={{ width: `${pctSeen}%` }} />
        {/* progression courante */}
        <div className="vbar-cur" style={{ width: `${pctCur}%` }} />
        {/* curseur */}
        <div className="vbar-knob" style={{ left: `calc(${pctCur}% - 6px)` }} />
      </div>

      <div className="ytnote mono" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>
          {errored
            ? '⚠ Vidéo momentanément indisponible — rechargez la page ou contactez Contact.hyses@gmail.com'
            : seen >= (dur ? dur * 0.95 : Infinity)
              ? '✓ Vidéo visionnée — vous pouvez revoir librement'
              : 'Vous pouvez reculer pour revoir ; impossible d’avancer plus loin'}
        </span>
        <span>{fmt(cur)} / {fmt(dur)}</span>
      </div>
    </div>
  );
}
