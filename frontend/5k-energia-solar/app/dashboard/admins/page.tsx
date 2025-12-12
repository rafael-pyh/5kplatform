'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { AdminTable, NewAdminModal, EditAdminModal } from '@/components/admins';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { adminService } from '@/lib/services';
import { User } from '@/lib/types';
import { toast } from 'react-hot-toast';
import { exportToCSV } from '@/lib/utils/exportToCSV';
import { Icon } from '@/components/ui/Icon';

export default function AdminsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<User[]>([]);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null);

  // Verificar se o usuário tem permissão
  useEffect(() => {
    if (authLoading) return; // wait until auth is loaded

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      toast.error('Você não tem permissão para acessar esta página');
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, authLoading, router]);

  const loadAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getAll();
      setAdmins(data);
    } catch (error: any) {
      console.error('Error loading admins:', error);
      if (error.response?.status !== 401) {
        toast.error('Erro ao carregar administradores');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
      loadAdmins();
    }
  }, [isAuthenticated, user, loadAdmins]);

  const handleEdit = (admin: User) => {
    setSelectedAdmin(admin);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este administrador?')) {
      return;
    }

    try {
      await adminService.delete(id);
      toast.success('Administrador excluído com sucesso!');
      loadAdmins();
    } catch (error: any) {
      console.error('Error deleting admin:', error);
      toast.error(error.response?.data?.message || 'Erro ao excluir administrador');
    }
  };

  const handleSuccess = () => {
    loadAdmins();
  };

  // Verificação de permissão antes de renderizar
  if (authLoading || !isAuthenticated || !user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return (
      <DashboardLayout>
        <LoadingSpinner size="lg" text="Verificando permissões..." />
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner size="lg" text="Carregando administradores..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Administradores</h1>
            <p className="text-gray-600 mt-1">Gerencie os usuários administradores do sistema</p>
          </div>
          <div className="flex space-x-4">
            <Button onClick={() => setIsNewModalOpen(true)} variant='outline-green'>
              <Icon icon="bi-person-plus" className="w-5 h-5 mr-2" />
              Novo Administrador
            </Button>
            <Button
              onClick={() => exportToCSV(admins, 'admins.csv')}
              variant='outline-blue'
              disabled={admins.length === 0}
            >
              <Icon icon="bi-filetype-csv" className="w-5 h-5 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-semibold text-gray-900">{admins.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {admins.filter((a) => a.active !== false).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Super Admins</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {admins.filter((a) => a.role === 'SUPER_ADMIN').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <AdminTable
          admins={admins}
          currentUserId={user?.id || ''}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Modals */}
        <NewAdminModal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          onSuccess={handleSuccess}
        />

        <EditAdminModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedAdmin(null);
          }}
          onSuccess={handleSuccess}
          admin={selectedAdmin}
        />
      </div>
    </DashboardLayout>
  );
}
