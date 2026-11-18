import VisitaCliente from '@/components/VisitaCliente';
import { visitaPorToken } from '@/lib/store';
import { Logo } from '@/components/Marca';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Visita técnica · LigorioTec',
  robots: { index: false, follow: false },
};

// Página pública da visita, aberta pelo link que você manda ao cliente
export default async function Pagina({ params }) {
  params = await params;
  const v = await visitaPorToken(params.token);
  if (!v) {
    return (
      <main className="login">
        <div className="caixa" style={{ textAlign: 'center', alignItems: 'center' }}>
          <Logo escuro altura={44} />
          <div className="cli-indisp">
            <h1>Link indisponível</h1>
            <p>Este link não existe mais. Fale com a LigorioTec pelo WhatsApp (41) 93618-6432.</p>
          </div>
        </div>
      </main>
    );
  }
  // só o que o cliente precisa ver (sem as anotações internas)
  const publico = {
    nome: v.nome, endereco: v.endereco, bairro: v.bairro, cidade: v.cidade,
    equipamento: v.equipamento, marca: v.marca, problema: v.problema,
    dia: v.dia, periodo: v.periodo, agendaDia: v.agendaDia || '', agendaHora: v.agendaHora || '',
    taxa: v.taxa || '', status: v.status, confirmadoEm: v.confirmadoEm || null,
  };
  return <VisitaCliente v={publico} token={params.token} />;
}
