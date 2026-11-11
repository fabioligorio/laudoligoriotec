import ClientePagina from '@/components/ClientePagina';
import { relatorioPorToken } from '@/lib/store';
import { Logo } from '@/components/Marca';
import { numero } from '@/lib/format';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const r = await relatorioPorToken(params.token);
  return {
    title: r ? `Laudo e orçamento ${numero(r)} · LigorioTec` : 'Link indisponível · LigorioTec',
    robots: { index: false, follow: false },
  };
}

// Página pública que o cliente abre pelo link (não pede senha)
export default async function PaginaCliente({ params }) {
  const r = await relatorioPorToken(params.token);
  if (!r) {
    return (
      <main className="login">
        <div className="caixa" style={{ textAlign: 'center', alignItems: 'center' }}>
          <Logo escuro altura={44} />
          <div className="cli-indisp">
            <h1>Link indisponível</h1>
            <p>Este link expirou ou foi desativado. Peça um link novo para a LigorioTec.</p>
          </div>
        </div>
      </main>
    );
  }
  return <ClientePagina r={r} token={params.token} />;
}
