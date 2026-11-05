// Ícones do documento (cores fixas, o papel é sempre branco)
const AZUL = '#0b4ea2';

export const Pessoa = ({ cor = AZUL }) => (
  <svg viewBox="0 0 24 24" fill={cor}><circle cx="12" cy="7.5" r="4.5" /><path d="M3 21c0-5 4-8 9-8s9 3 9 8z" /></svg>
);
export const Chave = ({ cor = AZUL }) => (
  <svg viewBox="0 0 24 24" fill={cor}><path d="M21.7 6.3l-3.5 3.5-3-.9-.9-3 3.5-3.5A6 6 0 0 0 10.4 10L2.6 17.8a2.2 2.2 0 0 0 3.1 3.1l7.8-7.8a6 6 0 0 0 8.2-6.8z" /></svg>
);
export const Balao = () => (
  <svg viewBox="0 0 24 24" fill={AZUL}><path d="M12 3C6.5 3 2 6.6 2 11c0 2.4 1.3 4.5 3.4 6L4.5 21l4.6-2.4c.9.2 1.9.4 2.9.4 5.5 0 10-3.6 10-8s-4.5-8-10-8z" /></svg>
);
export const Prancheta = () => (
  <svg viewBox="0 0 24 24" fill={AZUL}><path d="M8 2h8v3H8z" /><path fillRule="evenodd" d="M5 4h2v3h10V4h2a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm3 8v1.6h8V12zm0 4v1.6h8V16z" /></svg>
);
export const Pulso = () => (
  <svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="18" rx="2" fill={AZUL} /><path d="M5 12h3l2-4 3 8 2-4h4" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" /></svg>
);
export const Lupa = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke={AZUL} strokeWidth="2.8" strokeLinecap="round"><circle cx="10" cy="10" r="6.5" /><path d="M15 15l6 6" /></svg>
);
export const Visto = ({ cor = AZUL }) => (
  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill={cor} /><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const Xis = () => (
  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#c62828" /><path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" /></svg>
);
export const Alerta = () => (
  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#c62828" /><path d="M12 6.5v7" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" /><circle cx="12" cy="17" r="1.5" fill="#fff" /></svg>
);
export const Camera = () => (
  <svg viewBox="0 0 24 24" fill={AZUL}><path d="M8 4h8l1.5 2H21a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3.5z" /><circle cx="12" cy="13" r="4" fill="#fff" /><circle cx="12" cy="13" r="2.4" fill={AZUL} /></svg>
);
export const Escudo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke={AZUL} strokeWidth="1.7" strokeLinejoin="round"><path d="M12 2.5l8 3v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10v-6z" /><path d="M8.3 12l2.6 2.6 4.8-5" strokeLinecap="round" /></svg>
);
export const Cartao = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke={AZUL} strokeWidth="1.8"><rect x="2.5" y="5" width="19" height="14" rx="2" /><path d="M2.5 9.5h19M6 15h4" /></svg>
);
export const Globo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#1d2433" strokeWidth="1.6"><circle cx="12" cy="12" r="9.5" /><ellipse cx="12" cy="12" rx="4.2" ry="9.5" /><path d="M2.5 12h19M4 7h16M4 17h16" /></svg>
);
export const Telefone = () => (
  <svg viewBox="0 0 24 24"><path d="M12 2.5a9.5 9.5 0 0 0-8.2 14.3L2.5 21.5l4.8-1.3A9.5 9.5 0 1 0 12 2.5z" fill="#2fb34a" /><path d="M8.6 7.6c.3-.4.7-.4 1-.2l1 1.9c.1.3 0 .6-.2.8l-.6.7c.6 1.3 1.8 2.5 3.2 3.2l.7-.6c.2-.2.5-.3.8-.2l1.9 1c.3.2.3.6.1 1l-.6.8c-.5.6-1.3.8-2 .5-2.8-1.1-5-3.3-6.1-6.1-.3-.7-.1-1.5.5-2z" fill="#fff" /></svg>
);

const traco = { fill: 'none', stroke: AZUL, strokeWidth: 2.4, strokeLinejoin: 'round' };
export const DESENHOS = {
  lavadora: (
    <svg viewBox="0 0 120 120" width="118" height="98" {...traco}>
      <rect x="22" y="8" width="76" height="22" rx="4" /><circle cx="40" cy="19" r="4" /><circle cx="60" cy="19" r="4.5" />
      <rect x="70" y="15" width="16" height="8" rx="4" /><path d="M24 30l6 84h60l6-84" /><path d="M30 38c6 10 54 10 60 0" /><path d="M33 48h54" />
    </svg>
  ),
  geladeira: (
    <svg viewBox="0 0 120 120" width="118" height="98" {...traco}>
      <rect x="32" y="6" width="56" height="108" rx="5" /><path d="M32 44h56M42 18v14M42 56v22" />
    </svg>
  ),
  micro: (
    <svg viewBox="0 0 120 120" width="118" height="98" {...traco}>
      <rect x="8" y="28" width="104" height="64" rx="5" /><rect x="18" y="38" width="64" height="44" rx="3" />
      <path d="M90 40v40" /><circle cx="101" cy="46" r="4" /><circle cx="101" cy="60" r="4" />
    </svg>
  ),
  ar: (
    <svg viewBox="0 0 120 120" width="118" height="98" {...traco}>
      <rect x="6" y="34" width="108" height="40" rx="8" /><path d="M14 62h92M18 68h84" />
      <path d="M40 84c0 6-4 8-4 14M60 84c0 6-4 8-4 14M80 84c0 6-4 8-4 14" strokeLinecap="round" />
    </svg>
  ),
};

export const OPCOES_DESENHO = [
  ['lavadora', 'Lavadora (tampa em cima)'],
  ['geladeira', 'Geladeira'],
  ['micro', 'Micro-ondas'],
  ['ar', 'Ar-condicionado'],
  ['foto', 'Usar uma foto'],
];
