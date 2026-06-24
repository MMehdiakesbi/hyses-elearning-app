'use client';

import { useEffect, useRef, useState } from 'react';
import { QUIZ } from '@/lib/data/quiz';

/**
 * Quiz une-question-à-la-fois.
 *  - Réponse unique  : la sélection fait passer automatiquement à la suivante.
 *  - Choix multiples : bouton « Suivant » (activé dès qu'une case est cochée).
 *  - review = true   : mode correction (verdicts + navigation libre).
 *
 * Props : order, answers, onChange(qi, arr), onFinish(), review, idPrefix
 */
export default function Quiz({ order, answers, onChange, onFinish, review = false, idPrefix = 'q' }) {
  const [current, setCurrent] = useState(0);
  const [advancing, setAdvancing] = useState(false);
  const timer = useRef(null);

  // On garde une référence TOUJOURS à jour de onFinish, pour que
  // l'enchaînement automatique note avec les réponses les plus récentes
  // (sinon la dernière réponse peut manquer -> notation bloquée).
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  });

  const n = order.length;
  const row = order[current];
  const Q = QUIZ[row.qi];
  const multi = Q.c.length > 1;
  const given = answers[row.qi] || [];

  useEffect(() => () => timer.current && clearTimeout(timer.current), []);

  function goNext() {
    if (current < n - 1) setCurrent((c) => c + 1);
    else if (onFinishRef.current) onFinishRef.current();
  }
  function goPrev() {
    if (current > 0) setCurrent((c) => c - 1);
  }

  function pick(oi) {
    if (review || advancing) return;
    if (multi) {
      const next = given.includes(oi) ? given.filter((x) => x !== oi) : [...given, oi];
      onChange(row.qi, next);
    } else {
      onChange(row.qi, [oi]);
      // enchaînement automatique
      setAdvancing(true);
      timer.current = setTimeout(() => {
        setAdvancing(false);
        goNext();
      }, 320);
    }
  }

  const correct =
    review && [...given].sort().join(',') === [...Q.c].sort().join(',');
  const pct = Math.round(((current + 1) / n) * 100);

  return (
    <div>
      <div className="quiz-progress">
        <div className="quiz-progress-txt mono">
          Question {current + 1} / {n}
        </div>
        <div className="quiz-progress-bar">
          <i style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="q" id={`${idPrefix}-q${current}`}>
        <h3>{Q.q}</h3>

        {row.opts.map((oi) => {
          const picked = given.includes(oi);
          const isCorrect = Q.c.includes(oi);
          let cls = 'opt' + (multi ? ' multi' : '');
          if (review) {
            if (isCorrect) cls += ' ok';
            else if (picked) cls += ' bad';
          } else if (picked) {
            cls += ' sel';
          }
          return (
            <div
              className={cls}
              key={oi}
              onClick={() => pick(oi)}
              style={review ? { pointerEvents: 'none' } : undefined}
            >
              <span className="box" />
              <span>{Q.o[oi]}</span>
            </div>
          );
        })}

        {multi && !review && <div className="multi-hint">▸ Plusieurs réponses possibles</div>}

        {review && (
          <div className={'verdict ' + (correct ? 'ok' : 'bad')}>
            {correct
              ? '✓ Bonne réponse'
              : '✗ Réponse attendue : ' + Q.c.map((i) => Q.o[i]).join(', ')}
          </div>
        )}
      </div>

      <div className="footnav">
        <button className="btn ghost" onClick={goPrev} disabled={current === 0} style={{ opacity: current === 0 ? 0.35 : 1 }}>
          ← Précédent
        </button>

        {review ? (
          <button className="btn gold" onClick={goNext}>
            {current < n - 1 ? 'Suivant →' : 'Retour au résultat →'}
          </button>
        ) : multi ? (
          <button className="btn gold" onClick={goNext} disabled={given.length === 0}>
            {current < n - 1 ? 'Suivant →' : 'Valider mes réponses'}
          </button>
        ) : (
          <span className="note">Sélectionnez une réponse pour continuer…</span>
        )}
      </div>
    </div>
  );
}
