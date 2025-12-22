import { useState, useEffect, useCallback } from 'react';
import { personService } from '@/lib/services';
import { Person } from '@/lib/types';
import { toast } from 'react-hot-toast';

export function usePersons(activeOnly: boolean = false) {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPersons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await personService.getAll(activeOnly);
      setPersons(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao carregar vendedores');
      setError(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => {
    loadPersons();
  }, [loadPersons]);

  const refetch = useCallback(() => {
    return loadPersons();
  }, [loadPersons]);

  return { persons, loading, error, refetch };
}
