import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/server/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { createProgressRepo } from '@/lib/server/progressRepo';
import { submitPositioning } from '@/lib/server/examService';

// Correction du test de positionnement cote serveur (meme QCM que l'examen
// final : la cle ne doit donc pas etre envoyee au navigateur).
// Corps attendu : { answers: { "<indexQuestion>": [indexOption, ...] } }.
export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });

    const body = await request.json().catch(() => null);
    const repo = createProgressRepo(createAdminClient());
    const r = await submitPositioning({ userId: user.id, body, repo });
    return NextResponse.json(r.body, { status: r.status });
  } catch (e) {
    console.error('[api/positioning/submit]', e?.message || e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
