import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Character encoding */}
        <meta charSet="utf-8" />

        {/* Viewport is handled by _app.tsx or individual pages, but including here for global consistency */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#667eea" />

        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />

        {/* Web app manifest for PWA capabilities */}
        <link rel="manifest" href="/site.webmanifest" />

        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Additional meta tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
