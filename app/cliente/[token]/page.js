import PortalCliente from '@/components/PortalCliente';
import { clientePorToken } from '@/lib/store';
import { portalDoCliente } from '@/lib/portal';
import { Logo } from '@/components/Marca';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Seus atendimentos · LigorioTec', robots: { index: false, follow: false } };

// Link único do cliente: tudo o que ele tem com a LigorioTec, num lugar só
export default async function Pagina({ params }) {
  params = await params;
  const c = await clientePorToken(params.token);
  if (!c) {
    return (
      <main className="login">
        <div className="caixa" style={{ textAlign: 'center', alignItems: 'center' }}>
          <Logo escuro altura={44} />
          <div className="cli-indisp">
            <h1>Link indisponível</h1>
            <p>Este link não está mais ativo. Fale com a LigorioTec pelo WhatsApp (41) 93618-6432.</p>
          </div>
        </div>
      </main>
    );
  }
  return <PortalCliente nome={c.nome} {...(await portalDoCliente(c))} />;
}
