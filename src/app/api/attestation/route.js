import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';

// Envoi de l'attestation par email.
//
// SECURITE :
//  - On verifie cote serveur que l'appelant est bien authentifie.
//  - Le destinataire est TOUJOURS l'email du compte connecte
//    (user.email), jamais une adresse fournie par le client.
//
// NOTE MVP : le PDF est genere cote navigateur puis transmis ici.
// Durcissement futur possible : generer le PDF et corriger le QCM
// cote serveur pour eviter toute falsification.
export async function POST(request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
    }

    if (!process.env.RESEND_API_KEY) {
      // Email non configure : ce n'est pas une erreur bloquante.
      // L'attestation reste telechargeable cote navigateur.
      return NextResponse.json({ ok: false, skipped: true, reason: 'email_non_configure' });
    }

    const { fileBase64, pdfBase64, filename, prenom, score } = await request.json();
    const content = fileBase64 || pdfBase64;
    if (!content || !filename) {
      return NextResponse.json({ error: 'Donnees du fichier manquantes' }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.RESEND_FROM || 'HYSES Formation <onboarding@resend.dev>';
    const bcc = process.env.RESEND_BCC ? [process.env.RESEND_BCC] : undefined;

    const html = `
      <div style="font-family:Arial,sans-serif;color:#16181a;max-width:560px">
        <h2 style="color:#a9760f">Votre attestation de formation</h2>
        <p>Bonjour ${prenom || ''},</p>
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
      to: [user.email],
      bcc,
      subject: 'Votre attestation de formation B0 H0V — HYSES',
      html,
      attachments: [{ filename, content }],
    });

    if (error) {
      console.error('[resend]', error);
      return NextResponse.json({ error: error.message || 'Echec envoi' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[api/attestation]', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
