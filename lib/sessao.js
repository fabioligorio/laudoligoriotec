// Segunda barreira de login: além do middleware, cada página interna e cada rota
// da API confere a sessão por conta própria. Se um dia o middleware falhar ou for
// contornado (já aconteceu com o Next.js em 2025), os dados continuam protegidos.
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { COOKIE, sessaoValida } from './auth';

export async function logado() {
  const senha = process.env.APP_PASSWORD;
  if (!senha) return process.env.NODE_ENV !== 'production';
  const c = await cookies();
  return sessaoValida(c.get(COOKIE)?.value, senha);
}

// páginas internas
export async function exigirLogin() {
  if (!(await logado())) redirect('/login');
}

// rotas da API: devolve a resposta de erro, ou null se estiver logado
export async function semLogin() {
  return (await logado()) ? null : NextResponse.json({ erro: 'Sessão expirada. Entre de novo.' }, { status: 401 });
}
