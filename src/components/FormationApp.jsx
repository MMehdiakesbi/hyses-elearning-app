'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Header from '@/components/Header';
import Quiz from '@/components/Quiz';
import Modules from '@/components/Modules';
import Certificate from '@/components/Certificate';
import { createClient } from '@/lib/supabase/client';
import { MODULES } from '@/lib/data/modules';
import { PASS_THRESHOLD, TOTAL_QUESTIONS } from '@/lib/data/quiz';
import {
  buildOrder,
  gradeAnswers,
  firstUnanswered,
  isPass,
  toPercent,
} from '@/lib/scoring';
import { saveProgress, saveProfile } from '@/lib/progress';
import { humanDuration } from '@/lib/format';

// Nombre de tentatives autorisees au quiz final (1er essai + reprises).
const MAX_ATTEMPTS = 2;

const RAIL = {
  profile: 5,
  position: 15,
  'pos-done': 25,
  course: 45,
  quiz: 70,
  score: 88,
  cert: 100,
};

export default function FormationApp({ user, profile: profile0, progress: progress0 }) {
  const supabase = useMemo(() => createClient(), []);

  const [profile, setProfile] = useState(profile0 || {});
  const [progress, setProgress] = useState(progress0 || { modules_done: [] });

  // Temps : base cumulee + temps de la session courante.
  const baseTime = useRef(progress0?.time_spent_seconds || 0);
  const sessionStart = useRef(Date.now());
  const computeTime = () =>
    baseTime.current + Math.round((Date.now() - sessionStart.current) / 1000);

  const needsProfile = !profile?.prenom || !profile?.nom;
  const allModulesDone = (progress.modules_done || []).length === MODULES.length;

  // Ecran initial = reprise de progression.
  const initialScreen = needsProfile
    ? 'profile'
    : !progress.positioning_done
      ? 'position'
      : progress.final_done
        ? 'score'
        : 'course';

  const [screen, setScreen] = useState(initialScreen);

  // QCM
  const [posOrder] = useState(() => buildOrder(false));
  const [posAnswers, setPosAnswers] = useState({});
  const [posNote, setPosNote] = useState('');

  const [finalOrder, setFinalOrder] = useState(() => buildOrder(true));
  const [finalAnswers, setFinalAnswers] = useState({});
  const [reviewMode, setReviewMode] = useState(false);
  const [quizNote, setQuizNote] = useState('');
  const [hasTakenFinal, setHasTakenFinal] = useState(false);

  // Profil (formulaire de completion)
  const [form, setForm] = useState({
    prenom: profile?.prenom || '',
    nom: profile?.nom || '',
    fonction: profile?.fonction || '',
    entreprise: profile?.entreprise || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Animation de la jauge sur l'ecran score
  const [gaugeW, setGaugeW] = useState(0);
  useEffect(() => {
    if (screen === 'score') {
      setGaugeW(0);
      const t = setTimeout(() => setGaugeW(toPercent(progress.final_score ?? 0)), 250);
      return () => clearTimeout(t);
    }
  }, [screen, progress.final_score]);

  function go(next) {
    setScreen(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function patchProgress(patch) {
    setProgress((p) => ({ ...p, ...patch }));
  }

  // ---- Profil ----
  async function submitProfile(e) {
    e.preventDefault();
    if (!form.prenom.trim() || !form.nom.trim()) return;
    setSavingProfile(true);
    const patch = {
      prenom: form.prenom.trim(),
      nom: form.nom.trim(),
      fonction: form.fonction.trim() || 'Stagiaire',
      entreprise: form.entreprise.trim(),
    };
    await saveProfile(supabase, user.id, patch);
    setProfile((pr) => ({ ...pr, ...patch }));
    setSavingProfile(false);
    go(progress.positioning_done ? (progress.final_done ? 'score' : 'course') : 'position');
  }

  // ---- Positionnement ----
  async function submitPositioning() {
    const u = firstUnanswered(posOrder, posAnswers);
    if (u > -1) {
      setPosNote(`⚠ Question ${u + 1} sans réponse.`);
      document.getElementById(`pos-q${u}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const score = gradeAnswers(posAnswers);
    await saveProgress(supabase, user.id, {
      positioning_score: score,
      positioning_done: true,
      time_spent_seconds: computeTime(),
    });
    patchProgress({ positioning_score: score, positioning_done: true });
    go('pos-done');
  }

  // ---- Modules ----
  async function validateModule(i) {
    const set = new Set(progress.modules_done || []);
    set.add(i);
    const next = [...set].sort((a, b) => a - b);
    patchProgress({ modules_done: next });
    await saveProgress(supabase, user.id, {
      modules_done: next,
      time_spent_seconds: computeTime(),
    });
  }

  // ---- Quiz final ----
  function startFinal() {
    // Limite de tentatives : si epuisees et non reussi, on reste sur le score.
    if (!progress.passed && (progress.final_attempts || 0) >= MAX_ATTEMPTS) {
      go('score');
      return;
    }
    setFinalOrder(buildOrder(true));
    setFinalAnswers({});
    setReviewMode(false);
    setQuizNote('');
    setHasTakenFinal(false);
    go('quiz');
  }

  async function gradeFinal() {
    const u = firstUnanswered(finalOrder, finalAnswers);
    if (u > -1) {
      setQuizNote(`⚠ Question ${u + 1} sans réponse.`);
      document.getElementById(`final-q${u}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const score = gradeAnswers(finalAnswers);
    const passed = isPass(score);
    const nowIso = new Date().toISOString();
    const newAttempts = (progress.final_attempts || 0) + 1;
    await saveProgress(supabase, user.id, {
      final_score: score,
      final_done: true,
      passed,
      final_attempts: newAttempts,
      finished_at: nowIso,
      time_spent_seconds: computeTime(),
    });
    patchProgress({
      final_score: score,
      final_done: true,
      passed,
      final_attempts: newAttempts,
      finished_at: nowIso,
    });
    setHasTakenFinal(true);
    go('score');
  }

  function reviewQuiz() {
    setReviewMode(true);
    go('quiz');
  }

  async function onAttestationEmitted(ts) {
    patchProgress({ attestation_emitted_at: ts });
    await saveProgress(supabase, user.id, { attestation_emitted_at: ts });
  }

  // ---- Donnees attestation ----
  const learner = {
    prenom: profile?.prenom,
    nom: profile?.nom,
    fonction: profile?.fonction,
    entreprise: profile?.entreprise,
    score: progress.final_score ?? 0,
    email: user.email,
    date: progress.finished_at || new Date().toISOString(),
  };

  const passed = !!progress.passed;
  const pct = toPercent(progress.final_score ?? 0);

  return (
    <>
      <Header
        prenom={profile?.prenom}
        nom={profile?.nom}
        fonction={profile?.fonction}
        entreprise={profile?.entreprise}
        progress={RAIL[screen] || 0}
      />

      {/* ====== PROFIL ====== */}
      {screen === 'profile' && (
        <section className="screen">
          <div className="wrap" style={{ paddingTop: 30 }}>
            <div className="eyebrow">Bienvenue</div>
            <h1 style={{ fontSize: 38, marginTop: 8 }}>Complétez votre profil</h1>
            <p className="lede">
              Ces informations figureront sur votre attestation. Vérifiez-les avant de commencer.
            </p>
            <div className="card" style={{ padding: 26, marginTop: 28, maxWidth: 560 }}>
              <form onSubmit={submitProfile}>
                <div className="grid2">
                  <div className="field">
                    <label>Prénom</label>
                    <input
                      value={form.prenom}
                      onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Nom</label>
                    <input
                      value={form.nom}
                      onChange={(e) => setForm({ ...form, nom: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid2">
                  <div className="field">
                    <label>Fonction</label>
                    <input
                      value={form.fonction}
                      onChange={(e) => setForm({ ...form, fonction: e.target.value })}
                      placeholder="Ingénieur"
                    />
                  </div>
                  <div className="field">
                    <label>Entreprise</label>
                    <input
                      value={form.entreprise}
                      onChange={(e) => setForm({ ...form, entreprise: e.target.value })}
                      placeholder="AKIEM"
                    />
                  </div>
                </div>
                <button className="btn gold" type="submit" style={{ marginTop: 22 }} disabled={savingProfile}>
                  {savingProfile ? 'Enregistrement…' : 'Continuer →'}
                </button>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* ====== POSITIONNEMENT ====== */}
      {screen === 'position' && (
        <section className="screen">
          <div className="wrap">
            <div className="eyebrow">Étape 1 · Avant la formation</div>
            <h1 style={{ fontSize: 38, marginTop: 8 }}>Test de positionnement</h1>
            <p className="lede">
              On évalue votre niveau de départ avant le parcours. Ce score est conservé dans votre
              dossier mais ne conditionne pas la validation.
            </p>
            <Quiz
              order={posOrder}
              answers={posAnswers}
              onChange={(qi, a) => setPosAnswers((s) => ({ ...s, [qi]: a }))}
              onFinish={submitPositioning}
              idPrefix="pos"
            />
          </div>
        </section>
      )}

      {/* ====== POSITIONNEMENT FAIT ====== */}
      {screen === 'pos-done' && (
        <section className="screen">
          <div className="wrap">
            <div className="card score-card">
              <div className="eyebrow">Positionnement enregistré</div>
              <div className="big-score">
                <span>{progress.positioning_score ?? 0}</span>
                <span className="of">/{TOTAL_QUESTIONS}</span>
              </div>
              <p className="lede" style={{ margin: '14px auto 0' }}>
                C'est votre niveau de départ. Place à la formation : suivez les 9 modules, puis vous
                passerez le quiz final.
              </p>
              <button className="btn gold" style={{ marginTop: 26 }} onClick={() => go('course')}>
                Accéder aux modules →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ====== PARCOURS ====== */}
      {screen === 'course' && (
        <section className="screen">
          <div className="wrap">
            <div className="eyebrow">Étape 2 · Parcours de formation</div>
            <h1 style={{ fontSize: 38, marginTop: 8 }}>Modules</h1>
            <p className="lede">
              Consultez et validez chaque module pour débloquer le quiz final. Progression :{' '}
              <b className="mono">
                {(progress.modules_done || []).length} / {MODULES.length}
              </b>
            </p>
            <Modules done={progress.modules_done} onValidate={validateModule} />
            <div className="footnav">
              <span className="note">
                {allModulesDone
                  ? '✓ Tous les modules sont consultés.'
                  : `Consultez les ${MODULES.length} modules pour accéder au quiz final.`}
              </span>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {progress.final_done && (
                  <button className="btn ghost" onClick={() => go('score')}>
                    Voir mon résultat
                  </button>
                )}
                <button className="btn" disabled={!allModulesDone} onClick={startFinal}>
                  Passer le quiz final →
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ====== QUIZ FINAL ====== */}
      {screen === 'quiz' && (
        <section className="screen">
          <div className="wrap">
            <div className="eyebrow">Étape 3 · Évaluation finale</div>
            <h1 style={{ fontSize: 38, marginTop: 8 }}>Quiz final</h1>
            <p className="lede">
              {reviewMode
                ? 'Correction affichée — réponses verrouillées.'
                : `13 questions, ordre mélangé. Réussite à partir de ${PASS_THRESHOLD}/${TOTAL_QUESTIONS} (≥ 90 %). En dessous, l'attestation n'est pas générée.`}
            </p>
            <Quiz
              order={finalOrder}
              answers={finalAnswers}
              onChange={(qi, a) => setFinalAnswers((s) => ({ ...s, [qi]: a }))}
              onFinish={reviewMode ? () => go('score') : gradeFinal}
              review={reviewMode}
              idPrefix="final"
            />
          </div>
        </section>
      )}

      {/* ====== SCORE ====== */}
      {screen === 'score' && (
        <section className="screen">
          <div className="wrap">
            <div className="card score-card">
              <div className="eyebrow">{passed ? 'Formation validée' : 'Seuil non atteint'}</div>
              <div className="big-score">
                <span>{progress.final_score ?? 0}</span>
                <span className="of">/{TOTAL_QUESTIONS}</span>
              </div>
              <div className="gauge">
                <i
                  style={{
                    width: `${gaugeW}%`,
                    background: passed ? 'var(--safe)' : 'var(--danger)',
                  }}
                />
              </div>
              <h2 style={{ fontSize: 26, color: passed ? 'var(--safe)' : 'var(--danger)' }}>
                {passed ? 'Félicitations 🎉' : 'Pas encore'}
              </h2>
              <p className="lede" style={{ margin: '14px auto 0' }}>
                {passed
                  ? `Vous obtenez ${progress.final_score}/${TOTAL_QUESTIONS} (${pct} %). Théorie + QCM validés (≥ 90 %). Votre attestation est disponible.`
                  : (progress.final_attempts || 0) < MAX_ATTEMPTS
                    ? `Vous obtenez ${progress.final_score}/${TOTAL_QUESTIONS} (${pct} %). Le seuil est de ${PASS_THRESHOLD}/${TOTAL_QUESTIONS} (≥ 90 %). Il vous reste ${MAX_ATTEMPTS - (progress.final_attempts || 0)} tentative. Revoyez les modules, puis retentez le quiz.`
                    : `Vous obtenez ${progress.final_score}/${TOTAL_QUESTIONS} (${pct} %). Vous avez utilisé vos ${MAX_ATTEMPTS} tentatives sans atteindre le seuil de ${PASS_THRESHOLD}/${TOTAL_QUESTIONS}. Rapprochez-vous de votre formateur — aucune attestation n'est générée automatiquement.`}
              </p>
              <div className="recap">
                <span>
                  Positionnement
                  <b>{(progress.positioning_score ?? '–')}/{TOTAL_QUESTIONS}</b>
                </span>
                <span>
                  Quiz final
                  <b>{(progress.final_score ?? '–')}/{TOTAL_QUESTIONS}</b>
                </span>
                <span>
                  Temps passé
                  <b>{humanDuration(progress.time_spent_seconds || computeTime())}</b>
                </span>
              </div>
              <div style={{ marginTop: 26, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                {hasTakenFinal && (
                  <button className="btn ghost" onClick={reviewQuiz}>
                    Revoir mes réponses
                  </button>
                )}
                {!passed && (progress.final_attempts || 0) < MAX_ATTEMPTS && (
                  <button className="btn" onClick={startFinal}>
                    Recommencer le quiz ({MAX_ATTEMPTS - (progress.final_attempts || 0)} restante)
                  </button>
                )}
                {!passed && (progress.final_attempts || 0) >= MAX_ATTEMPTS && (
                  <span className="note" style={{ color: 'var(--danger)', alignSelf: 'center' }}>
                    Tentatives épuisées — contactez votre formateur.
                  </span>
                )}
                {passed && (
                  <button className="btn gold" onClick={() => go('cert')}>
                    Voir mon attestation →
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ====== ATTESTATION ====== */}
      {screen === 'cert' && passed && (
        <section className="screen">
          <div className="wrap">
            <div className="eyebrow no-print">Étape 4 · Attestation</div>
            <h1 className="no-print" style={{ fontSize: 34, margin: '8px 0 18px' }}>
              Votre attestation
            </h1>
            <Certificate
              learner={learner}
              emittedAt={progress.attestation_emitted_at}
              onEmitted={onAttestationEmitted}
            />
            <div className="footnav no-print">
              <button className="btn ghost" onClick={() => go('score')}>
                ← Retour
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
