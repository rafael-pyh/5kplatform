'use client';

import { memo } from 'react';
import { Person } from '@/lib/types';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface SellerTableRowProps {
  person: Person;
  onViewQRCode: (person: Person) => void;
  onEdit: (person: Person) => void;
  onDeactivate: (id: string) => void;
}

function SellerTableRow({ person, onViewQRCode, onEdit, onDeactivate }: SellerTableRowProps) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            {person.photoUrl ? (
              <img
                className="h-10 w-10 rounded-full object-cover"
                src={person.photoUrl}
                alt={person.name}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-medium text-sm">
                  {person.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{person.name}</div>
            <div className="text-sm text-gray-500">{person.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{person.phone}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <div className="text-sm text-gray-900">{person.scanCount || 0}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant={person.active ? 'success' : 'danger'}>
          {person.active ? 'Ativo' : 'Inativo'}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onViewQRCode(person)}
            className="text-green-600 hover:text-green-900 transition-colors"
            title="Ver QR Code"
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
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
          </button>
          <button
            onClick={() => onEdit(person)}
            className="text-blue-600 hover:text-blue-900 transition-colors"
            title="Editar Vendedor"
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
          {person.active && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDeactivate(person.id)}
            >
              Desativar
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default memo(SellerTableRow);
