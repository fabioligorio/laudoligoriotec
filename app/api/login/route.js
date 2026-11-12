import { NextResponse } from 'next/server';
import { COOKIE, DURACAO_SESSAO, criarSessao, iguais } from '@/lib/auth';
import { contarTentativa, limparTentativas } from '@/lib/store';

export const dynamic = 'force-dynamic';

const MAX_TENTATIVAS = 8;         // por endereço de internet
const JANELA = 15 * 60;           // em 15 minutos

const ipDe = (req) =>
  (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'local';

export async function POST(req) {
  const senhaCerta = process.env.APP_PASSWORD;
  if (!senhaCerta && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ erro: 'Senha não configurada no servidor.' }, { status: 500 });
  }

  const ip = ipDe(req);
  const tentativas = await contarTentativa(ip, JANELA).catch(() => 0);
  if (tentativas > MAX_TENTATIVAS) {
    return NextResponse.json(
      { erro: 'Muitas tentativas. Espere 15 minutos e tente de novo.' },
      { status: 429, headers: { 'retry-after': String(JANELA) } }
    );
  }

  const { senha } = await req.json().catch(() => ({}));
  if (senhaCerta && !iguais(senha, senhaCerta)) {
    // atraso pequeno para dificultar tentativas em sequência
    await new Promise((ok) => setTimeout(ok, 600));
    return NextResponse.json({ erro: 'Senha incorreta.' }, { status: 401 });
  }

  await limparTentativas(ip).catch(() => {});
  const res = NextResponse.json({ ok: true });
  if (senhaCerta) {
    res.cookies.set(COOKIE, await criarSessao(senhaCerta), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: DURACAO_SESSAO,
    });
  }
  return res;
}
