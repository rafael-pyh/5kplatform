'use client';

import { User } from '@/lib/types';
import AdminTableRow from './AdminTableRow';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';

interface AdminTableProps {
  admins: User[];
  currentUserId: string;
  onEdit: (admin: User) => void;
  onDelete: (id: string) => void;
}

export default function AdminTable({ admins, currentUserId, onEdit, onDelete }: AdminTableProps) {
  if (admins.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        }
        title="Nenhum administrador encontrado"
        description="Não há administradores cadastrados no sistema."
      />
    );
  }

  return (
    <div className="w-full max-w-full">
      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Administrador
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tipo
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Data de Criação
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {admins.map((admin) => (
              <AdminTableRow
                key={admin.id}
                admin={admin}
                currentUserId={currentUserId}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {admins.map((admin) => (
          <div
            key={admin.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            {/* Name and Email */}
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-900 truncate" title={admin.name}>
                {admin.name}
              </h3>
              <p className="text-xs text-gray-500 truncate" title={admin.email}>
                {admin.email}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
              <div>
                <p className="text-gray-500 font-medium mb-1">Tipo</p>
                <p className="text-gray-900 font-medium">
                  {admin.role === 'ADMIN' ? 'Admin' : admin.role === 'SUPER_ADMIN' ? 'Super Admin' : admin.role}
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium mb-1">Status</p>
                <div>
                  <Badge variant={admin.active ? 'success' : 'danger'}>
                    {admin.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-gray-500 font-medium mb-1">Criado</p>
                <p className="text-gray-900 font-medium">
                  {admin.createdAt
                    ? new Date(admin.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                      })
                    : '-'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => onEdit(admin)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded transition-colors font-medium text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Editar
              </button>
              {admin.id !== currentUserId && (
                <button
                  onClick={() => onDelete(admin.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-red-600 text-red-600 hover:bg-red-50 rounded transition-colors font-medium text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Deletar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
