import { NextResponse } from 'next/server';
import { lerRelatorio, gravarRelatorio, gravarLink, apagarLink } from '@/lib/store';

export const dynamic = 'force-dynamic';

const novoToken = () =>
  [...crypto.getRandomValues(new Uint8Array(18))].map((b) => b.toString(16).padStart(2, '0')).join('');

// body: { acao: 'gerar' | 'novo' | 'desativar' | 'ativar' }
//  gerar: cria o link (ou reativa o atual)
//  novo: troca o código (o link antigo para de funcionar)
export async function POST(req, { params }) {
  if (!/^[\w-]{8,64}$/.test(params.id || '')) return NextResponse.json({ erro: 'Id inválido.' }, { status: 400 });
  const r = await lerRelatorio(params.id);
  if (!r) return NextResponse.json({ erro: 'Relatório não encontrado.' }, { status: 404 });
  const { acao = 'gerar' } = await req.json().catch(() => ({}));
  const atual = r.compartilhar || null;
  let comp = atual;

  try {
    if (acao === 'novo' || (acao === 'gerar' && !atual)) {
      if (atual?.token) await apagarLink(atual.token);
      comp = { token: novoToken(), ativo: true, criadoEm: new Date().toISOString() };
      await gravarLink(comp.token, r.id);
    } else if (acao === 'gerar' || acao === 'ativar') {
      comp = { ...atual, ativo: true };
    } else if (acao === 'desativar') {
      if (!atual) return NextResponse.json({ compartilhar: null });
      comp = { ...atual, ativo: false };
    } else {
      return NextResponse.json({ erro: 'Ação inválida.' }, { status: 400 });
    }
    await gravarRelatorio({ ...r, compartilhar: comp });
    return NextResponse.json({ compartilhar: comp });
  } catch (e) {
    return NextResponse.json({ erro: e.message || 'Não foi possível gerar o link.' }, { status: 500 });
  }
}
