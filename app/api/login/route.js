import { NextResponse } from 'next/server';
import { COOKIE, tokenDaSenha } from '@/lib/auth';

export async function POST(req) {
  const senhaCerta = process.env.APP_PASSWORD;
  const { senha } = await req.json().catch(() => ({}));

  if (!senhaCerta && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ erro: 'Senha não configurada no servidor.' }, { status: 500 });
  }
  if (senhaCerta && senha !== senhaCerta) {
    return NextResponse.json({ erro: 'Senha incorreta.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  if (senhaCerta) {
    res.cookies.set(COOKIE, await tokenDaSenha(senhaCerta), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 60, // 60 dias
    });
  }
  return res;
}
