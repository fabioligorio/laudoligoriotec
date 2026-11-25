import { NextResponse } from 'next/server';
import { lerProposta, gravarProposta, gravarLinkProposta, apagarLinkProposta } from '@/lib/store';
import { semLogin } from '@/lib/sessao';

export const dynamic = 'force-dynamic';

const novoToken = () =>
  [...crypto.getRandomValues(new Uint8Array(18))].map((b) => b.toString(16).padStart(2, '0')).join('');

// body: { acao: 'gerar' | 'novo' | 'desativar' | 'ativar' }
export async function POST(req, { params }) {
  params = await params;
  const negado = await semLogin();
  if (negado) return negado;
  const p = await lerProposta(params.id);
  if (!p) return NextResponse.json({ erro: 'Proposta não encontrada.' }, { status: 404 });
  const { acao = 'gerar' } = await req.json().catch(() => ({}));
  const novo = { ...p, atualizadoEm: new Date().toISOString() };

  if (acao === 'novo' || (acao === 'gerar' && !p.token)) {
    await apagarLinkProposta(p.token);
    novo.token = novoToken();
    novo.linkAtivo = true;
    await gravarLinkProposta(novo.token, p.id);
  } else if (acao === 'gerar' || acao === 'ativar') {
    novo.linkAtivo = true;
  } else if (acao === 'desativar') {
    novo.linkAtivo = false;
  } else {
    return NextResponse.json({ erro: 'Ação inválida.' }, { status: 400 });
  }
  if (novo.linkAtivo && novo.status === 'rascunho') {
    novo.status = 'enviada';
    novo.enviadaEm = novo.atualizadoEm;
  }
  await gravarProposta(novo);
  return NextResponse.json(novo);
}
