'use client';

import { useState, useCallback, useMemo, lazy, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';
import SellerFilters from '@/components/sellers/SellerFilters';
import SellerTabs from '@/components/sellers/SellerTabs';
import SellerTable from '@/components/sellers/SellerTable';
import { Card, Button } from '@/components/ui';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { usePersons, useToggle } from '@/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { personService } from '@/lib/services';
import { Person } from '@/types/Person';
import { exportToCSV } from '@/lib/utils/exportToCSV';
import { Icon } from '@/components/ui/Icon';
import { isValidQRCode } from '@/lib/utils/imageUrl';
import ConfirmationModal from '@/components/ConfirmationModal';

// Lazy load modals for better performance
const NewSellerModal = dynamic(() => import('@/components/NewSellerModal'), {
  ssr: false,
});

const EditSellerModal = dynamic(() => import('@/components/EditSellerModal'), {
  ssr: false,
});

const QRCodeModal = dynamic(() => import('@/components/QRCodeModal'), {
  ssr: false,
});

export default function SellersPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'active'>('all');
  const [isModalOpen, toggleModal, setIsModalOpen] = useToggle(false);
  const [isEditModalOpen, toggleEditModal, setIsEditModalOpen] = useToggle(false);
  const [qrModalOpen, toggleQRModal, setQrModalOpen] = useToggle(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [activateModalOpen, setActivateModalOpen] = useState(false);
  const [personToActivate, setPersonToActivate] = useState<string | null>(null);
  const [additionalFilters, setAdditionalFilters] = useState<{
    name: string;
    city: string;
    state: string;
    status: string;
    role: string;
    month?: string;
    year?: string;
  }>({
    name: '',
    city: '',
    state: '',
    status: 'all',
    role: '',
    month: '',
    year: '',
  });

  const { persons, loading, refetch } = usePersons(false);

  // Memoized counts for tabs
  const counts = useMemo(() => {
    const activeCount = persons.filter((p) => p.active).length;
    return {
      all: persons.length,
      active: activeCount,
    };
  }, [persons]);


  // Memoized handlers
  const handleOpenQRModal = useCallback((person: Person) => {
    
    if (!isValidQRCode(person.qrCodeUrl)) {
      console.error('[Sellers Page] Falha: person.qrCodeUrl está inválido ou vazio');
      toast.error('QR Code não disponível');
      return;
    }
    setSelectedPerson(person);
    setQrModalOpen(true);
  }, [setQrModalOpen]);

  const handleDeactivate = useCallback(async (id: string) => {
    try {
      await personService.deactivate(id);
      toast.success('Vendedor desativado com sucesso!');
      refetch();
    } catch (error) {
      toast.error('Erro ao desativar vendedor');
    }
  }, [refetch]);

  const handleActivate = useCallback((id: string) => {
    setPersonToActivate(id);
    setActivateModalOpen(true);
  }, []);

  const handleConfirmActivate = useCallback(async () => {
    if (!personToActivate) return;

    try {
      await personService.activate(personToActivate);
      toast.success('Vendedor reativado com sucesso!');
      setActivateModalOpen(false);
      setPersonToActivate(null);
      refetch();
    } catch (error) {
      toast.error('Erro ao reativar vendedor');
    }
  }, [personToActivate, refetch]);

  const handleModalSuccess = useCallback(() => {
    refetch();
    setIsModalOpen(false);
  }, [refetch, setIsModalOpen]);

  const handleCloseQRModal = useCallback(() => {
    setQrModalOpen(false);
    setSelectedPerson(null);
  }, [setQrModalOpen]);

  const handleOpenEditModal = useCallback((person: Person) => {
    setSelectedPerson(person);
    setIsEditModalOpen(true);
  }, [setIsEditModalOpen]);

  const handleEditModalSuccess = useCallback(() => {
    refetch();
    setIsEditModalOpen(false);
    setSelectedPerson(null);
  }, [refetch, setIsEditModalOpen]);

  const exportFilteredDataToCSV = () => {
    const filteredData = persons.map(({ photoBase64, ...rest }) => rest);
    exportToCSV(filteredData, 'sellers.csv');
  };

  // Apply additional filters to the persons data
  const filteredPersons = useMemo(() => {
    return persons.filter((person) => {
      // Filtro de aba
      if (filter === 'active' && !person.active) return false;

      // Filtro de role: apenas SELLER e AFFILIATE
      const isValidRole = person.role === 'SELLER' || person.role === 'AFFILIATE';
      if (!isValidRole) return false;

      const matchesName = additionalFilters.name ? person.name.toLowerCase().includes(additionalFilters.name.toLowerCase()) : true;
      const matchesCity = additionalFilters.city ? person.city.toLowerCase().includes(additionalFilters.city.toLowerCase()) : true;
      const matchesState = additionalFilters.state ? person.state.toLowerCase() === additionalFilters.state.toLowerCase() : true;
      const matchesStatus = additionalFilters.status === 'all' || (additionalFilters.status === 'active' ? person.active : !person.active);
      const matchesRole = additionalFilters.role === '' || additionalFilters.role === 'all' || person.role === (additionalFilters.role as any);

      const matchesMonth = additionalFilters.month && person.createdAt
        ? new Date(person.createdAt).getMonth() + 1 === Number(additionalFilters.month)
        : true;

      const matchesYear = additionalFilters.year && person.createdAt
        ? new Date(person.createdAt).getFullYear() === Number(additionalFilters.year)
        : true;

      return matchesName && matchesCity && matchesState && matchesStatus && matchesRole && matchesMonth && matchesYear;
    });
  }, [persons, additionalFilters, filter]);

  const cities = useMemo(() => {
    return Array.from(new Set(persons.map(p => p.city).filter(Boolean))).sort();
  }, [persons]);

  const states = useMemo(() => {
    return Array.from(new Set(persons.map(p => p.state).filter(Boolean))).sort();
  }, [persons]);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-700">Vendedores</h1>
              <p className="mt-1 text-gray-600">
                Gerencie os vendedores e seus QR codes
              </p>
            </div>
          </div>
          <div className="flex gap-4 h-full items-start self-start">
            <Button onClick={() => setIsModalOpen(true)} size="md" variant="outline-green">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Novo Vendedor
            </Button>
            <Button
              onClick={exportFilteredDataToCSV}
              variant='outline-blue'
              disabled={persons.length === 0}
            >
              <Icon icon="bi-filetype-csv" className="w-5 h-5 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        <SellerFilters
          additionalFilters={additionalFilters}
          onAdditionalFiltersChange={setAdditionalFilters}
          cities={cities}
          states={states}
          years={Array.from(new Set(persons.filter(p => p.createdAt).map(p => new Date(p.createdAt).getFullYear().toString()))).sort((a,b) => Number(b) - Number(a))}
        />

        <Card padding="xs">
          <SellerTabs
            activeTab={filter}
            onTabChange={setFilter}
            allCount={counts.all}
            activeCount={counts.active}
          />
          {loading ? (
            <LoadingSpinner size="lg" text="Carregando vendedores..." />
          ) : (
            <SellerTable
              persons={filteredPersons}
              onViewQRCode={handleOpenQRModal}
              onEdit={handleOpenEditModal}
              onDeactivate={handleDeactivate}
              onActivate={handleActivate}
              onRefetch={refetch}
            />
          )}
        </Card>

        {/* Modals - Only render when open */}
        {isModalOpen && (
          <Suspense fallback={null}>
            <NewSellerModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSuccess={handleModalSuccess}
            />
          </Suspense>
        )}

        {isEditModalOpen && selectedPerson && (
          <Suspense fallback={null}>
            <EditSellerModal
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false);
                setSelectedPerson(null);
              }}
              onSuccess={handleEditModalSuccess}
              person={selectedPerson}
            />
          </Suspense>
        )}

        {qrModalOpen && selectedPerson && (
          <Suspense fallback={null}>
            <QRCodeModal
              isOpen={qrModalOpen}
              onClose={handleCloseQRModal}
              qrCodeBase64={selectedPerson.qrCodeUrl || ''}
              personName={selectedPerson.name}
              qrCode={selectedPerson.qrCode}
              userRole={user?.role as 'SELLER' | 'ADMIN' | 'SUPER_ADMIN' | undefined}
            />
          </Suspense>
        )}

        <ConfirmationModal
          isOpen={activateModalOpen}
          title="Reativar Vendedor"
          message={`Tem certeza que deseja reativar este vendedor? Isso o permitirá gerar novos leads novamente.`}
          confirmText="Reativar"
          cancelText="Cancelar"
          isDangerous={false}
          onConfirm={handleConfirmActivate}
          onCancel={() => {
            setActivateModalOpen(false);
            setPersonToActivate(null);
          }}
        />
      </div>
    </DashboardLayout>
  );
}
