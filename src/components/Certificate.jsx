'use client';

import { useEffect, useRef, useState } from 'react';
import Logo from '@/components/Logo';
import { cap, frDate } from '@/lib/format';
import { TOTAL_QUESTIONS } from '@/lib/data/quiz';
import { downloadAttestationDocx, getAttestationDocxBase64, attestationDocxFilename } from '@/lib/attestation/fillDocx';

const pad = (n) => String(n).padStart(2, '0');
const shortDate = (d) => { const x = d ? new Date(d) : new Date(); return `${pad(x.getDate())}/${pad(x.getMonth() + 1)}/${x.getFullYear()}`; };
const shortPlus = (d, y) => { const x = d ? new Date(d) : new Date(); x.setFullYear(x.getFullYear() + y); return `${pad(x.getDate())}/${pad(x.getMonth() + 1)}/${x.getFullYear()}`; };

export default function Certificate({ learner, emittedAt, onEmitted }) {
  const [emailState, setEmailState] = useState(emittedAt ? 'sent' : 'idle');
  const [busy, setBusy] = useState(false);
  const sentOnce = useRef(Boolean(emittedAt));

  const dateLong = frDate(learner.date);
  const dateShort = shortDate(learner.date);
  const validite = shortPlus(learner.date, 3);
  const nom = (learner.nom || '').toUpperCase();
  const prenom = cap(learner.prenom);

  async function sendEmail() {
    setBusy(true);
    setEmailState('sending');
    try {
      const pdfBase64 = await getAttestationDocxBase64(learner);
      const res = await fetch('/api/attestation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileBase64: pdfBase64, filename: attestationDocxFilename(learner), prenom: learner.prenom, score: learner.score }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Echec envoi');
      if (json.skipped) { setEmailState('notconfigured'); return; }
      setEmailState('sent');
      onEmitted?.(new Date().toISOString());
    } catch (e) {
      console.error('[email attestation]', e);
      setEmailState('error');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!sentOnce.current) { sentOnce.current = true; sendEmail(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emailMsg = {
    sending: '⏳ Envoi de l’attestation par email…',
    sent: '📧 Une copie PDF a été envoyée par email au stagiaire (copie à HYSES).',
    notconfigured: 'ℹ️ L’envoi automatique par email n’est pas encore activé (clé Resend à renseigner). En attendant, téléchargez le PDF ci-dessous.',
    error: '⚠ L’email n’a pas pu être envoyé automatiquement. Le PDF reste téléchargeable ci-dessous.',
    idle: '',
  }[emailState] || '';

  return (
    <>
      <div className="cert-shell">
        <div className="cert">
          <div className="cert-top">
            <div className="co">
              <b><Logo size={22} color="#16181a" /> SASU HYSES</b>
              <span>
                2 bis rue Alfred Nobel, 77420 Champs-sur-Marne<br />
                Enregistré sous le numéro 11770741477 · Numéro SIRET : 89414600000027
              </span>
            </div>
            <div className="cert-badge">B0 · H0V<small>OPÉRATIONS NON ÉLECTRIQUES</small></div>
          </div>

          <h2>Attestation de Formation</h2>

          <p>
            Nous attestons par la présente que <span className="name">{prenom} {nom}</span>
            {learner.fonction && learner.fonction.toLowerCase() !== 'stagiaire'
              ? `, occupant le poste de ${learner.fonction.toLowerCase()}` : ''}
            {learner.entreprise ? ` chez ${learner.entreprise}` : ''}, a suivi avec succès la formation
            intitulée <b>« SENSIBILISATION AUX RISQUES ELECTRIQUE NIVEAU B0 H0V initial »</b>.
          </p>
          <p>
            Cette formation s’est déroulée <b>en ligne (module théorique)</b>, pour une durée totale de{' '}
            <b>07 heures</b>, le {dateLong}. Elle a été menée conformément aux prescriptions de la norme{' '}
            <b>NF C 18-510</b>.
          </p>
          <p>
            L’issue de la formation théorique en ligne est <b style={{ color: 'var(--safe)' }}>FAVORABLE</b>,
            attestant de la réussite de {prenom} {nom} aux évaluations théoriques (QCM) — score :{' '}
            <span className="name">{learner.score}/{TOTAL_QUESTIONS}</span>.
          </p>
          <p className="cert-conf">
            La mise en situation pratique exigée par la norme NF C 18-510 est évaluée en présentiel ; le
            titre d’habilitation ci-dessous est délivré par l’employeur.
          </p>

          <div className="titre">
            <div className="titre-h mono">TITRE D’HABILITATION</div>
            <div className="cert-grid">
              <div><b>Nom</b><s>{nom}</s></div>
              <div><b>Prénom</b><s>{prenom}</s></div>
              <div><b>Fonction</b><s>{learner.fonction || '—'}</s></div>
              <div><b>Date d’obtention</b><s>{dateShort}</s></div>
              <div><b>Symbole et attribut</b><s>B0 H0V — Opérations d’ordre non électrique</s></div>
              <div><b>Validité</b><s>TBT/BT jusqu’au {validite} (3 ans)</s></div>
            </div>
          </div>

          <div className="sign">
            <div><div className="ln">Signature du titulaire</div></div>
            <div><div className="ln">L’employeur (nom, fonction, signature)</div></div>
            <div><div className="ln">Pour HYSES — Jean-Marie EMMA</div></div>
          </div>

          <div className="cert-foot">
            Fait à Champs-sur-Marne, le {dateLong} · Représenté par Jean-Marie EMMA
          </div>
        </div>
      </div>

      {emailMsg && (
        <div className="banner no-print"><span>{emailMsg}</span></div>
      )}

      <div className="footnav no-print">
        <span className="note">Document officiel — à imprimer puis signer (titulaire, employeur, HYSES).</span>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {emailState === 'error' && (
            <button className="btn ghost" onClick={sendEmail} disabled={busy}>Renvoyer par email</button>
          )}
          <button className="btn" onClick={() => downloadAttestationDocx(learner)}>⬇ Télécharger l’attestation (Word)</button>
        </div>
      </div>
    </>
  );
}
