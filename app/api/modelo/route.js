import { NextResponse } from 'next/server';
import { lerModelo, gravarModelo } from '@/lib/store';
import { MODELO_PADRAO } from '@/lib/defaults';
import { limparModelo } from '@/lib/seguranca';
import { semLogin } from '@/lib/sessao';

export const dynamic = 'force-dynamic';

export async function GET() {
  const negado = await semLogin();
  if (negado) return negado;
  return NextResponse.json({ ...MODELO_PADRAO, ...((await lerModelo()) || {}) });
}

export async function PUT(req) {
  const negado = await semLogin();
  if (negado) return negado;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ erro: 'Dados inválidos.' }, { status: 400 });
  }
  const m = limparModelo(body, MODELO_PADRAO);
  try {
    await gravarModelo({ ...MODELO_PADRAO, ...m });
  } catch (e) {
    return NextResponse.json({ erro: e.message || 'Falha ao salvar o modelo.' }, { status: 500 });
  }
  return NextResponse.json({ ...MODELO_PADRAO, ...m });
}
