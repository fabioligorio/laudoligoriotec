// Proposta de exemplo (controle de acesso facial H2 Club), para usar como base
import { novaProposta, FECHAMENTO_PADRAO } from './propostas';

export function propostaExemplo() {
  const p = novaProposta();
  return {
    ...p,
    titulo: 'Controle de Acesso Facial',
    cliente: 'H2 Club',
    objeto: 'Fornecimento e implantação de controle de acesso facial (entrada e saída)',
    resumo: 'A LigorioTec propõe ao H2 Club a troca das catracas alugadas por 2 catracas próprias com reconhecimento facial: o sócio entra e sai só mostrando o rosto, sem cartão, senha ou liberação manual pela recepção.',
    secoes: [
      {
        titulo: 'Situação atual',
        texto: [
          'Hoje o clube paga aluguel por catracas que não são suas e depende da recepção para liberar cada passagem.',
          '- Equipamento alugado: custo mensal recorrente, sem que o clube fique com o patrimônio.',
          '- Liberação por botão: a recepcionista precisa reconhecer e liberar cada sócio, o que gera fila nos horários de pico e tira a atenção do atendimento.',
          '- Sem registro confiável: não há histórico automático de quem entrou, quem saiu e a que horas.',
          '- Risco de acesso indevido: quem não é sócio, ou está com o cadastro bloqueado, pode passar por falha humana.',
        ].join('\n'),
        imagens: [],
      },
      {
        titulo: 'Solução proposta',
        texto: [
          'Duas catracas Control iD iDBlock (preta), uma em cada corredor ao lado da recepção, cada uma com 2 leitores faciais Control iD iDFace, um de cada lado do giro.',
          '- Uso diário: a Catraca 1 libera só a entrada e a Catraca 2 libera só a saída. O fluxo fica organizado e sem cruzamento de pessoas.',
          '- Emergências e eventos: como as duas catracas têm leitor dos dois lados, elas podem passar a liberar entrada e saída ao mesmo tempo. Isso dobra a capacidade de passagem na hora em que o clube mais precisa.',
          '- Redundância: se uma catraca parar para manutenção, a outra assume os dois sentidos e o clube não fica sem controle de acesso.',
          '- Equipamento próprio: o clube deixa de pagar aluguel e passa a ter o patrimônio.',
        ].join('\n'),
        imagens: [
          { url: '/exemplo/proposta-catraca.jpg', legenda: 'Catraca Control iD iDBlock preta com leitor facial iDFace' },
          { url: '/exemplo/proposta-layout.png', legenda: 'Layout proposto · 2 catracas, 4 leitores faciais' },
        ],
      },
      {
        titulo: 'Como funciona e o que o clube ganha',
        texto: [
          'O sócio olha para o leitor, o sistema confere se o cadastro está liberado e a catraca libera na hora, sem a recepção precisar apertar botão.',
          '1. Cadastro: a foto do sócio é feita uma vez, importada do banco de dados do sistema interno que o clube já usa, sem recadastrar ninguém.',
          '2. Reconhecimento: o iDFace usa duas câmeras Full HD (luz visível e infravermelho) e detecta rosto vivo, então foto ou vídeo no celular não liberam a catraca.',
          '3. Validação: o sistema confere se o sócio está ativo. Sócio bloqueado ou inadimplente não passa, e a recepção vê o motivo.',
          '4. Registro: cada passagem fica gravada com nome, data, hora e sentido.',
          '',
          '## Benefícios para o H2 Club',
          '- Fim do aluguel mensal das catracas.',
          '- Recepção livre para atender, sem liberar passagem por passagem.',
          '- Entrada sem cartão ou senha: nada para esquecer, emprestar ou perder.',
          '- Bloqueio anti-dupla entrada: uma pessoa por reconhecimento, sem "carona" no giro.',
          '- Relatórios de frequência: horários de pico e quem está dentro do clube em tempo real.',
          '- Convidados e day use por QR Code temporário, sem precisar cadastrar o rosto.',
          '- Mecanismo durável, com mais de 800.000 giros, e silencioso.',
          '',
          'Integração: as catracas funcionam de forma independente pelo software web embarcado e serão integradas ao sistema de gestão do clube, para que a liberação siga o status de cada sócio automaticamente.',
        ].join('\n'),
        imagens: [],
      },
      {
        titulo: 'Escopo de fornecimento',
        texto: [
          'A LigorioTec fornece os equipamentos e faz toda a implantação: configuração, integração com o sistema interno, carga dos sócios e acompanhamento nos primeiros 30 dias. A instalação física fica por conta do clube.',
          '## Incluído',
          '- 2 kits Control iD: catraca iDBlock preta + 2 leitores faciais iDFace cada (4 leitores no total).',
          '- Configuração das regras de acesso: entrada, saída e modo emergência/eventos.',
          '- Integração com o sistema interno de gestão de sócios do clube.',
          '- Cadastro dos sócios a partir do banco de dados do sistema interno, sem recadastro manual.',
          '- Gestão inicial e treinamento da equipe da recepção.',
          '- Acompanhamento direto da LigorioTec nos primeiros 30 dias de funcionamento.',
          '## Não incluído (salvo se acertado à parte)',
          '- Instalação física das catracas (fixação no piso, cabeamento de rede e alimentação): por conta do clube.',
          '- Retirada e devolução das catracas alugadas à locadora.',
          '- Obras civis, troca de piso ou acabamentos.',
          '- Licenças ou mensalidades do sistema interno de gestão do clube.',
        ].join('\n'),
        imagens: [],
      },
    ],
    itens: [
      { desc: 'Kit Control iD: catraca iDBlock preta + 2 leitores faciais iDFace', qtd: 2, valor: 6000 },
      { desc: 'Consultoria de implantação: configuração, integração, carga dos sócios, gestão inicial e acompanhamento de 30 dias', qtd: 1, valor: 3500 },
    ],
    textoInvestimento: 'pago uma única vez, e o equipamento passa a ser do clube',
    opcionais: [
      {
        titulo: 'Suporte mensal: R$ 350,00/mês',
        texto: '- 1 visita presencial por mês.\n- Atendimento remoto ilimitado.\n- Visitas de emergência: R$ 150,00 de deslocamento por visita.',
      },
    ],
    condicoes: [
      ['Forma de pagamento', 'A combinar'],
      ['Prazo de implantação', 'Até 4 dias após as catracas estarem fixadas e ligadas (energia e rede)'],
      ['Garantia dos equipamentos', 'Garantia do fabricante Control iD, conforme o certificado de cada produto'],
      ['Acompanhamento', '30 dias de acompanhamento direto da LigorioTec após a entrada em funcionamento'],
    ],
    fechamento: FECHAMENTO_PADRAO,
  };
}
