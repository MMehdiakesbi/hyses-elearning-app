import './globals.css';
import Script from 'next/script';
import ThemeToggle from '@/components/ThemeToggle';

export const metadata = {
  title: 'HYSES \u2014 Formation Habilitation electrique B0 H0V',
  description:
    "Plateforme e-learning HYSES : preparation a l'habilitation electrique pour personnel non electricien (NF C 18-510).",
};

// Applique le thème sauvegardé avant le rendu (évite un clignotement clair->sombre).
const themeScript = `(function(){try{var t=localStorage.getItem('hyses-theme');if(t==='dark'){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}})();`;

// Protège React des plantages provoqués par la traduction automatique.
const reactTranslateFix = `(function(){if(typeof Node==='function'&&Node.prototype){var r=Node.prototype.removeChild;Node.prototype.removeChild=function(c){if(c&&c.parentNode!==this){return c;}return r.apply(this,arguments);};var i=Node.prototype.insertBefore;Node.prototype.insertBefore=function(n,ref){if(ref&&ref.parentNode!==this){return n;}return i.apply(this,arguments);};}})();`;

// Widget Google Traduction : TOUTES les langues disponibles (anglais, espagnol,
// arabe, allemand, russe, chinois, etc.). Menu déroulant simple.
const gtInit = `window.googleTranslateElementInit=function(){new window.google.translate.TranslateElement({pageLanguage:'fr',layout:window.google.translate.TranslateElement.InlineLayout.SIMPLE,autoDisplay:false},'google_translate_element');};`;

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: reactTranslateFix }} />
        <script dangerouslySetInnerHTML={{ __html: gtInit }} />
      </head>
      <body suppressHydrationWarning>
        {/* Contrôles en haut à droite : langue (Google, stylé) + thème */}
        <div className="site-controls">
          <div id="google_translate_element" className="gt-box" />
          <ThemeToggle />
        </div>
        {children}
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}