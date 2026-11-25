import { NextResponse } from 'next/server';
import { lerCliente, gravarCliente, excluirCliente, gravarLinkCliente, apagarLinkCliente } from '@/lib/store';
import { validarCliente, novoTokenCliente, TIPOS_ITEM } from '@/lib/clientes';
import { itensDoCliente, vincular, soltarTodos } from '@/lib/portal';
import { semLogin } from '@/lib/sessao';

export const dynamic = 'force-dynamic';

const valido = (x) => x && TIPOS_ITEM.includes(x.tipo) && /^[\w-]{8,64}$/.test(String(x.id || ''));

export async function GET(_req, { params }) {
  params = await params;
  const negado = await semLogin();
  if (negado) return negado;
  const c = await lerCliente(params.id);
  if (!c) return NextResponse.json({ erro: 'Cliente não encontrado.' }, { status: 404 });
  return NextResponse.json({ cliente: c, ...(await itensDoCliente(c)) });
}

// body: { dados? } | { vincular: {tipo,id} } | { desvincular: {tipo,id} } | { link: 'novo'|'desativar'|'ativar' }
export async function PUT(req, { params }) {
  params = await params;
  const negado = await semLogin();
  if (negado) return negado;
  const c = await lerCliente(params.id);
  if (!c) return NextResponse.json({ erro: 'Cliente não encontrado.' }, { status: 404 });
  const corpo = await req.json().catch(() => ({}));
  const novo = { ...c, atualizadoEm: new Date().toISOString() };

  if (corpo.dados) {
    const { dados, erro } = validarCliente(corpo.dados);
    if (erro) return NextResponse.json({ erro }, { status: 400 });
    Object.assign(novo, dados);
  }
  if (corpo.vincular) {
    if (!valido(corpo.vincular)) return NextResponse.json({ erro: 'Item inválido.' }, { status: 400 });
    if (!(await vincular(corpo.vincular.tipo, corpo.vincular.id, c.id))) return NextResponse.json({ erro: 'Item não encontrado.' }, { status: 404 });
  }
  if (corpo.desvincular) {
    if (!valido(corpo.desvincular)) return NextResponse.json({ erro: 'Item inválido.' }, { status: 400 });
    await vincular(corpo.desvincular.tipo, corpo.desvincular.id, '');
  }
  if (corpo.link === 'novo') {
    await apagarLinkCliente(c.token);
    novo.token = novoTokenCliente();
    novo.linkAtivo = true;
    await gravarLinkCliente(novo.token, c.id);
  } else if (corpo.link === 'desativar') {
    novo.linkAtivo = false;
  } else if (corpo.link === 'ativar') {
    novo.linkAtivo = true;
  }
  await gravarCliente(novo);
  return NextResponse.json({ cliente: novo, ...(await itensDoCliente(novo)) });
}

// Exclui só o cadastro: os laudos, visitas e propostas continuam no sistema, soltos
export async function DELETE(_req, { params }) {
  params = await params;
  const negado = await semLogin();
  if (negado) return negado;
  const c = await lerCliente(params.id);
  if (!c) return NextResponse.json({ erro: 'Cliente não encontrado.' }, { status: 404 });
  await soltarTodos(c.id);
  await apagarLinkCliente(c.token);
  await excluirCliente(c.id);
  return NextResponse.json({ ok: true });
}
