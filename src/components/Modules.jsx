'use client';

import { useState } from 'react';
import { MODULES } from '@/lib/data/modules';
import YouTubePlayer from '@/components/YouTubePlayer';
import LocalVideoPlayer from '@/components/LocalVideoPlayer';

// Couper la fin (écran noir) de certaines vidéos locales.
// Clé = numéro de module (1..9), valeur = secondes où arrêter la vidéo.
// Ex : 165 = 2 min 45 s. Ajoute une ligne ici pour chaque vidéo à couper.
const VIDEO_END_SECONDS = {
  1: 165, // Module 1 : s'arrête à 2:45 (après = écran noir)
};

// Anti-triche :
//  - UN SEUL module ouvert à la fois (le lecteur n'est monté que pour le
//    module ouvert -> impossible de lancer plusieurs vidéos en même temps).
//  - Déverrouillage SÉQUENTIEL : le module i ne s'ouvre que si le module
//    i-1 est validé.
//  - Vidéo : fichier LOCAL si m.video est défini (modules 1-4, 8, 9),
//    sinon INTÉGRATION YouTube si m.youtube est défini (modules 5, 6, 7).
export default function Modules({ done = [], onValidate }) {
  // À l'ouverture, on positionne sur le premier module NON terminé
  // (= là où le stagiaire s'était arrêté), au lieu de toujours le module 1.
  const [open, setOpen] = useState(() => {
    const d = new Set(done);
    let i = 0;
    while (i < MODULES.length && d.has(i)) i++;
    return Math.min(i, MODULES.length - 1);
  });
  const [watched, setWatched] = useState(() => new Set());

  const doneSet = new Set(done);
  const isLocked = (i) => i > 0 && !doneSet.has(i - 1);

  function toggle(i) {
    if (isLocked(i)) return;
    setOpen((cur) => (cur === i ? null : i));
  }
  function markWatched(i) {
    setWatched((prev) => new Set(prev).add(i));
  }

  return (
    <div>
      {MODULES.map((m, i) => {
        const isDone = doneSet.has(i);
        const locked = isLocked(i);
        const isOpen = open === i && !locked;

        const hasVideo = !!m.video || !!m.youtube;
        const videoSeen = !hasVideo || watched.has(i) || isDone;
        const canValidate = videoSeen;

        return (
          <div
            className={'mod' + (isDone ? ' done' : '') + (isOpen ? ' open' : '') + (locked ? ' locked' : '')}
            key={i}
          >
            <div className="mod-head" onClick={() => toggle(i)}>
              <div className="mod-num">{isDone ? '✓' : locked ? '🔒' : i + 1}</div>
              <div className="mod-t">
                <div className="mday">{m.day}</div>
                <h3>{m.t}</h3>
              </div>
              <div className="mod-state">{isDone ? 'Validé' : locked ? 'Verrouillé' : 'À suivre'}</div>
              <svg className="chev" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </div>

            <div className="mod-body">
              {isOpen && m.video && (
                <LocalVideoPlayer
                  src={m.video}
                  endAt={VIDEO_END_SECONDS[i + 1] || 0}
                  onComplete={() => markWatched(i)}
                />
              )}
              {isOpen && !m.video && m.youtube && (
                <YouTubePlayer videoId={m.youtube} start={m.youtubeStart || 0} onComplete={() => markWatched(i)} />
              )}

              <p>{m.p}</p>
              <ul>
                {m.li.map((x, k) => (
                  <li key={k}>{x}</li>
                ))}
              </ul>

              <button
                className={'btn ' + (isDone ? 'ghost' : 'gold')}
                disabled={!canValidate}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isDone && canValidate) {
                    onValidate(i);
                    if (i + 1 < MODULES.length) setOpen(i + 1);
                  }
                }}
              >
                {isDone ? '✓ Module validé' : canValidate ? 'Marquer comme consulté' : '🔒 Regardez la vidéo pour valider'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
