import './globals.css';

export const metadata = {
  title: 'HYSES \u2014 Formation Habilitation electrique B0 H0V',
  description:
    "Plateforme e-learning HYSES : preparation a l'habilitation electrique pour personnel non electricien (NF C 18-510).",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
