import { useState, useEffect, useCallback } from 'react';
import { cachedPersonService } from '@/lib/services/cached';
import { Person } from '@/lib/types';
import { toast } from 'react-hot-toast';
import { useDashboardContext } from '@/contexts/DashboardContext';

export function usePersons(activeOnly: boolean = false) {
  // Tentar usar dados do context se disponível
  let contextData;
  let contextLoading = false;
  try {
    contextData = useDashboardContext();
    contextLoading = contextData?.loading || false;
  } catch {
    contextData = null;
  }
  
  const [persons, setPersons] = useState<Person[]>([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Usar loading do context se estiver carregando, senão usar loading local
  const loading = contextLoading || localLoading;

  // Sincronizar dados do context quando forem atualizados
  useEffect(() => {
    if (contextData?.persons && Array.isArray(contextData.persons) && !activeOnly) {
      setPersons(contextData.persons);
      setLocalLoading(false);
    }
  }, [contextData?.persons, activeOnly]);

  const loadPersons = useCallback(async () => {
    try {
      setLocalLoading(true);
      setError(null);
      
      // Se temos dados no context e não precisa filtrar por "active only", use do context
      if (contextData?.persons && !activeOnly) {
        setPersons(contextData.persons);
        setLocalLoading(false);
        return;
      }
      
      // Caso contrário, buscar da API
      const data = await cachedPersonService.getAll(activeOnly);
      setPersons(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao carregar vendedores');
      setError(error);
      toast.error(error.message);
    } finally {
      setLocalLoading(false);
    }
  }, [activeOnly, contextData?.persons]);

  useEffect(() => {
    loadPersons();
  }, [loadPersons]);

  const refetch = useCallback(() => {
    return loadPersons();
  }, [loadPersons]);

  return { persons, loading, error, refetch };
}
