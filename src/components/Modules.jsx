'use client';

import { useState } from 'react';
import { MODULES } from '@/lib/data/modules';
import { MODULE_QUIZZES } from '@/lib/data/moduleQuizzes';
import YouTubePlayer from '@/components/YouTubePlayer';
import LocalVideoPlayer from '@/components/LocalVideoPlayer';
import { MODE_RECETTE } from '@/lib/recette';

// Couper la fin (écran noir) de certaines vidéos locales.
// Clé = numéro de module (1..9), valeur = secondes où arrêter la vidéo.
const VIDEO_END_SECONDS = {
  1: 165, // Module 1 : s'arrête à 2:45
};

// ---- Mini-quiz affiché à la fin de chaque module ----
function MiniQuiz({ questions, onPass }) {
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [passedOnce, setPassedOnce] = useState(false);

  const allAnswered = questions.every((_, i) => answers[i] !== undefined);
  const score = questions.reduce((n, q, i) => n + (answers[i] === q.correct ? 1 : 0), 0);
  const passed = questions.length > 0 && score === questions.length;

  function choose(qi, ci) {
    if (passedOnce) return;
    setAnswers((a) => ({ ...a, [qi]: ci }));
    setChecked(false);
  }
  function submit() {
    setChecked(true);
    if (passed && !passedOnce) {
      setPassedOnce(true);
      onPass();
    }
  }
  function retry() {
    setAnswers({});
    setChecked(false);
  }

  return (
    <div className="mq">
      <h4 className="mq-h">
        Quiz du module · {questions.length} questions
      </h4>
      <p className="mq-note">Répondez correctement aux {questions.length} questions pour valider le module.</p>

      {questions.map((q, qi) => (
        <div key={qi} className="mq-q">
          <p className="mq-qt">{qi + 1}. {q.q}</p>
          {q.choices.map((c, ci) => {
            const selected = answers[qi] === ci;
            let cls = 'mq-choice';
            if (selected) cls += ' sel';
            if (checked) {
              if (ci === q.correct) cls += ' ok';
              else if (selected) cls += ' bad';
            }
            return (
              <button type="button" key={ci} className={cls} onClick={() => choose(qi, ci)} disabled={passedOnce}>
                {c}{checked && ci === q.correct ? '  ✓' : ''}
              </button>
            );
          })}
        </div>
      ))}

      {!passedOnce && (
        <div className="mq-actions">
          <button type="button" className="btn gold" disabled={!allAnswered} onClick={submit}>
            Valider mes réponses
          </button>
          {checked && !passed && (
            <span className="mq-err">
              {score}/{questions.length} — certaines réponses sont fausses, corrigez-les puis revalidez.
            </span>
          )}
          {checked && !passed && (
            <button type="button" className="btn ghost" onClick={retry}>Tout effacer</button>
          )}
        </div>
      )}
      {passedOnce && (
        <div className="mq-pass">
          ✓ Quiz réussi ({questions.length}/{questions.length}) — module validé.
        </div>
      )}
    </div>
  );
}

export default function Modules({ done = [], onValidate }) {
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
  function validate(i) {
    onValidate(i);
    if (i + 1 < MODULES.length) setOpen(i + 1);
  }

  return (
    <div>
      {MODULES.map((m, i) => {
        const isDone = doneSet.has(i);
        const locked = isLocked(i);
        const isOpen = open === i && !locked;

        const hasVideo = !!m.video || !!m.youtube;
        const videoSeen = !hasVideo || watched.has(i) || isDone;
        const quiz = MODULE_QUIZZES[i] || [];

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

              {/* Validation : vidéo regardée -> mini-quiz -> module validé */}
              {isDone ? (
                <button className="btn ghost" disabled>✓ Module validé</button>
              ) : !videoSeen ? (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button className="btn" disabled>🔒 Regardez la vidéo pour accéder au quiz</button>
                  {MODE_RECETTE && (
                    <button
                      type="button"
                      className="btn ghost"
                      data-testid="recette-skip-video"
                      onClick={(e) => { e.stopPropagation(); markWatched(i); }}
                    >
                      [Recette] Marquer la vidéo comme vue
                    </button>
                  )}
                </div>
              ) : quiz.length > 0 ? (
                <MiniQuiz questions={quiz} onPass={() => validate(i)} />
              ) : (
                <button
                  className="btn gold"
                  onClick={(e) => { e.stopPropagation(); validate(i); }}
                >
                  Marquer comme consulté
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
