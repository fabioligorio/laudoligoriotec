// Situações de um relatório.
// rascunho e aguardando podem ser editados; concluido fica travado.
export const STATUS = {
  rascunho: { rotulo: 'Rascunho', curto: 'Rascunho' },
  aguardando: { rotulo: 'Aguardando autorização', curto: 'Aguardando' },
  concluido: { rotulo: 'Concluído', curto: 'Concluído' },
};

export const ORDEM_STATUS = ['rascunho', 'aguardando', 'concluido'];

export const rotuloStatus = (s) => (STATUS[s] || STATUS.rascunho).rotulo;
export const editavel = (s) => s !== 'concluido';
