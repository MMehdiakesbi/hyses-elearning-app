'use client';

import { useEffect, useRef, useState } from 'react';
import Logo from '@/components/Logo';
import { cap, frDate } from '@/lib/format';
import { TOTAL_QUESTIONS } from '@/lib/data/quiz';
import { downloadAttestationDocx, getAttestationDocxBase64, attestationDocxFilename } from '@/lib/attestation/fillDocx';

// Champ du titre d'habilitation laisse a blanc (rempli par l'employeur).
const Blank = () => <s className="blank" aria-label="à compléter" />;

export default function Certificate({ learner, emittedAt, onEmitted }) {
  // emittedAt = attestation deja emise (email OU telechargement) : on ne renvoie
  // pas l'email, mais on n'affiche « envoyé » que pour un envoi reel de cette session.
  const [emailState, setEmailState] = useState('idle');
  const sentOnce = useRef(Boolean(emittedAt));

  const dateLong = frDate(learner.date);
  const fonction = (learner.fonction || '').trim();
  const entreprise = (learner.entreprise || '').trim();
  const nom = (learner.nom || '').toUpperCase();
  const prenom = cap(learner.prenom);

  async function sendEmail() {
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
    }
  }

  useEffect(() => {
    if (!sentOnce.current) { sentOnce.current = true; sendEmail(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Le stagiaire ne voit jamais d'erreur technique : si l'email ne part pas
  // (non configure, refuse...), on l'oriente simplement vers le telechargement.
  const emailMsg = emailState === 'sent'
    ? '📧 Une copie de l’attestation (Word) a été envoyée par email au stagiaire (copie à HYSES).'
    : 'Votre attestation est disponible au téléchargement ci-dessous.';

  async function download() {
    await downloadAttestationDocx(learner);
    if (!emittedAt) onEmitted?.(new Date().toISOString());
  }

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

          {/* Meme texte que l'attestation Word (src/lib/attestation). */}
          <p>
            Nous attestons par la présente que <span className="name">{prenom} {nom}</span>
            {fonction
              ? `, occupant le poste de ${fonction}${entreprise ? ` chez ${entreprise}` : ''}`
              : entreprise ? `, de la société ${entreprise}` : ''}, a suivi avec succès le module théorique en
            ligne de la formation <b>« Sensibilisation aux risques électriques — niveau H0 B0 H0V initial »</b>.
          </p>
          <p>
            Ce module, conforme aux prescriptions de la norme NF C 18-510, a été achevé en ligne le {dateLong}.
          </p>
          <p>
            L’issue de la formation théorique en ligne est <b style={{ color: 'var(--safe)' }}>FAVORABLE</b>.
            SASU HYSES atteste que <span className="name">{prenom} {nom}</span> a suivi le module théorique en
            ligne de la formation Habilitation électrique H0 B0 H0V (NF C 18-510) et a réussi l’évaluation
            théorique (QCM) avec un résultat de <span className="name">{learner.score}/{TOTAL_QUESTIONS}</span>.
            La formation et l’évaluation pratiques se déroulent en présentiel ; le titre d’habilitation est
            délivré par l’employeur.
          </p>

          <div className="titre">
            <div className="titre-h mono">TITRE D’HABILITATION</div>
            <p className="cert-conf">
              À établir et signer par l’employeur, après la formation et l’évaluation pratiques en présentiel.
            </p>
            <div className="cert-grid">
              <div><b>Nom</b><s>{nom}</s></div>
              <div><b>Prénom</b><s>{prenom}</s></div>
              <div><b>Fonction</b>{fonction ? <s>{fonction}</s> : <Blank />}</div>
              <div><b>Symbole et attribut</b><Blank /></div>
              <div><b>Validité</b><Blank /></div>
              <div><b>Date d’obtention</b><Blank /></div>
            </div>
          </div>

          <div className="sign">
            <div><div className="ln">Signature du titulaire</div></div>
            <div><div className="ln">L’employeur (nom, fonction, signature)</div></div>
          </div>

          <p className="cert-recyc">Recyclage recommandé : 3 ans</p>

          <div className="cert-foot">Fait à Champs-sur-Marne, le {dateLong}</div>
        </div>
      </div>

      <div className="banner no-print"><span>{emailMsg}</span></div>

      <div className="footnav no-print">
        <span className="note">Document officiel — à imprimer puis signer (titulaire, employeur).</span>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn" onClick={download}>⬇ Télécharger l’attestation (Word)</button>
        </div>
      </div>
    </>
  );
}
