// Propostas comerciais de projeto (ex.: controle de acesso, câmeras, automação)
import { fotoSegura } from './seguranca';

export const FORNECEDOR = 'LigorioTec – Assistência e Soluções em Tecnologia';
export const CONTATO = 'WhatsApp (41) 93618-6432 · www.ligoriotec.com.br';
export const WHATSAPP_EMPRESA = '41936186432';

export const STATUS_PROPOSTA = {
  rascunho: { rotulo: 'Rascunho', classe: 'rascunho' },
  enviada: { rotulo: 'Enviada', classe: 'aguardando' },
  aprovada: { rotulo: 'Aprovada', classe: 'concluido' },
  recusada: { rotulo: 'Recusada', classe: 'cancelada' },
};
export const ORDEM_PROPOSTA = ['rascunho', 'enviada', 'aprovada', 'recusada'];

const hoje = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export const numeroProposta = (p) => String(p.num || '').trim() || `P-${String(p.data || '').replace(/-/g, '')}`;

export const subtotal = (i) => Math.max(0, Number(i.qtd) || 0) * (Number(i.valor) || 0);
export const totalProposta = (p) => (p.itens || []).filter((i) => String(i.desc || '').trim()).reduce((a, i) => a + subtotal(i), 0);

// Data limite da proposta (data + validade em dias)
export function validaAte(p) {
  const dias = Number(p.validadeDias) || 0;
  if (!p.data || dias <= 0) return '';
  const [y, m, d] = p.data.split('-').map(Number);
  const dt = new Date(y, m - 1, d + dias);
  const z = (n) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${z(dt.getMonth() + 1)}-${z(dt.getDate())}`;
}
export const vencida = (p) => {
  const ate = validaAte(p);
  return !!ate && ate < hoje() && p.status !== 'aprovada';
};

// "25 de novembro de 2026"
export function dataExtenso(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}

/* Texto das seções, escrito de forma simples:
     linha comum ............ parágrafo
     - item  ou  • item ..... lista com marcador
     1. passo ............... lista numerada
     ## Subtítulo ........... subtítulo
     Coluna 1 | Coluna 2 .... tabela (a primeira linha é o cabeçalho)
   Num item, o trecho antes de ":" fica em negrito (ex.: "Redundância: se uma catraca..."). */
export function blocos(texto) {
  const out = [];
  for (const bruta of String(texto || '').replace(/\r/g, '').split('\n')) {
    const l = bruta.trim();
    if (!l) { out.push({ tipo: 'quebra' }); continue; }
    let m;
    if (l.includes('|') && l.replace(/[|\s-]/g, '')) {
      const cels = l.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const ult = out[out.length - 1];
      if (ult && ult.tipo === 'tab') ult.linhas.push(cels);
      else out.push({ tipo: 'tab', linhas: [cels] });
    } else if ((m = l.match(/^#{2,3}\s+(.*)$/))) out.push({ tipo: 'h', texto: m[1] });
    else if ((m = l.match(/^[-•*–]\s*(.*)$/))) juntar(out, 'ul', m[1]);
    else if ((m = l.match(/^\d+[.)]\s+(.*)$/))) juntar(out, 'ol', m[1]);
    else out.push({ tipo: 'p', texto: l });
  }
  return out.filter((b) => b.tipo !== 'quebra');
}
function juntar(out, tipo, texto) {
  const ult = out[out.length - 1];
  if (ult && ult.tipo === tipo) ult.itens.push(texto);
  else out.push({ tipo, itens: [texto] });
}
// separa "Termo: explicação" para pôr o termo em negrito
export function termo(t) {
  const i = t.indexOf(': ');
  return i > 0 && i <= 60 ? [t.slice(0, i + 1), t.slice(i + 1)] : ['', t];
}

export const CONDICOES_PADRAO = [
  ['Forma de pagamento', 'A combinar'],
  ['Prazo de implantação', ''],
  ['Garantia dos equipamentos', 'Garantia do fabricante, conforme o certificado de cada produto'],
];
export const FECHAMENTO_PADRAO = `Para aprovar ou tirar dúvidas, fale com a LigorioTec pelo ${CONTATO}.`;

export function novaProposta() {
  const agora = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    status: 'rascunho',
    num: '',
    titulo: '',
    cliente: '',
    responsavel: '',
    clienteZap: '',
    data: hoje(),
    validadeDias: 15,
    objeto: '',
    resumo: '',
    secoes: [
      { titulo: 'Situação atual', texto: '', imagens: [] },
      { titulo: 'Solução proposta', texto: '', imagens: [] },
      { titulo: 'Como funciona e o que você ganha', texto: '', imagens: [] },
      { titulo: 'Escopo de fornecimento', texto: '## Incluído\n- \n\n## Não incluído (salvo se acertado à parte)\n- ', imagens: [] },
    ],
    itens: [{ desc: '', qtd: 1, valor: '' }],
    textoInvestimento: '',
    notaInvestimento: '',
    opcionais: [],
    condicoes: CONDICOES_PADRAO.map((c) => [...c]),
    fechamento: FECHAMENTO_PADRAO,
    token: '',
    linkAtivo: false,
    aprovacao: null,
    criadoEm: agora,
    atualizadoEm: agora,
  };
}

// Resumo para as listas e o financeiro
export function resumoProposta(p) {
  return {
    id: p.id, status: p.status, num: numeroProposta(p), titulo: p.titulo, cliente: p.cliente,
    data: p.data, validaAte: validaAte(p), total: totalProposta(p),
    aprovadaEm: p.aprovacao?.em || null, atualizadoEm: p.atualizadoEm,
  };
}

/* ---------- validação do que chega do navegador ---------- */
const txt = (v, max) => String(v ?? '').slice(0, max);
const num = (v) => (v === '' || v == null ? '' : Number.isFinite(Number(v)) ? Number(v) : '');

export const CAMPOS_PROPOSTA = [
  'num', 'titulo', 'cliente', 'responsavel', 'clienteZap', 'data', 'validadeDias', 'objeto', 'resumo',
  'secoes', 'itens', 'textoInvestimento', 'notaInvestimento', 'opcionais', 'condicoes', 'fechamento',
];

export function limparProposta(d) {
  const p = {};
  if (!d || typeof d !== 'object') return p;
  for (const k of CAMPOS_PROPOSTA) {
    if (!(k in d)) continue;
    const v = d[k];
    switch (k) {
      case 'data': p[k] = /^\d{4}-\d{2}-\d{2}$/.test(String(v)) ? String(v) : ''; break;
      case 'validadeDias': p[k] = Math.max(0, Math.min(365, Math.round(Number(v) || 0))); break;
      case 'secoes':
        p[k] = (Array.isArray(v) ? v : []).slice(0, 20).map((s) => ({
          titulo: txt(s?.titulo, 200),
          texto: txt(s?.texto, 10000),
          imagens: (Array.isArray(s?.imagens) ? s.imagens : []).slice(0, 6)
            .map((im) => ({ url: fotoSegura(im?.url), legenda: txt(im?.legenda, 300) }))
            .filter((im) => im.url),
        }));
        break;
      case 'itens':
        p[k] = (Array.isArray(v) ? v : []).slice(0, 60).map((i) => ({ desc: txt(i?.desc, 600), qtd: num(i?.qtd), valor: num(i?.valor) }));
        break;
      case 'opcionais':
        p[k] = (Array.isArray(v) ? v : []).slice(0, 10).map((o) => ({ titulo: txt(o?.titulo, 200), texto: txt(o?.texto, 3000) }));
        break;
      case 'condicoes':
        p[k] = (Array.isArray(v) ? v : []).slice(0, 20).map((c) => [txt(Array.isArray(c) ? c[0] : '', 120), txt(Array.isArray(c) ? c[1] : '', 600)]);
        break;
      case 'resumo': case 'fechamento': case 'notaInvestimento': p[k] = txt(v, 3000); break;
      default: p[k] = txt(v, 300);
    }
  }
  return p;
}

// Só o que o cliente precisa ver no link
export function propostaParaCliente(p) {
  const { token, linkAtivo, criadoEm, atualizadoEm, id, enviadaEm, ...resto } = p;
  return { ...resto, aprovacao: p.aprovacao ? { nome: p.aprovacao.nome, em: p.aprovacao.em } : null };
}
