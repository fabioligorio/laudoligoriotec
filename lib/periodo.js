// Filtro de período usado no Financeiro
// Data de um atendimento concluído: o dia da conclusão (ou a data da inspeção, nos antigos)
export function dataDoConcluido(r) {
  if (r.concluidoEm) {
    const d = new Date(r.concluidoEm);
    if (!isNaN(d)) {
      const p = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    }
  }
  return String(r.data || '').slice(0, 10);
}

export const PERIODOS = [
  ['mes', 'Este mês'],
  ['passado', 'Mês passado'],
  ['ano', 'Este ano'],
  ['tudo', 'Tudo'],
];

export function noPeriodo(d, periodo) {
  if (periodo === 'tudo') return true;
  if (!d) return false;
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth() + 1;
  const [y, m] = d.split('-').map(Number);
  if (periodo === 'ano') return y === ano;
  if (periodo === 'mes') return y === ano && m === mes;
  const [ap, mp] = mes === 1 ? [ano - 1, 12] : [ano, mes - 1];
  return y === ap && m === mp;
}
