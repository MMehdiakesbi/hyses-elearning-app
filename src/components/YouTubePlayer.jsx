'use client';

import { useEffect, useRef, useState } from 'react';

// Lecteur YouTube : anti-triche + reprise auto + navigation dans le déjà-vu.
//  - On PEUT reculer / cliquer dans la partie DÉJÀ vue (revoir une info).
//  - On NE PEUT PAS avancer au-delà du déjà-vu (saut en avant annulé).
//  - Reprise automatique (position mémorisée dans le navigateur).
//  - Barre de contrôle YouTube masquée + clavier désactivé.
//  - Plein écran maison ; validation à >= 95 % ou fin.

let apiPromise = null;
function loadYouTubeApi() {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) return resolve(window.YT);
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev && prev();
      resolve(window.YT);
    };
    document.head.appendChild(tag);
  });
  return apiPromise;
}

export default function YouTubePlayer({ videoId, start = 0, onComplete }) {
  const hostRef = useRef(null);
  const frameRef = useRef(null);
  const barRef = useRef(null);
  const playerRef = useRef(null);
  const maxWatched = useRef(0);
  const completedRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [seen, setSeen] = useState(0);
  const [dur, setDur] = useState(0);
  const [isFs, setIsFs] = useState(false);

  useEffect(() => {
    let interval;
    let cancelled = false;

    const KEY = 'hyses_vpos_yt_' + videoId;
    let saved = { pos: 0, max: 0 };
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) saved = JSON.parse(raw) || saved;
    } catch {}
    maxWatched.current = Math.max(saved.max || 0, saved.pos || 0);
    setSeen(maxWatched.current);
    const initialStart = Math.floor(saved.pos > 0 ? saved.pos : (start || 0));
    let lastSave = 0;

    loadYouTubeApi().then((YT) => {
      if (cancelled || !hostRef.current) return;
      playerRef.current = new YT.Player(hostRef.current, {
        videoId,
        playerVars: {
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          fs: 0,
          playsinline: 1,
          start: initialStart,
          iv_load_policy: 3,
        },
        events: {
          onStateChange: (e) => {
            const YTS = window.YT.PlayerState;
            setPlaying(e.data === YTS.PLAYING);
            if (e.data === YTS.ENDED && !completedRef.current) {
              completedRef.current = true;
              onComplete && onComplete();
            }
          },
        },
      });
    });

    interval = setInterval(() => {
      const p = playerRef.current;
      if (!p || !p.getCurrentTime || !p.getDuration) return;
      const t = p.getCurrentTime() || 0;
      const d = p.getDuration() || 0;
      setDur(d);
      setCur(t);
      // anti-triche : saut en avant au-delà du déjà-vu -> retour ; reculer = OK
      if (t > maxWatched.current + 1.5) {
        try { p.seekTo(maxWatched.current, true); } catch {}
      } else if (t > maxWatched.current) {
        maxWatched.current = t;
        setSeen(t);
      }
      const now = Date.now();
      if (now - lastSave > 1500) {
        lastSave = now;
        try { localStorage.setItem(KEY, JSON.stringify({ pos: t, max: maxWatched.current })); } catch {}
      }
      if (d > 0 && maxWatched.current >= d * 0.95 && !completedRef.current) {
        completedRef.current = true;
        onComplete && onComplete();
      }
    }, 400);

    const onFsChange = () => setIsFs(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener('fullscreenchange', onFsChange);
      try { playerRef.current && playerRef.current.destroy(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  function togglePlay() {
    const p = playerRef.current;
    if (!p) return;
    playing ? p.pauseVideo() : p.playVideo();
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
  // Clic sur la barre : déplacement plafonné au déjà-vu.
  function seekFromBar(e) {
    const p = playerRef.current;
    const bar = barRef.current;
    if (!p || !bar || !dur) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const target = Math.min(ratio * dur, maxWatched.current);
    try { p.seekTo(target, true); } catch {}
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
        <div ref={hostRef} className="ytplayer" />
        <button
          type="button"
          className={'ytcover' + (playing ? ' playing' : '')}
          onClick={togglePlay}
          aria-label={playing ? 'Pause' : 'Lecture'}
        >
          {!playing && (
            <span className="ytplay">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#16181a"><path d="M8 5v14l11-7z" /></svg>
            </span>
          )}
        </button>
        <button type="button" className="ytfs-btn" onClick={toggleFullscreen} aria-label="Plein écran">
          {isFs ? '✕ Quitter' : '⛶ Plein écran'}
        </button>
      </div>

      {/* Barre de navigation : cliquable uniquement dans la zone déjà vue. */}
      <div
        ref={barRef}
        onClick={seekFromBar}
        title="Vous pouvez revoir la partie déjà regardée"
        style={{ position: 'relative', height: 16, margin: '8px 0 4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
      >
        <div style={{ position: 'absolute', left: 0, right: 0, height: 6, borderRadius: 4, background: 'rgba(0,0,0,.12)' }} />
        <div style={{ position: 'absolute', left: 0, width: `${pctSeen}%`, height: 6, borderRadius: 4, background: 'rgba(232,181,58,.45)' }} />
        <div style={{ position: 'absolute', left: 0, width: `${pctCur}%`, height: 6, borderRadius: 4, background: 'var(--gold, #e8b53a)' }} />
        <div style={{ position: 'absolute', left: `calc(${pctCur}% - 6px)`, width: 12, height: 12, borderRadius: '50%', background: 'var(--gold, #e8b53a)', boxShadow: '0 0 0 2px rgba(0,0,0,.15)' }} />
      </div>

      <div className="ytnote mono" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>
          {seen >= (dur ? dur * 0.95 : Infinity)
            ? '✓ Vidéo visionnée — vous pouvez revoir librement'
            : 'Vous pouvez reculer pour revoir ; impossible d’avancer plus loin'}
        </span>
        <span>{fmt(cur)} / {fmt(dur)}</span>
      </div>
    </div>
  );
}
