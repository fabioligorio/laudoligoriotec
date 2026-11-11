import { NextResponse } from 'next/server';
import { COOKIE, tokenDaSenha } from './lib/auth';

export async function middleware(req) {
  const senha = process.env.APP_PASSWORD;

  if (!senha) {
    // No computador (npm run dev) funciona sem senha; publicado, exige a variável.
    if (process.env.NODE_ENV !== 'production') return NextResponse.next();
    return new NextResponse(
      'Configure a variável de ambiente APP_PASSWORD no projeto da Vercel e faça um novo deploy.',
      { status: 500, headers: { 'content-type': 'text/plain; charset=utf-8' } }
    );
  }

  const cookie = req.cookies.get(COOKIE)?.value;
  if (cookie && cookie === (await tokenDaSenha(senha))) return NextResponse.next();

  if (req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ erro: 'Sessão expirada. Entre de novo.' }, { status: 401 });
  }
  const login = req.nextUrl.clone();
  login.pathname = '/login';
  login.search = '';
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ['/((?!login|api/login|api/video|c/|_next/|icon|apple-icon|favicon.ico|manifest.webmanifest).*)'],
};
