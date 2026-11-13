import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getSessionUser } from '@/lib/server/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { createProgressRepo } from '@/lib/server/progressRepo';
import { downloadAttestation, emailAttestation } from '@/lib/server/attestationService';
import { DOCX_MIME } from '@/lib/server/attestationDocx';

// Attestation generee par le SERVEUR a partir de la base, seulement si
// l'examen est reussi (passed = true, ecrit par /api/exam/submit).
//  - GET  : telechargement du Word.
//  - POST : envoi par email a l'adresse du compte connecte.
// Aucune donnee du corps de la requete n'est lue (ni fichier, ni score).

const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function resendMailer() {
  if (!process.env.RESEND_API_KEY) return null;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.RESEND_FROM || 'HYSES Formation <onboarding@resend.dev>';
  const bcc = process.env.RESEND_BCC ? [process.env.RESEND_BCC] : undefined;

  return async ({ to, prenom, score, filename, content }) => {
    const html = `
      <div style="font-family:Arial,sans-serif;color:#16181a;max-width:560px">
        <h2 style="color:#a9760f">Votre attestation de formation</h2>
        <p>Bonjour ${escapeHtml(prenom)},</p>
        <p>Felicitations : vous avez valide la partie <strong>theorique + QCM</strong> de la
        formation <strong>Habilitation electrique B0 H0V</strong> (NF C 18-510)${
          typeof score === 'number' ? ` avec un score de ${score}/13` : ''
        }.</p>
        <p>Votre attestation est jointe a cet email (document Word a imprimer et faire signer).</p>
        <p style="background:#fdf7e8;border:1px solid #a9760f;border-radius:4px;padding:12px;font-size:13px">
          <strong>Important :</strong> cette attestation couvre la theorie et le QCM. La mise en
          situation pratique exigee par la NF C 18-510 doit etre evaluee en presentiel, et le titre
          d'habilitation est ensuite delivre par votre employeur.
        </p>
        <p>SASU HYSES &middot; Contact.hyses@gmail.com</p>
      </div>`;

    const { error } = await resend.emails.send({
      from,
      to: [to],
      bcc,
      subject: 'Votre attestation de formation B0 H0V — HYSES',
      html,
      attachments: [{ filename, content }],
    });
    if (error) throw new Error(error.message || 'Echec envoi Resend');
  };
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });

    const repo = createProgressRepo(createAdminClient());
    const r = await downloadAttestation({ userId: user.id, repo });
    if (r.status !== 200) return NextResponse.json(r.body, { status: r.status });

    return new NextResponse(r.file, {
      status: 200,
      headers: {
        'Content-Type': DOCX_MIME,
        'Content-Disposition': `attachment; filename="${r.filename}"`,
        'Cache-Control': 'private, no-store',
        'X-Attestation-Emitted-At': r.emittedAt || '',
      },
    });
  } catch (e) {
    console.error('[api/attestation GET]', e?.message || e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });

    const repo = createProgressRepo(createAdminClient());
    const r = await emailAttestation({ userId: user.id, email: user.email, repo, mailer: resendMailer() });
    return NextResponse.json(r.body, { status: r.status });
  } catch (e) {
    console.error('[api/attestation POST]', e?.message || e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
