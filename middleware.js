import { NextResponse } from 'next/server';
import { COOKIE, sessaoValida } from './lib/auth';

const MUTANTES = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export async function middleware(req) {
  const senha = process.env.APP_PASSWORD;
  const api = req.nextUrl.pathname.startsWith('/api/');

  // Proteção contra pedidos vindos de outros sites (CSRF): alterações só da própria origem
  if (api && MUTANTES.has(req.method)) {
    const origem = req.headers.get('origin');
    if (origem && origem !== req.nextUrl.origin) {
      return NextResponse.json({ erro: 'Origem não permitida.' }, { status: 403 });
    }
  }

  if (!senha) {
    // No computador (npm run dev) funciona sem senha; publicado, exige a variável.
    if (process.env.NODE_ENV !== 'production') return NextResponse.next();
    return new NextResponse(
      'Configure a variável de ambiente APP_PASSWORD no projeto da Vercel e faça um novo deploy.',
      { status: 500, headers: { 'content-type': 'text/plain; charset=utf-8' } }
    );
  }

  if (await sessaoValida(req.cookies.get(COOKIE)?.value, senha)) return NextResponse.next();

  if (api) {
    return NextResponse.json({ erro: 'Sessão expirada. Entre de novo.' }, { status: 401 });
  }
  const login = req.nextUrl.clone();
  login.pathname = '/login';
  login.search = '';
  return NextResponse.redirect(login);
}

// Fica de fora (público): login, página e PDF do cliente (/c/...), arquivos do Next,
// ícones e o envio de vídeos (que confere a sessão por conta própria).
export const config = {
  matcher: ['/((?!login|api/login|api/video|c/|_next/|icon|apple-icon|favicon.ico|manifest.webmanifest|exemplo/).*)'],
};
