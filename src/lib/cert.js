// =====================================================================
//  Attestation PDF (jsPDF) — reprend FIDELEMENT le modele officiel HYSES.
//
//  CONFORMITE (NF C 18-510) : document emis a l'issue du module THEORIQUE
//  en ligne (theorie + QCM). Par rapport au modele papier, seules deux
//  mentions sont adaptees : le lieu ("en ligne (module theorique)") et la
//  phrase de resultat ("aux evaluations theoriques (QCM)" au lieu de
//  "theoriques que pratiques"). La mise en situation PRATIQUE est evaluee
//  en presentiel et le TITRE est delivre par l'EMPLOYEUR (bloc a completer).
// =====================================================================

import { cap, frDate } from './format';
import { TOTAL_QUESTIONS } from './data/quiz';

const INK = [22, 24, 26];
const GOLD = [169, 118, 15];
const GREY = [110, 110, 110];
const SAFE = [47, 125, 79];

const HYSES = {
  raison: 'SASU HYSES',
  l1: '2 bis rue Alfred Nobel, 77420 Champs-sur-Marne',
  l2: 'Enregistre sous le numero 11770741477   \u00B7   Numero SIRET : 89414600000027',
  signataire: 'Jean-Marie EMMA',
  intitule: 'SENSIBILISATION AUX RISQUES ELECTRIQUE NIVEAU B0 H0V initial',
};

function pad(n) { return String(n).padStart(2, '0'); }
function shortDate(d) {
  const x = d ? new Date(d) : new Date();
  return `${pad(x.getDate())}/${pad(x.getMonth() + 1)}/${x.getFullYear()}`;
}
function shortDatePlusYears(d, y) {
  const x = d ? new Date(d) : new Date();
  x.setFullYear(x.getFullYear() + y);
  return `${pad(x.getDate())}/${pad(x.getMonth() + 1)}/${x.getFullYear()}`;
}

export async function buildAttestationDoc(data) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const PW = 210;
  const M = 18;
  const CW = PW - M * 2;
  const dateLong = frDate(data.date);
  const dateShort = shortDate(data.date);
  const validite = shortDatePlusYears(data.date, 3);
  let y = M;

  const text = (s, x, yy, opt = {}) => {
    doc.setFont('helvetica', opt.bold ? 'bold' : 'normal');
    if (opt.size) doc.setFontSize(opt.size);
    doc.setTextColor(...(opt.color || INK));
    doc.text(s, x, yy, opt.align ? { align: opt.align } : undefined);
  };

  // En-tete (comme le modele)
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.6);
  doc.triangle(M, y + 7, M + 4, y, M + 8, y + 7, 'S');
  text(HYSES.raison, M + 11, y + 5, { bold: true, size: 15 });
  text(HYSES.l1, M + 11, y + 10.5, { size: 8.5, color: GREY });
  text(HYSES.l2, M + 11, y + 14.5, { size: 8.5, color: GREY });
  y += 22;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1.2);
  doc.line(M, y, PW - M, y);
  y += 13;

  // Titre
  text('Attestation de Formation', PW / 2, y, { bold: true, size: 20, align: 'center' });
  y += 13;

  const nom = (data.nom || '').toUpperCase();
  const prenom = cap(data.prenom);
  const poste =
    data.fonction && data.fonction.toLowerCase() !== 'stagiaire'
      ? ` occupant le poste de ${data.fonction.toLowerCase()}`
      : '';
  const chez = data.entreprise ? ` chez ${data.entreprise}` : '';

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);

  const p1 = `Nous attestons par la presente que ${prenom} ${nom},${poste}${chez}, a suivi avec succes la formation intitulee \u00AB ${HYSES.intitule} \u00BB.`;
  let lines = doc.splitTextToSize(p1, CW);
  doc.text(lines, M, y);
  y += lines.length * 5.8 + 3;

  const p2 = `Cette formation s'est deroulee en ligne (module theorique), pour une duree totale de 07 heures, le ${dateLong}. Elle a ete menee conformement aux prescriptions de la norme NF C 18-510.`;
  lines = doc.splitTextToSize(p2, CW);
  doc.text(lines, M, y);
  y += lines.length * 5.8 + 3;

  // Resultat (conforme : theorie + QCM)
  const r1 = "L'issue de la formation theorique en ligne est ";
  doc.text(r1, M, y);
  const w = doc.getTextWidth(r1);
  text('FAVORABLE', M + w, y, { bold: true, color: SAFE, size: 11 });
  doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30); doc.setFontSize(11);
  y += 5.8;
  const r2 = `attestant de la reussite de ${prenom} ${nom} aux evaluations theoriques (QCM) \u2014 score : ${data.score}/${TOTAL_QUESTIONS}.`;
  lines = doc.splitTextToSize(r2, CW);
  doc.text(lines, M, y);
  y += lines.length * 5.8 + 3;

  // Petite mention de conformite (discrete, italique)
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(...GREY);
  const conf = "La mise en situation pratique exigee par la norme NF C 18-510 est evaluee en presentiel ; le titre d'habilitation ci-dessous est delivre par l'employeur.";
  doc.text(doc.splitTextToSize(conf, CW), M, y);
  y += 10;

  // TITRE D'HABILITATION (identique au modele)
  text("TITRE D'HABILITATION", M, y, { bold: true, size: 12 });
  y += 7;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...INK);
  doc.text('Le Titulaire :', M, y); y += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(`Nom : ${nom}`, M, y); y += 6;
  doc.text(`Prenom : ${prenom}`, M, y);
  doc.text(`Fonction : ${data.fonction || ''}`, M + 90, y); y += 7;
  doc.setFont('helvetica', 'bold');
  doc.text("Symbole d'habilitation et attribut :", M, y); y += 5.5;
  doc.setFont('helvetica', 'normal');
  doc.text(`B0 H0V - Operations d'ordre non electrique - Validite : TBT/BT jusqu'au ${validite}`, M, y); y += 7;
  doc.text(`Date d'obtention : ${dateShort}`, M, y); y += 8;
  doc.text('Signature du Titulaire :', M, y); y += 5;
  doc.text('.........................................', M, y); y += 9;

  doc.setFont('helvetica', 'bold');
  doc.text("L'employeur :", M, y); y += 6;
  doc.setFont('helvetica', 'normal');
  doc.text('Nom Prenom : ......................................', M, y); y += 6;
  doc.text('Fonction : ..........................................', M, y); y += 6;
  doc.text('Signature :', M, y); y += 5;
  doc.text('.........................................', M, y); y += 9;

  doc.setFont('helvetica', 'bold');
  doc.text('Duree de validite de la formation : 3 ans', M, y); y += 12;

  // Pied
  doc.setDrawColor(220, 217, 209); doc.setLineWidth(0.2);
  doc.line(M, y, PW - M, y); y += 6;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...INK);
  doc.text(`Fait a Champs-sur-Marne, le ${dateLong}. Represente par : ${HYSES.signataire}`, M, y); y += 10;
  doc.text('Signature et cachet : .........................................', M, y);

  return doc;
}

export function attestationFilename(data) {
  const slug = `${data.nom || ''}_${data.prenom || ''}`
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return `Attestation_B0H0V_${slug || 'HYSES'}.pdf`;
}

export async function downloadAttestation(data) {
  const doc = await buildAttestationDoc(data);
  doc.save(attestationFilename(data));
}

export async function getAttestationBase64(data) {
  const doc = await buildAttestationDoc(data);
  return doc.output('datauristring').split(',')[1];
}
