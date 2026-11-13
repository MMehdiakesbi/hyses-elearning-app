// =====================================================================
//  Generation de l'ATTESTATION Word cote SERVEUR, a partir du modele
//  officiel HYSES (tokenise, embarque en base64) et de donnees lues en base.
//  Meme remplissage que l'ancienne version navigateur (rendu identique).
// =====================================================================

import 'server-only';
import JSZip from 'jszip';
import { TEMPLATE_B64 } from './attestationTemplate';
import { cap } from '../format';

export const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

// Date JJ/MM/AAAA en heure de Paris : le serveur (Vercel) tourne en UTC,
// alors que l'ancienne generation utilisait l'heure du navigateur.
const PARIS_DATE = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});
export function frDateParis(input) {
  return PARIS_DATE.format(input ? new Date(input) : new Date());
}

const escapeXml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** @returns {Promise<Buffer>} le fichier .docx rempli */
export async function buildAttestationDocx(learner) {
  const zip = await JSZip.loadAsync(Buffer.from(TEMPLATE_B64, 'base64'));
  let xml = await zip.file('word/document.xml').async('string');

  const dateLong = frDateParis(learner.date);
  const fonction = (learner.fonction || '').trim();
  const entreprise = (learner.entreprise || '').trim();
  const vals = {
    '{{PRENOM}}': cap(learner.prenom) || '',
    '{{NOM}}': (learner.nom || '').toUpperCase(),
    // Titre d'habilitation : fonction pre-remplie, ou ligne pointillee si vide.
    '{{FONCTION}}': fonction || '.........................................',
    // Segments conditionnels : pas de « occupant le poste de  chez » si un champ est vide.
    '{{POSTE}}': fonction
      ? `, occupant le poste de ${fonction}`
      : entreprise ? `, de la société ${entreprise}` : '',
    '{{CHEZ}}': fonction && entreprise ? ` chez ${entreprise}` : '',
    '{{SCORE}}': String(learner.score ?? ''),
    '{{DATE}}': dateLong,
    '{{DATE_FAIT}}': dateLong,
  };
  for (const [k, v] of Object.entries(vals)) {
    xml = xml.split(k).join(escapeXml(v));
  }

  zip.file('word/document.xml', xml);
  return zip.generateAsync({ type: 'nodebuffer', mimeType: DOCX_MIME });
}

export function attestationDocxFilename(learner) {
  const slug = `${learner.nom || ''}_${learner.prenom || ''}`
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return `Attestation_B0H0V_${slug || 'HYSES'}.docx`;
}
