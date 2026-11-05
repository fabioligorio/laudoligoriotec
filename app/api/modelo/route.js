import { NextResponse } from 'next/server';
import { lerModelo, gravarModelo } from '@/lib/store';
import { MODELO_PADRAO } from '@/lib/defaults';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ ...MODELO_PADRAO, ...((await lerModelo()) || {}) });
}

export async function PUT(req) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ erro: 'Dados inválidos.' }, { status: 400 });
  }
  const m = {};
  for (const k of Object.keys(MODELO_PADRAO)) if (k in body) m[k] = body[k];
  try {
    await gravarModelo({ ...MODELO_PADRAO, ...m });
  } catch (e) {
    return NextResponse.json({ erro: e.message || 'Falha ao salvar o modelo.' }, { status: 500 });
  }
  return NextResponse.json({ ...MODELO_PADRAO, ...m });
}
