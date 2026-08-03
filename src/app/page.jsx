import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Logo from '@/components/Logo';
import { MODULES } from '@/lib/data/modules';

// Page VITRINE (publique) — design inspiré de la maquette Lovable.
export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const space = user ? '/formation' : '/connexion';
  const gmailDevis =
    'https://mail.google.com/mail/?view=cm&fs=1&to=Contact.hyses@gmail.com&su=' +
    encodeURIComponent('Demande de devis — formation B0 H0V');
  const gmailInscription =
    'https://mail.google.com/mail/?view=cm&fs=1&to=Contact.hyses@gmail.com&su=' +
    encodeURIComponent('Inscription de stagiaires — formation B0 H0V') +
    '&body=' +
    encodeURIComponent(
      "Bonjour,\n\nVeuillez trouver ci-joint le formulaire d'inscription rempli (une ligne par stagiaire).\n\nCordialement,"
    );
  const formUrl = '/Formulaire_inscription_stagiaires_HYSES.xlsx';

  const fiche = [
    ['Public', 'Personnel non électricien'],
    ['Durée', '07 heures'],
    ['Modalité', 'E-learning + présentiel'],
    ['Évaluation', 'QCM (≥ 90 %) + mise en situation'],
    ['Validité', '3 ans'],
  ];
  const objectifs = [
    ['Identifier les dangers', "Reconnaître les situations à risque d'origine électrique dans son environnement de travail."],
    ["Réagir en cas d'accident", 'Adopter la conduite à tenir : protéger, alerter, secourir, conformément aux procédures.'],
    ['Connaissances de base', 'Maîtriser le vocabulaire, les distances de sécurité et les principes de prévention NF C 18-510.'],
  ];
  const etapes = [
    ['Étape 1', 'En amont', 'Test de positionnement (13 questions) pour mesurer le niveau de départ. Non bloquant.'],
    ['Étape 2', 'En ligne', '9 modules vidéo + QCM final de 13 questions. Réussite requise à 90 % (12/13).'],
    ['Étape 3', 'En présentiel', "Mise en situation pratique. Le titre d'habilitation est délivré par l'employeur."],
  ];

  return (
    <div className="hv">
      {/* HEADER */}
      <header className="hv-bar">
        <div className="hv-wrap hv-bar-in">
          <Link href="/" className="hv-logo">
            <Logo /><span>HYSES<small>SÉCURITÉ ÉLECTRIQUE</small></span>
          </Link>
          <nav className="hv-nav">
            <a href="#objectifs">Objectifs</a>
            <a href="#programme">Programme</a>
            <a href="#evaluation">Évaluation</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className="hv-bar-cta">
            <Link href={space} className="hv-link">Espace stagiaire</Link>
            <a href={gmailDevis} target="_blank" rel="noopener noreferrer" className="hv-btn dark">Demander un devis</a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="hv-hero">
        <div className="hv-wrap hv-hero-grid">
          <div className="hv-hero-left">
            <div className="hv-eyebrow">⚡ HABILITATION ÉLECTRIQUE · NF C 18-510</div>
            <h1 className="hv-title">FORMATION<br /><span className="gold">B0 H0V</span></h1>
            <p className="hv-lede">
              Une formation pensée pour le <b>personnel non électricien</b> appelé à travailler dans des
              locaux où existe un risque électrique. Théorie en ligne, mise en situation en présentiel.
            </p>
            <div className="hv-hero-actions">
              <Link href={space} className="hv-btn dark">Espace stagiaire →</Link>
              <a href={gmailDevis} target="_blank" rel="noopener noreferrer" className="hv-btn outline">Demander un devis</a>
            </div>
          </div>

          {/* Fiche technique */}
          <aside className="hv-fiche">
            <div className="hv-fiche-top mono"><span>FICHE · RÉF. NF C 18-510</span><span>v.2024</span></div>
            <div className="hv-fiche-head">
              <div>
                <div className="mono hv-fiche-niv">NIVEAU</div>
                <div className="hv-fiche-b0">B0 H0V</div>
              </div>
              <Logo size={56} />
            </div>
            <dl className="hv-fiche-list">
              {fiche.map(([k, v]) => (
                <div key={k}><dt className="mono">{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
            <div className="hv-fiche-foot mono">DÉLIVRÉE PAR SASU HYSES — N° DRIEETS 11770741477.</div>
          </aside>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="hv-stats">
        <div className="hv-wrap hv-stats-grid">
          <div><b>7 h</b><span className="mono">DURÉE TOTALE</span></div>
          <div><b>0</b><span className="mono">PRÉREQUIS</span></div>
          <div><b>Mixte</b><span className="mono">E-LEARNING + PRÉSENTIEL</span></div>
          <div><b>3 ans</b><span className="mono">VALIDITÉ</span></div>
        </div>
      </section>

      {/* OBJECTIFS */}
      <section className="hv-sec" id="objectifs">
        <div className="hv-wrap">
          <div className="hv-kicker mono">OBJECTIFS PÉDAGOGIQUES</div>
          <h2 className="hv-h2">Trois compétences clés</h2>
          <div className="hv-rule" />
          <div className="hv-cards">
            {objectifs.map(([t, p], i) => (
              <article className="hv-card" key={i}>
                <div className="mono hv-card-n">{String(i + 1).padStart(2, '0')}</div>
                <h3>{t}</h3><p>{p}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMME */}
      <section className="hv-sec" id="programme">
        <div className="hv-wrap">
          <div className="hv-kicker mono">PROGRAMME · 9 MODULES</div>
          <div className="hv-prog-head">
            <div>
              <h2 className="hv-h2">Le parcours en ligne</h2>
              <div className="hv-rule" />
            </div>
            <p className="hv-prog-note">
              Vidéo + résumé structuré pour chaque module. Déverrouillage séquentiel, avance impossible,
              validation après visionnage complet.
            </p>
          </div>
          <div className="hv-mods">
            {MODULES.map((m, i) => (
              <div className="hv-mod" key={i}>
                <span className="mono hv-mod-n">{String(i + 1).padStart(2, '0')}</span>
                <div><b>{m.t}</b><div className="hv-mod-rule" /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EVALUATION */}
      <section className="hv-sec" id="evaluation">
        <div className="hv-wrap">
          <div className="hv-kicker mono">MODALITÉS D'ÉVALUATION</div>
          <h2 className="hv-h2">Une évaluation<br />conforme NF C 18-510</h2>
          <div className="hv-rule" />
          <div className="hv-cards">
            {etapes.map(([e, t, p], i) => (
              <article className="hv-card" key={i}>
                <div className="mono hv-card-n">{e.toUpperCase()}</div>
                <h3>{t}</h3><p>{p}</p>
              </article>
            ))}
          </div>
          <div className="hv-conf">
            <span className="hv-conf-i">!</span>
            <p>
              <b>Conformité.</b> L'attestation délivrée en ligne couvre uniquement la partie théorique
              (modules + QCM). La mise en situation pratique exigée par la NF C 18-510 est évaluée{' '}
              <b>en présentiel</b>, et le <b>titre d'habilitation</b> est délivré par l'<b>employeur</b>.
            </p>
          </div>
        </div>
      </section>

      {/* FORMATEUR (bande sombre) */}
      <section className="hv-dark" id="contact">
        <div className="hv-wrap hv-form-grid">
          <div>
            <div className="hv-kicker mono gold">FORMATEUR RÉFÉRENT</div>
            <h2 className="hv-h2 light">COORDONNATEUR SPS<br />NIVEAU 1, <span className="gold">6+ ANS</span> SUR LE TERRAIN.</h2>
            <p className="hv-lede light">
              Un accompagnement par un professionnel de la prévention des risques, garant de la pertinence
              opérationnelle de chaque module.
            </p>
          </div>
          <aside className="hv-inscrire">
            <h3>Inscrire vos salariés</h3>
            <p>Tarifs entreprise, sessions intra et inter, suivi des attestations. Réponse sous 24 h ouvrées.</p>
            <p style={{ color: 'var(--band-mute)', fontSize: 13, marginBottom: 16 }}>
              Téléchargez le formulaire d'inscription, remplissez une ligne par stagiaire (prénom, nom,
              fonction, société, email), puis renvoyez-le-nous par email.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              <a href="mailto:Contact.hyses@gmail.com?subject=Inscription%20formation%20B0%20H0V&body=Bonjour%2C%0A%0AJe%20souhaite%20inscrire%20des%20stagiaires%20%C3%A0%20la%20formation%20B0%20H0V.%0AVous%20trouverez%20ci-joint%20le%20formulaire%20d%27inscription%20rempli.%0A%0ACordialement%2C" className="hv-btn gold">Contacter HYSES →</a>
              <a href="/Formulaire_inscription_stagiaires_HYSES.xlsx" download style={{ color: 'var(--band-ink)', textDecoration: 'underline', fontWeight: 600, fontSize: 14 }}>
                📄 Télécharger le formulaire (Excel)
              </a>
            </div>
          </aside>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="hv-footer">
        <div className="hv-wrap">
          <div className="hv-foot-grid">
            <div>
              <Link href="/" className="hv-logo"><Logo /><span>HYSES<small>SÉCURITÉ ÉLECTRIQUE</small></span></Link>
              <p className="hv-foot-desc">SASU HYSES — organisme de formation à la sécurité électrique, conforme à la norme NF C 18-510.</p>
            </div>
            <div>
              <div className="hv-kicker mono">COORDONNÉES</div>
              <p>2 bis rue Alfred Nobel<br />77420 Champs-sur-Marne<br />Contact.hyses@gmail.com</p>
            </div>
            <div>
              <div className="hv-kicker mono">MENTIONS LÉGALES</div>
              <p>DNA 11770741477<br />SIRET 894 146 000 00027<br />Enregistré à la DRIEETS d'Île-de-France. Cet enregistrement ne vaut pas agrément de l'État.</p>
            </div>
          </div>
          <div className="hv-foot-bottom mono">
            <span>© 2026 SASU HYSES — Tous droits réservés.</span>
            <span>SÉCURITÉ · CONFORMITÉ · EXCELLENCE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
