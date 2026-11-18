import { NextResponse } from 'next/server';
import { gravarVisita, contarTentativa } from '@/lib/store';
import { validarVisita } from '@/lib/visitas';

export const dynamic = 'force-dynamic';

const LIMITE = 5; // pedidos por hora vindos do mesmo endereço
const JANELA = 60 * 60;
const ipDe = (req) =>
  (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'local';

// Formulário público de solicitação de visita (não precisa de login)
export async function POST(req) {
  // só aceita envios da própria página
  const origem = req.headers.get('origin');
  if (origem && origem !== req.nextUrl.origin) {
    return NextResponse.json({ erro: 'Origem não permitida.' }, { status: 403 });
  }
  const texto = await req.text().catch(() => '');
  if (texto.length > 10000) return NextResponse.json({ erro: 'Mensagem grande demais.' }, { status: 413 });
  let corpo = {};
  try { corpo = JSON.parse(texto || '{}'); } catch {}

  // campo escondido: só robôs preenchem
  if (corpo.site) return NextResponse.json({ ok: true });

  const n = await contarTentativa(`visita:${ipDe(req)}`, JANELA).catch(() => 0);
  if (n > LIMITE) {
    return NextResponse.json({ erro: 'Muitos pedidos seguidos. Fale com a gente pelo WhatsApp.' }, { status: 429 });
  }

  const { dados, erro } = validarVisita(corpo);
  if (erro) return NextResponse.json({ erro }, { status: 400 });

  const agora = new Date().toISOString();
  const v = { id: crypto.randomUUID(), ...dados, status: 'nova', obs: '', relatorioId: '', criadoEm: agora, atualizadoEm: agora };
  try {
    await gravarVisita(v);
  } catch {
    return NextResponse.json({ erro: 'Não foi possível enviar agora. Fale com a gente pelo WhatsApp.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
