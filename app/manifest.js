// Permite instalar o sistema na tela inicial do celular ("Adicionar à tela inicial")
export default function manifest() {
  return {
    name: 'LigorioTec · Laudos e orçamentos',
    short_name: 'Laudos LT',
    description: 'Laudos técnicos e orçamentos da LigorioTec',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B0F0D',
    theme_color: '#0B0F0D',
    lang: 'pt-BR',
    icons: [
      { src: '/icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
