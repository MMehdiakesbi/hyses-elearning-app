import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/server/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { createProgressRepo } from '@/lib/server/progressRepo';
import { submitFinalExam } from '@/lib/server/examService';

// Correction de l'examen final cote serveur.
// Corps attendu : { answers: { "<indexQuestion>": [indexOption, ...] } }.
// Tout autre champ (score, passed, user_id...) est ignore.
export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });

    const body = await request.json().catch(() => null);
    const repo = createProgressRepo(createAdminClient());
    const r = await submitFinalExam({ userId: user.id, body, repo });
    return NextResponse.json(r.body, { status: r.status });
  } catch (e) {
    console.error('[api/exam/submit]', e?.message || e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
