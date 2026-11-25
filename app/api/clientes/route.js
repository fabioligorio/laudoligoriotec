import { NextResponse } from 'next/server';
import { listarClientes, gravarCliente, gravarLinkCliente } from '@/lib/store';
import { validarCliente, novoTokenCliente } from '@/lib/clientes';
import { contagens } from '@/lib/portal';
import { semLogin } from '@/lib/sessao';

export const dynamic = 'force-dynamic';

export async function GET() {
  const negado = await semLogin();
  if (negado) return negado;
  const [lista, n] = await Promise.all([listarClientes(), contagens()]);
  return NextResponse.json(lista.map((c) => ({ ...c, itens: n[c.id] || 0 })));
}

// Novo cliente, já com o link dele pronto
export async function POST(req) {
  const negado = await semLogin();
  if (negado) return negado;
  const { dados, erro } = validarCliente(await req.json().catch(() => ({})));
  if (erro) return NextResponse.json({ erro }, { status: 400 });
  const agora = new Date().toISOString();
  const c = { id: crypto.randomUUID(), ...dados, token: novoTokenCliente(), linkAtivo: true, criadoEm: agora, atualizadoEm: agora };
  await gravarCliente(c);
  await gravarLinkCliente(c.token, c.id);
  return NextResponse.json(c, { status: 201 });
}
