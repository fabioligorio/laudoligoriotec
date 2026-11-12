// Cabeçalhos de segurança para todas as páginas.
const csp = [
  "default-src 'self'",
  // Next.js usa scripts e estilos embutidos
  "script-src 'self' 'unsafe-inline'" + (process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''),
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  // fotos: do próprio sistema, do Vercel Blob e embutidas (QR code e uso local)
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
  "media-src 'self' blob: https://*.public.blob.vercel-storage.com",
  // envio de fotos/vídeos para o Vercel Blob
  "connect-src 'self' https://vercel.com https://*.vercel.com https://blob.vercel-storage.com https://*.blob.vercel-storage.com https://*.public.blob.vercel-storage.com",
  // vídeos do YouTube na página do cliente
  "frame-src https://www.youtube-nocookie.com https://www.youtube.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ');

const comuns = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), payment=(), usb=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: '/:path*', headers: [...comuns, { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }] },
      // páginas do cliente: o código secreto do link nunca vai junto para outros sites
      { source: '/c/:path*', headers: [{ key: 'Referrer-Policy', value: 'no-referrer' }, { key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      // dados do sistema nunca ficam em cache compartilhado
      { source: '/api/:path*', headers: [{ key: 'Cache-Control', value: 'no-store' }] },
    ];
  },
};

export default nextConfig;
