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
      console.log('[usePersons] Dados carregados:', data.length, 'pessoas');
      data.forEach((person: Person, index: number) => {
        console.log(`[usePersons] Pessoa ${index}: ${person.name}`);
        console.log(`[usePersons]   - qrCodeBase64 existe? ${!!person.qrCodeBase64}`);
        console.log(`[usePersons]   - qrCodeBase64 tamanho: ${person.qrCodeBase64?.length ?? 0}`);
        if (person.qrCodeBase64) {
          console.log(`[usePersons]   - começa com data:image/? ${person.qrCodeBase64.startsWith('data:image/')}`);
        }
      });
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
