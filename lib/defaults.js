// Modelo padrão: é o ponto de partida de todo relatório novo.
// Ele pode ser alterado pela tela "Modelo" do sistema; este arquivo só vale
// enquanto nenhum modelo foi salvo.
export const MODELO_PADRAO = {
  tecnico: 'Fábio de Ligorio',
  site: 'www.ligoriotec.com.br',
  zap: '31 996021883',
  icone: 'lavadora',
  equip: '',
  comp: '',
  alim: '127 V / 60 Hz',
  proc: [
    'Medição de resistência dos enrolamentos do motor.',
    'Teste de isolamento entre terminais e carcaça.',
    'Verificação do sistema mecânico da transmissão.',
    'Avaliação funcional do capacitor.',
    'Teste de partida com auxílio manual.',
  ].join('\n'),
  ensaios: [
    'Branco ↔ Amarelo',
    'Branco ↔ Vermelho',
    'Amarelo ↔ Vermelho',
    'Terminais ↔ Carcaça',
    'Capacitor',
    'Sistema mecânico',
    'Partida manual',
  ].join('\n'),
  servicos: [
    ['Diagnóstico técnico do equipamento', 120],
    ['Mão de obra de substituição', 150],
  ],
  tDef: 'Peça atual (defeituosa)',
  tNew: 'Peça nova (substituição)',
  gar: 'Garantia da peça: 90 dias (conforme fabricante)\nGarantia da mão de obra: 90 dias',
  garObs: '*A garantia não cobre mau uso, instalação incorreta ou fatores externos.',
  pag: 'Pagamento à vista ou via PIX',
  prazo: 'a combinar após aprovação do orçamento.',
};

// Dados da empresa: entram sozinhos em todo relatório novo
export const CAMPOS_DA_EMPRESA = ['tecnico', 'site', 'zap', 'icone', 'tDef', 'tNew'];

// Textos padrão: só entram quando você clica em "Preencher com o modelo"
export const CAMPOS_DE_TEXTO = ['equip', 'comp', 'alim', 'proc', 'gar', 'garObs', 'pag', 'prazo'];

const vazio = (v) => !String(v ?? '').trim();
const linhasVazias = (arr) => !(arr || []).some((l) => !vazio(l[0]) || !vazio(l[1]));

// Preenche só o que estiver em branco no relatório, sem apagar nada que já foi digitado.
export function aplicarModelo(r, modelo) {
  const m = { ...MODELO_PADRAO, ...(modelo || {}) };
  const novo = { ...r };
  for (const k of CAMPOS_DE_TEXTO) if (vazio(novo[k]) && !vazio(m[k])) novo[k] = m[k];
  if (linhasVazias(novo.res)) {
    const ens = String(m.ensaios || '').split('\n').map((s) => s.trim()).filter(Boolean);
    if (ens.length) novo.res = ens.map((e) => [e, '']);
  }
  if (linhasVazias(novo.itens) && (m.servicos || []).length) {
    novo.itens = m.servicos.map((s) => [s[0], s[1]]);
  }
  return novo;
}

export function hojeISO() {
  // Data de hoje no fuso de Brasília, formato AAAA-MM-DD
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
}

export function novoRelatorio(modelo) {
  const m = { ...MODELO_PADRAO, ...(modelo || {}) };
  const agora = new Date().toISOString();
  const r = {
    id: crypto.randomUUID(),
    status: 'rascunho',
    criadoEm: agora,
    atualizadoEm: agora,
    concluidoEm: null,
    cliente: '',
    data: hojeISO(),
    num: '',
    equip: '',
    comp: '',
    alim: '',
    eqPhoto: '',
    recl: '',
    proc: '',
    res: [['', '']],
    diag: '',
    concl: '',
    resultado: 'REPROVADO',
    defPhotos: [],
    pecas: [], // [{ nome, qtd, valor, foto }]
    pecaItem: true,
    itens: [['', '']],
    gar: '',
    garObs: '',
    pag: '',
    prazo: '',
    videos: [], // [{ titulo, url, tipo: 'arquivo' | 'link' }]
    msgCliente: '',
    compartilhar: null, // { token, ativo, criadoEm }
  };
  for (const k of CAMPOS_DA_EMPRESA) r[k] = m[k];
  return r;
}

// Atendimento real usado como exemplo (o PDF que deu origem ao modelo)
export function relatorioExemplo() {
  const r = aplicarModelo(novoRelatorio(MODELO_PADRAO), MODELO_PADRAO);
  return {
    ...r,
    cliente: 'Júlia',
    data: '2026-06-02',
    num: '2026-0602-LAC11',
    equip: 'Lavadora Electrolux LAC11',
    comp: 'Motor WEG Código 64502279',
    alim: '127 V / 60 Hz / 3,0 A',
    tDef: 'Motor atual (defeituoso)',
    tNew: 'Motor novo (substituição)',
    recl: 'Equipamento liga normalmente, porém o motor permanece energizado, emitindo ruído característico de funcionamento sem desenvolver rotação.',
    res: [
      ['Branco ↔ Amarelo', '7,6 Ω'],
      ['Branco ↔ Vermelho', 'Circuito Aberto'],
      ['Amarelo ↔ Vermelho', 'Circuito Aberto'],
      ['Terminais ↔ Carcaça', 'Sem fuga elétrica'],
      ['Capacitor', 'Sem indícios de defeito'],
      ['Sistema mecânico', 'Livre, sem travamentos'],
      ['Partida manual', 'Motor não entra em rotação'],
    ],
    diag: 'Os ensaios realizados indicam forte evidência de falha interna no motor elétrico WEG código 64502279. Foi constatada ausência de continuidade elétrica em parte do circuito interno do motor, incompatível com o funcionamento normal do conjunto. O comportamento operacional observado é compatível com enrolamento interrompido, protetor térmico aberto ou rompimento de conexão interna.',
    concl: 'Motor reprovado nos testes elétricos e funcionais realizados. Recomenda-se desmontagem especializada para inspeção interna ou substituição do conjunto motriz.',
    resultado: 'REPROVADO',
    defPhotos: ['/exemplo/f0.jpg', '/exemplo/f1.jpg', '/exemplo/f2.jpg', '/exemplo/f3.jpg'],
    pecas: [
      { nome: 'Motor Lavadora Electrolux Lte12 Lac11 Lac12 220v Original', qtd: 1, valor: 352, foto: '/exemplo/f4.jpg' },
    ],
    pecaItem: true,
    itens: [
      ['Diagnóstico técnico do equipamento', 120],
      ['Substituição completa do motor', 150],
    ],
  };
}
