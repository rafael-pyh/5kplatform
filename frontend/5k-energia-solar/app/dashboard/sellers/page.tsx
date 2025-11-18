'use client';

import { useState, useCallback, useMemo, lazy, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';
import SellerFilters from '@/components/sellers/SellerFilters';
import SellerTabs from '@/components/sellers/SellerTabs';
import SellerTable from '@/components/sellers/SellerTable';
import { Card } from '@/components/ui';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { usePersons, useToggle } from '@/hooks';
import { personService } from '@/lib/services';
import { Person } from '@/lib/types';

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

export default function VendedoresPage() {
  const [filter, setFilter] = useState<'all' | 'active'>('all');
  const [isModalOpen, toggleModal, setIsModalOpen] = useToggle(false);
  const [isEditModalOpen, toggleEditModal, setIsEditModalOpen] = useToggle(false);
  const [qrModalOpen, toggleQRModal, setQrModalOpen] = useToggle(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const { persons, loading, refetch } = usePersons(filter === 'active');

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
    if (!person.qrCodeUrl) {
      toast.error('QR Code não disponível');
      return;
    }
    setSelectedPerson(person);
    setQrModalOpen(true);
  }, [setQrModalOpen]);

  const handleDeactivate = useCallback(async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar este vendedor?')) return;

    try {
      await personService.deactivate(id);
      toast.success('Vendedor desativado com sucesso!');
      refetch();
    } catch (error) {
      toast.error('Erro ao desativar vendedor');
    }
  }, [refetch]);

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <SellerFilters
          filter={filter}
          onFilterChange={setFilter}
          onAddNew={() => setIsModalOpen(true)}
        />

        <Card padding="none">
          <div className="px-6 pt-6">
            <SellerTabs
              activeTab={filter}
              onTabChange={setFilter}
              allCount={counts.all}
              activeCount={counts.active}
            />
          </div>

          <div className="p-6">
            {loading ? (
              <LoadingSpinner size="lg" text="Carregando vendedores..." />
            ) : (
              <SellerTable
                persons={persons}
                onViewQRCode={handleOpenQRModal}
                onEdit={handleOpenEditModal}
                onDeactivate={handleDeactivate}
              />
            )}
          </div>
        </Card>
      </div>

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
            qrCodeUrl={selectedPerson.qrCodeUrl || ''}
            personName={selectedPerson.name}
          />
        </Suspense>
      )}
    </DashboardLayout>
  );
}
