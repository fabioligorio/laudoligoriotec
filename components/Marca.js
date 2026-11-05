// Logo oficial LigorioTec (brandbook v2, 21/10/2026):
// monograma LT em quadrado Verde Conecta + nome "LigorioTec" em Space Grotesk 700.
// Fundo claro: "Ligorio" preto e "Tec" Verde Profundo. Fundo escuro: "Ligorio" branco e "Tec" Verde Conecta.

export const COR = {
  preto: '#0B0F0D',
  verde: '#14E07A',
  verdeProfundo: '#0A7A43',
  cinzaClaro: '#9AA7A0',
  grafite: '#5A6660',
  nevoa: '#F2F5F3',
};

export function Simbolo({ tamanho = 40, className = '' }) {
  return (
    <svg className={className} width={tamanho} height={tamanho} viewBox="0 0 96 96" role="img" aria-label="LigorioTec">
      <rect width="96" height="96" rx="22" fill={COR.verde} />
      <g transform="translate(-4 2)">
        <path d="M26 28V64H44M50 28H78M64 28V64" fill="none" stroke={COR.preto} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

// altura = altura do símbolo em px; o nome acompanha a proporção do arquivo oficial (540 × 96)
export function Logo({ escuro = false, altura = 40, className = '' }) {
  return (
    <span
      className={'lt-logo ' + className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: altura * 0.25, lineHeight: 1 }}
      aria-label="LigorioTec"
      role="img"
    >
      <Simbolo tamanho={altura} />
      <span
        aria-hidden="true"
        style={{
          fontFamily: '"Space Grotesk", "Segoe UI", Arial, sans-serif',
          fontWeight: 700,
          fontSize: altura * 0.75,
          letterSpacing: '-0.04em',
          color: escuro ? '#ffffff' : COR.preto,
          whiteSpace: 'nowrap',
        }}
      >
        Ligorio<span style={{ color: escuro ? COR.verde : COR.verdeProfundo }}>Tec</span>
      </span>
    </span>
  );
}
