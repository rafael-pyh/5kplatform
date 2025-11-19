'use client';

import { memo } from 'react';
import { User } from '@/lib/types';
import Badge from '@/components/ui/Badge';

interface AdminTableRowProps {
  admin: User;
  currentUserId: string;
  onEdit: (admin: User) => void;
  onDelete: (id: string) => void;
}

function AdminTableRow({ admin, currentUserId, onEdit, onDelete }: AdminTableRowProps) {
  const isCurrentUser = admin.id === currentUserId;

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-medium text-sm">
                {admin.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {admin.name}
              {isCurrentUser && (
                <span className="ml-2 text-xs text-gray-500">(Você)</span>
              )}
            </div>
            <div className="text-sm text-gray-500">{admin.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant={admin.role === 'SUPER_ADMIN' ? 'warning' : 'info'}>
          {admin.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant={admin.active !== false ? 'success' : 'danger'}>
          {admin.active !== false ? 'Ativo' : 'Inativo'}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(admin.createdAt).toLocaleDateString('pt-BR')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(admin)}
            className="text-blue-600 hover:text-blue-900 transition-colors"
            title="Editar Administrador"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          {!isCurrentUser && (
            <button
              onClick={() => onDelete(admin.id)}
              className="text-red-600 hover:text-red-900 transition-colors"
              title="Excluir Administrador"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default memo(AdminTableRow);
