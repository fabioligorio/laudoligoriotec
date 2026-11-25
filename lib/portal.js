// Junta tudo o que é de um cliente: visitas, laudos/orçamentos e propostas (só no servidor)
import { todosRelatorios, listarVisitas, listarPropostas, lerRelatorio, gravarRelatorio, lerVisita, gravarVisita, lerProposta, gravarProposta } from './store';
import { numero, totalDoOrcamento } from './format';
import { totalProposta, numeroProposta, validaAte } from './propostas';
import { parecido } from './clientes';

async function tudo() {
  const [relatorios, visitas, propostas] = await Promise.all([
    todosRelatorios(), listarVisitas().catch(() => []), listarPropostas().catch(() => []),
  ]);
  return { relatorios, visitas, propostas };
}

// Resumo de cada item, com o link público dele (se estiver ativo)
const resRel = (r) => ({
  tipo: 'relatorio', id: r.id, titulo: r.equip || 'Equipamento', num: numero(r), data: r.data,
  status: r.status, soOrcamento: r.tipo === 'orcamento', total: totalDoOrcamento(r), cliente: r.cliente,
  link: r.compartilhar?.ativo && r.compartilhar?.token ? `/c/${r.compartilhar.token}` : '',
});
const resVis = (v) => ({
  tipo: 'visita', id: v.id, titulo: [v.equipamento, v.marca].filter(Boolean).join(' · '), data: v.agendaDia || String(v.criadoEm || '').slice(0, 10),
  hora: v.agendaHora || '', status: v.status, confirmada: !!v.confirmadoEm, cliente: v.nome,
  link: v.token ? `/visita/${v.token}` : '',
});
const resProp = (p) => ({
  tipo: 'proposta', id: p.id, titulo: p.titulo || 'Proposta comercial', num: numeroProposta(p), data: p.data,
  status: p.status, total: totalProposta(p), validaAte: validaAte(p), cliente: p.cliente,
  link: p.token && p.linkAtivo ? `/p/${p.token}` : '',
});
const porData = (a, b) => String(b.data || '').localeCompare(String(a.data || ''));

// Para a tela interna do cliente: os itens dele e as sugestões (itens soltos com nome ou WhatsApp parecido)
export async function itensDoCliente(c) {
  const t = await tudo();
  const meus = [
    ...t.visitas.filter((v) => v.clienteId === c.id).map(resVis),
    ...t.relatorios.filter((r) => r.clienteId === c.id).map(resRel),
    ...t.propostas.filter((p) => p.clienteId === c.id).map(resProp),
  ].sort(porData);
  const sugestoes = [
    ...t.visitas.filter((v) => !v.clienteId && parecido(c, v.nome, v.whatsapp)).map(resVis),
    ...t.relatorios.filter((r) => !r.clienteId && parecido(c, r.cliente, '')).map(resRel),
    ...t.propostas.filter((p) => !p.clienteId && parecido(c, p.cliente, p.clienteZap)).map(resProp),
  ].sort(porData);
  const soltos = [
    ...t.visitas.filter((v) => !v.clienteId).map(resVis),
    ...t.relatorios.filter((r) => !r.clienteId).map(resRel),
    ...t.propostas.filter((p) => !p.clienteId).map(resProp),
  ].sort(porData);
  return { itens: meus, sugestoes, soltos };
}

// Quantos itens cada cliente tem (para a lista)
export async function contagens() {
  const t = await tudo();
  const n = {};
  for (const x of [...t.visitas, ...t.relatorios, ...t.propostas]) if (x.clienteId) n[x.clienteId] = (n[x.clienteId] || 0) + 1;
  return n;
}

// Para o link do cliente: só o que já tem link ativo (e as visitas já feitas, como histórico)
export async function portalDoCliente(c) {
  const t = await tudo();
  const visitas = t.visitas.filter((v) => v.clienteId === c.id && (v.token || v.status === 'realizada')).map(resVis).sort(porData);
  const relatorios = t.relatorios.filter((r) => r.clienteId === c.id).map(resRel).filter((r) => r.link).sort(porData);
  const propostas = t.propostas.filter((p) => p.clienteId === c.id).map(resProp).filter((p) => p.link).sort(porData);
  // o cliente não precisa do id interno de cada item
  const limpa = (l) => l.map(({ id, cliente, ...x }) => x);
  return { visitas: limpa(visitas), relatorios: limpa(relatorios), propostas: limpa(propostas) };
}

// Liga ou solta um item de um cliente
const LER = { relatorio: lerRelatorio, visita: lerVisita, proposta: lerProposta };
const GRAVAR = { relatorio: gravarRelatorio, visita: gravarVisita, proposta: gravarProposta };
export async function vincular(tipo, id, clienteId) {
  if (!LER[tipo]) return false;
  const item = await LER[tipo](id);
  if (!item) return false;
  await GRAVAR[tipo]({ ...item, clienteId: clienteId || '' });
  return true;
}

// Soltar todos os itens de um cliente (quando o cliente é excluído)
export async function soltarTodos(clienteId) {
  const t = await tudo();
  for (const r of t.relatorios.filter((x) => x.clienteId === clienteId)) await gravarRelatorio({ ...r, clienteId: '' });
  for (const v of t.visitas.filter((x) => x.clienteId === clienteId)) await gravarVisita({ ...v, clienteId: '' });
  for (const p of t.propostas.filter((x) => x.clienteId === clienteId)) await gravarProposta({ ...p, clienteId: '' });
}
