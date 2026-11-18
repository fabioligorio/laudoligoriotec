import { NextResponse } from 'next/server';
import { visitaPorToken, gravarVisita, contarTentativa } from '@/lib/store';

export const dynamic = 'force-dynamic';

const ipDe = (req) =>
  (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'local';

// O cliente confirma a visita pelo link (público, sem senha)
export async function POST(req) {
  const origem = req.headers.get('origin');
  if (origem && origem !== req.nextUrl.origin) {
    return NextResponse.json({ erro: 'Origem não permitida.' }, { status: 403 });
  }
  const n = await contarTentativa(`visita-confirmar:${ipDe(req)}`, 3600).catch(() => 0);
  if (n > 20) return NextResponse.json({ erro: 'Muitas tentativas. Fale com a gente pelo WhatsApp.' }, { status: 429 });

  const { token } = await req.json().catch(() => ({}));
  const v = await visitaPorToken(String(token || ''));
  if (!v) return NextResponse.json({ erro: 'Link inválido.' }, { status: 404 });
  if (!v.agendaDia) return NextResponse.json({ erro: 'A visita ainda não tem dia marcado.' }, { status: 409 });
  if (v.status === 'cancelada') return NextResponse.json({ erro: 'Esta visita foi cancelada.' }, { status: 409 });
  if (!v.confirmadoEm) {
    const agora = new Date().toISOString();
    await gravarVisita({ ...v, confirmadoEm: agora, atualizadoEm: agora });
    return NextResponse.json({ confirmadoEm: agora });
  }
  return NextResponse.json({ confirmadoEm: v.confirmadoEm });
}
