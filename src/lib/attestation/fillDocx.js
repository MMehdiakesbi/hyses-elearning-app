// =====================================================================
//  Remplissage de l'ATTESTATION a partir du modele Word officiel HYSES.
//
//  On part du fichier .docx d'origine (tokenise et embarque en base64),
//  on remplace les etiquettes {{...}} par les donnees du stagiaire, et on
//  regenere un .docx IDENTIQUE au modele. Cote navigateur, via JSZip.
// =====================================================================

import JSZip from 'jszip';
import { TEMPLATE_B64 } from './template-b64';
import { cap, frDate } from '@/lib/format';

function b64ToUint8(b64) {
  const bin = atob(b64);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
}
const pad = (n) => String(n).padStart(2, '0');
const shortDate = (d) => {
  const x = d ? new Date(d) : new Date();
  return `${pad(x.getDate())}/${pad(x.getMonth() + 1)}/${x.getFullYear()}`;
};
const shortPlus = (d, y) => {
  const x = d ? new Date(d) : new Date();
  x.setFullYear(x.getFullYear() + y);
  return `${pad(x.getDate())}/${pad(x.getMonth() + 1)}/${x.getFullYear()}`;
};
const escapeXml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function buildAttestationDocxBlob(learner) {
  const zip = await JSZip.loadAsync(b64ToUint8(TEMPLATE_B64));
  let xml = await zip.file('word/document.xml').async('string');

  const dateLong = frDate(learner.date);
  const vals = {
    '{{PRENOM}}': cap(learner.prenom) || '',
    '{{NOM}}': (learner.nom || '').toUpperCase(),
    '{{FONCTION}}': learner.fonction || '',
    '{{ENTREPRISE}}': learner.entreprise || '',
    '{{DATE}}': dateLong,
    '{{DATE_OBT}}': shortDate(learner.date),
    '{{VALIDITE}}': shortPlus(learner.date, 3),
    '{{DATE_FAIT}}': dateLong,
  };
  for (const [k, v] of Object.entries(vals)) {
    xml = xml.split(k).join(escapeXml(v));
  }

  zip.file('word/document.xml', xml);
  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

export function attestationDocxFilename(learner) {
  const slug = `${learner.nom || ''}_${learner.prenom || ''}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return `Attestation_B0H0V_${slug || 'HYSES'}.docx`;
}

export async function downloadAttestationDocx(learner) {
  const blob = await buildAttestationDocxBlob(learner);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = attestationDocxFilename(learner);
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function getAttestationDocxBase64(learner) {
  const blob = await buildAttestationDocxBlob(learner);
  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
