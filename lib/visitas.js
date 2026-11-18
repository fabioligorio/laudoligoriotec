// Solicitação de visita técnica de avaliação (formulário público)

export const EQUIPAMENTOS = [
  'Portão eletrônico',
  'Interfone / porteiro eletrônico',
  'Câmeras / CFTV',
  'Cerca elétrica / alarme',
  'Máquina de lavar',
  'Geladeira / freezer',
  'Micro-ondas',
  'Ar-condicionado',
  'Outro',
];

export const PERIODOS_VISITA = ['Manhã', 'Tarde', 'Qualquer horário'];

export const STATUS_VISITA = {
  nova: { rotulo: 'Nova', classe: 'aguardando' },
  agendada: { rotulo: 'Agendada', classe: 'rascunho' },
  realizada: { rotulo: 'Visita feita', classe: 'concluido' },
  cancelada: { rotulo: 'Cancelada', classe: 'cancelada' },
};
export const ORDEM_VISITA = ['nova', 'agendada', 'realizada', 'cancelada'];

const txt = (v, max) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);

// Confere e limpa o que veio do formulário. Devolve { dados } ou { erro }.
// interno = criado por você no sistema: só o nome é obrigatório, e dá para marcar dia e hora.
export function validarVisita(b, interno = false) {
  const d = {
    nome: txt(b.nome, 120),
    whatsapp: txt(b.whatsapp, 30),
    endereco: txt(b.endereco, 200),
    bairro: txt(b.bairro, 80),
    cidade: txt(b.cidade, 80),
    equipamento: EQUIPAMENTOS.includes(b.equipamento) ? b.equipamento : 'Outro',
    marca: txt(b.marca, 120),
    problema: txt(b.problema, 2000),
    dia: /^\d{4}-\d{2}-\d{2}$/.test(String(b.dia || '')) ? String(b.dia) : '',
    periodo: PERIODOS_VISITA.includes(b.periodo) ? b.periodo : 'Qualquer horário',
  };
  if (interno) {
    d.agendaDia = /^\d{4}-\d{2}-\d{2}$/.test(String(b.agendaDia || '')) ? String(b.agendaDia) : '';
    d.agendaHora = /^([01]\d|2[0-3]):[0-5]\d$/.test(String(b.agendaHora || '')) ? String(b.agendaHora) : '';
    d.taxa = txt(b.taxa, 120);
  }
  const digitos = d.whatsapp.replace(/\D/g, '');
  if (d.nome.length < 2) return { erro: interno ? 'Informe o nome do cliente.' : 'Informe o seu nome.' };
  if (interno) {
    if (digitos && (digitos.length < 10 || digitos.length > 13)) return { erro: 'WhatsApp do cliente incompleto (use o DDD).' };
    return { dados: d };
  }
  if (digitos.length < 10 || digitos.length > 13) return { erro: 'Informe um WhatsApp com DDD.' };
  if (d.endereco.length < 4) return { erro: 'Informe o endereço da visita.' };
  if (d.problema.length < 5) return { erro: 'Conte rapidamente qual é o problema.' };
  return { dados: d };
}

export const novoTokenVisita = () =>
  [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, '0')).join('');

// "quinta-feira, 20/11 às 14:00"
export function textoAgenda(v) {
  if (!v?.agendaDia) return '';
  const [y, m, d] = v.agendaDia.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const w = dt.toLocaleDateString('pt-BR', { weekday: 'long' });
  const sem = w.charAt(0).toUpperCase() + w.slice(1);
  return `${sem}, ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}${v.agendaHora ? ` às ${v.agendaHora}` : ''}`;
}

// Link do WhatsApp para falar com o cliente (número brasileiro)
export function zapDoCliente(numero) {
  let n = String(numero || '').replace(/\D/g, '');
  if (n.length === 10 || n.length === 11) n = '55' + n;
  return n.length >= 12 ? `https://wa.me/${n}` : '';
}
