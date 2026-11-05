export const brl = (n) =>
  (Number(n) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fdate = (d) => {
  if (!d) return '';
  const [y, m, dd] = String(d).split('-');
  return `${dd}/${m}/${y}`;
};

export function autoNum(r) {
  const d = r.data || '';
  const [y = '', m = '', dd = ''] = d.split('-');
  const model = String(r.equip || '').trim().split(/\s+/).pop() || '';
  const code = model.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return `${y}-${m}${dd}${code ? '-' + code : ''}`;
}

export const numero = (r) => String(r.num || '').trim() || autoNum(r);

// Lista de peças/produtos do orçamento.
// Relatórios antigos tinham uma peça só (peca / pecaV / newPhoto): são convertidos aqui.
export function pecasDe(r) {
  if (Array.isArray(r.pecas)) return r.pecas;
  if (r.peca) return [{ nome: r.peca, qtd: 1, valor: r.pecaV, foto: r.newPhoto || '' }];
  return [];
}

export const qtdDe = (p) => Math.max(1, Number(p.qtd) || 1);
export const subtotalDe = (p) => qtdDe(p) * (Number(p.valor) || 0);

export function itensDoOrcamento(r) {
  const it = (r.itens || [])
    .filter((i) => i[0] || i[1])
    .map((i) => [i[0], Number(i[1]) || 0]);
  if (r.pecaItem) {
    for (const p of pecasDe(r)) {
      if (!String(p.nome || '').trim()) continue;
      const q = qtdDe(p);
      it.push([`Peça: ${p.nome}${q > 1 ? ` (${q} un. × R$ ${brl(p.valor)})` : ''}`, subtotalDe(p)]);
    }
  }
  return it;
}

export const totalDoOrcamento = (r) => itensDoOrcamento(r).reduce((a, b) => a + b[1], 0);

export const linhas = (txt) =>
  String(txt || '').split('\n').map((s) => s.trim()).filter(Boolean);

// Junta linhas quebradas no meio de uma frase (texto colado do WhatsApp, PDF etc.).
// Uma linha nova só começa um item quando:
//  - há uma linha em branco antes, ou
//  - a linha anterior termina com . ! ? : ;  ou
//  - a linha começa com letra maiúscula, número ou marcador (-, •, *).
// Se a linha começa com letra minúscula, ela continua a frase anterior.
const MARCADOR = /^[-•*·–]\s*/;
export function itens(txt) {
  const out = [];
  let quebra = true;
  for (const bruta of String(txt || '').replace(/\r/g, '').split('\n')) {
    const l = bruta.trim();
    if (!l) { quebra = true; continue; }
    const temMarcador = MARCADOR.test(l);
    const limpa = l.replace(MARCADOR, '').trim();
    if (!limpa) continue;
    const anterior = out[out.length - 1];
    const novo =
      quebra || !anterior || temMarcador ||
      /[.!?:;]$/.test(anterior) ||
      /^[\p{Lu}\d"“(]/u.test(limpa);
    if (novo) out.push(limpa);
    else out[out.length - 1] = anterior.replace(/-$/, '') + (anterior.endsWith('-') ? '' : ' ') + limpa;
    quebra = false;
  }
  return out;
}

// Para os campos de texto corrido: mesma regra, devolvendo os parágrafos.
export const paragrafos = (txt) => itens(txt).join('\n');

export function resumo(r) {
  return {
    id: r.id,
    status: r.status,
    cliente: r.cliente,
    equip: r.equip,
    num: numero(r),
    data: r.data,
    resultado: r.resultado,
    total: totalDoOrcamento(r),
    atualizadoEm: r.atualizadoEm,
  };
}
