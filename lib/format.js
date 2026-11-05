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

export function itensDoOrcamento(r) {
  const it = (r.itens || [])
    .filter((i) => i[0] || i[1])
    .map((i) => [i[0], Number(i[1]) || 0]);
  if (r.pecaItem && r.peca) it.push(['Peça: ' + r.peca, Number(r.pecaV) || 0]);
  return it;
}

export const totalDoOrcamento = (r) => itensDoOrcamento(r).reduce((a, b) => a + b[1], 0);

export const linhas = (txt) =>
  String(txt || '').split('\n').map((s) => s.trim()).filter(Boolean);

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
