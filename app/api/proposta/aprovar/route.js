import { NextResponse } from 'next/server';
import { propostaPorToken, gravarProposta, contarTentativa } from '@/lib/store';
import { vencida } from '@/lib/propostas';

export const dynamic = 'force-dynamic';

const ipDe = (req) =>
  (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'local';

// O cliente aprova a proposta pelo link (público, sem senha)
export async function POST(req) {
  const origem = req.headers.get('origin');
  if (origem && origem !== req.nextUrl.origin) {
    return NextResponse.json({ erro: 'Origem não permitida.' }, { status: 403 });
  }
  const ip = ipDe(req);
  const n = await contarTentativa(`proposta-aprovar:${ip}`, 3600).catch(() => 0);
  if (n > 20) return NextResponse.json({ erro: 'Muitas tentativas. Fale com a gente pelo WhatsApp.' }, { status: 429 });

  const { token, nome } = await req.json().catch(() => ({}));
  const p = await propostaPorToken(String(token || ''));
  if (!p) return NextResponse.json({ erro: 'Link inválido.' }, { status: 404 });
  const quem = String(nome || '').replace(/\s+/g, ' ').trim().slice(0, 120);
  if (quem.length < 3) return NextResponse.json({ erro: 'Digite o seu nome completo para aprovar.' }, { status: 400 });
  if (p.status === 'aprovada') return NextResponse.json({ aprovacao: { nome: p.aprovacao?.nome, em: p.aprovacao?.em } });
  if (p.status === 'recusada') return NextResponse.json({ erro: 'Esta proposta foi encerrada. Fale com a gente pelo WhatsApp.' }, { status: 409 });
  if (vencida(p)) return NextResponse.json({ erro: 'A validade desta proposta terminou. Fale com a gente para atualizar.' }, { status: 409 });

  const agora = new Date().toISOString();
  // fica registrado quem aprovou, quando e de qual endereço de internet
  const aprovacao = { nome: quem, em: agora, ip, navegador: String(req.headers.get('user-agent') || '').slice(0, 200) };
  await gravarProposta({ ...p, status: 'aprovada', aprovacao, atualizadoEm: agora });
  return NextResponse.json({ aprovacao: { nome: quem, em: agora } });
}
