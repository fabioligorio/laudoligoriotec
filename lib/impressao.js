// Ajusta cada folha para caber numa página A4 antes de imprimir.
// Roda ao clicar nos botões de PDF e também no Ctrl+P (evento beforeprint).
const LIMITE = 1116; // altura útil de uma página A4 em px (297 mm ≈ 1122 px), com folga

export function ajustarFolhas() {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.page').forEach((p) => {
    p.classList.remove('longa');
    p.style.removeProperty('--fit');
    // mede a altura real do conteúdo, sem a altura mínima que a folha tem na tela
    p.style.minHeight = '0';
    const altura = p.scrollHeight;
    p.style.minHeight = '';
    if (altura <= LIMITE) return;
    const fit = LIMITE / altura;
    if (fit >= 0.8) {
      p.style.setProperty('--fit', fit.toFixed(4));
    } else {
      // conteúdo muito grande: reduz até 80% e deixa continuar na página seguinte
      p.style.setProperty('--fit', '0.8');
      p.classList.add('longa');
    }
  });
}

// qual: 'B' = laudo e orçamento, 'L' = só laudo, 'O' = só orçamento
export function imprimir(qual = 'B') {
  const limpar = () => {
    delete document.body.dataset.imprimir;
    window.removeEventListener('afterprint', limpar);
  };
  document.body.dataset.imprimir = qual;
  window.addEventListener('afterprint', limpar);
  ajustarFolhas();
  window.print();
}

// Espera as fontes e as fotos carregarem (senão a medida sai errada)
export async function esperarCarregar() {
  try { await document.fonts?.ready; } catch {}
  const imgs = [...document.querySelectorAll('.page img')];
  await Promise.all(
    imgs.map((img) =>
      img.complete ? null : new Promise((ok) => { img.onload = ok; img.onerror = ok; })
    )
  );
}
