'use client';

import { CreditTransaction, CreditTransactionType } from '@/lib/types/shop.types';
import { formatDate } from '@/lib/utils/dateUtils';

interface TransactionListProps {
  transactions: CreditTransaction[];
  loading?: boolean;
}

const typeIcons: Record<CreditTransactionType, string> = {
  [CreditTransactionType.COMMISSION]: '💰',
  [CreditTransactionType.KIT_PURCHASE]: '📦',
  [CreditTransactionType.WITHDRAW_REQUEST]: '💸',
  [CreditTransactionType.ADJUSTMENT]: '⚙️',
};

const typeLabels: Record<CreditTransactionType, string> = {
  [CreditTransactionType.COMMISSION]: 'Comissão',
  [CreditTransactionType.KIT_PURCHASE]: 'Compra de Kit',
  [CreditTransactionType.WITHDRAW_REQUEST]: 'Solicitação de Saque',
  [CreditTransactionType.ADJUSTMENT]: 'Ajuste',
};

export function TransactionList({ transactions, loading }: TransactionListProps) {
  // Função para formatar a descrição das transações
  const formatDescription = (description: string | undefined, type: CreditTransactionType): string | undefined => {
    if (!description) return undefined;

    // Para ajustes relacionados a leads convertidos
    if (type === CreditTransactionType.ADJUSTMENT && description.startsWith('Lead convertido:')) {
      const leadName = description.replace('Lead convertido: ', '');
      return `${leadName} comprou`;
    }

    // Para outros tipos de ajustes relacionados a leads
    if (type === CreditTransactionType.ADJUSTMENT && description.includes('Lead atualizado para')) {
      // Exemplo: "Lead atualizado para BOUGHT: Rafael Brandão Camargo"
      const match = description.match(/Lead atualizado para (\w+): (.+)/);
      if (match) {
        const status = match[1];
        const leadName = match[2];
        const statusMap: Record<string, string> = {
          'BOUGHT': 'comprou',
          'NEGOTIATION': 'entrou em negociação',
          'CANCELLED': 'cancelou'
        };
        const statusText = statusMap[status] || status.toLowerCase();
        return `${leadName} ${statusText}`;
      }
    }

    return description;
  };
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-sm">Nenhuma transação encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx) => (
        <div key={tx.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{typeIcons[tx.type]}</div>
              <div>
                <p className="font-medium text-gray-900">{typeLabels[tx.type]}</p>
                {tx.description && <p className="text-xs text-gray-600">{formatDescription(tx.description, tx.type)}</p>}
                <p className="text-xs text-gray-500">{formatDate(tx.createdAt)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold text-lg ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {tx.amount > 0 ? '+' : ''}R$ {Math.abs(tx.amount).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
