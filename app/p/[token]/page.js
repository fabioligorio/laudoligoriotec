import PropostaCliente from '@/components/PropostaCliente';
import { propostaPorToken } from '@/lib/store';
import { propostaParaCliente, numeroProposta } from '@/lib/propostas';
import { Logo } from '@/components/Marca';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  params = await params;
  const p = await propostaPorToken(params.token);
  return {
    title: p ? `Proposta ${numeroProposta(p)} · LigorioTec` : 'LigorioTec',
    robots: { index: false, follow: false },
  };
}

// Página pública da proposta, aberta pelo link enviado ao cliente
export default async function Pagina({ params }) {
  params = await params;
  const p = await propostaPorToken(params.token);
  if (!p) {
    return (
      <main className="login">
        <div className="caixa" style={{ textAlign: 'center', alignItems: 'center' }}>
          <Logo escuro altura={44} />
          <div className="cli-indisp">
            <h1>Link indisponível</h1>
            <p>Esta proposta não está mais disponível. Fale com a LigorioTec pelo WhatsApp (41) 93618-6432.</p>
          </div>
        </div>
      </main>
    );
  }
  return <PropostaCliente p={propostaParaCliente(p)} token={params.token} />;
}
