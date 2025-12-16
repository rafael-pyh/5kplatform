'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import QRCodeModal from '@/components/QRCodeModal';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  createdAt: string;
}

interface Stats {
  total: number;
  bought: number;
  negotiation: number;
  cancelled: number;
  conversionRate: string;
}

interface Seller {
  id: string;
  name: string;
  email: string;
  phone?: string;
  qrCode: string;
  qrCodeBase64?: string;
  photoBase64?: string;
  scanCount?: number;
  active: boolean;
  emailVerified?: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
}

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user, refreshUser, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [blockedReason, setBlockedReason] = useState<'unverified' | 'pendingApproval' | 'inactive' | null>(null);

  useEffect(() => {
    const initDashboard = async () => {
      // Resetar estados ao montar o componente
      setBlockedReason(null);
      setLoading(true);

      // Aguarda o carregamento da autenticação
      if (authLoading) {
        return;
      }

      // Verifica autenticação
      if (!user) {
        toast.error('Faça login novamente.');
        router.push('/login');
        return;
      }

      // Verifica se é vendedor
      if (user.role?.toUpperCase() !== 'SELLER') {
        toast.error('Acesso negado. Faça login como vendedor.');
        router.push('/login');
        return;
      }

      // Atualiza dados do usuário do backend e carrega os dados
      await refreshUser();
      loadData();
    };

    initDashboard();
  }, [authLoading]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Usa os dados do usuário do Context API
      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch profile para obter QR Code e outros dados específicos do vendedor
      const profileRes = await api.get('/seller/profile');
      const loadedSeller = profileRes.data.data;
      setSeller(loadedSeller);

      // Validações usando dados do Context API (mais atualizados)
      if (!user.emailVerified) {
        setBlockedReason('unverified');
        setLoading(false);
        return;
      }

      if (user.approvalStatus !== 'approved') {
        setBlockedReason('pendingApproval');
        setLoading(false);
        return;
      }

      if (user.active === false) {
        setBlockedReason('inactive');
        setLoading(false);
        return;
      }

      // Profile OK — fetch leads and stats in parallel
      const [leadsRes, statsRes] = await Promise.all([
        api.get('/seller/my-leads'),
        api.get('/seller/my-stats'),
      ]);

      setLeads(leadsRes.data.data);
      setStats(statsRes.data.data);
      setBlockedReason(null); // Garantir que não há bloqueio
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Sessão expirada ou acesso negado. Faça login novamente.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
        router.push('/login');
      } else {
        toast.error('Erro ao carregar dados');
      }
    } finally {
      setLoading(false); // Garantir que o estado de carregamento seja atualizado
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    toast.success('Logout realizado com sucesso!');
    router.push('/login');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      BOUGHT: { bg: 'bg-green-100', text: 'text-green-800', label: 'Comprou' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Não comprou' },
      NEGOTIATION: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Negociando' },
    };

    const config = statusConfig[status] || statusConfig.NEGOTIATION;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Carregando..." />
      </div>
    );
  }

  if (blockedReason) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-3xl mx-auto mb-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex items-start gap-3">
              <div className="shrink-0">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-yellow-800">
                  {blockedReason === 'unverified' && 'Email não verificado'}
                  {blockedReason === 'pendingApproval' && 'Conta pendente de aprovação'}
                  {blockedReason === 'inactive' && 'Conta inativa'}
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  {blockedReason === 'unverified' && 'Você precisa verificar seu email antes de acessar o painel. Verifique sua caixa de entrada (ou spam) e clique no link de ativação.'}
                  {blockedReason === 'pendingApproval' && 'Sua conta ainda está sendo avaliada pelo administrador. Aguarde a aprovação e você será notificado por email.'}
                  {blockedReason === 'inactive' && 'Sua conta foi marcada como inativa. Contate o suporte para obter mais informações.'}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                  >
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Image src="/5klogo.png" alt="Logo 5K Energia Solar" width={100} height={100} />
              <div className="flex gap-2">
                <Image
                  src={seller?.photoBase64 || '/default-avatar.png'}
                  alt="Foto do Vendedor"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <div>
                  <p className="text-sm text-gray-600">{seller?.name}</p>
                  <p className="text-xs text-gray-500">{seller?.email}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {seller?.qrCodeBase64 && (
                <button
                  onClick={() => setIsQRModalOpen(true)}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                  title="Ver meu QR Code"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
                  </svg>
                  <span className="hidden sm:inline font-medium">Meu QR Code</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Total de Leads</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Negociando</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats?.negotiation || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Compraram</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats?.bought || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats?.conversionRate || '0%'}</p>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Meus Leads</h2>
          </div>
          <div className="overflow-x-auto">
            {leads.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Nenhum lead cadastrado ainda.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contato</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {lead.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.phone || lead.email || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(lead.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* QR Code Modal */}
      {seller?.qrCodeBase64 && (
        <QRCodeModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          qrCodeBase64={seller.qrCodeBase64}
          personName={seller.name}
          qrCode={seller.qrCode}
        />
      )}
    </div>
  );
}
