import './globals.css';

export const metadata = {
  title: 'LigorioTec · Laudos e orçamentos',
  robots: { index: false, follow: false },
};

export const viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,500;0,600;0,700;0,800;1,600&family=Roboto:wght@400;500;700&family=IBM+Plex+Mono:wght@500&family=Allura&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
