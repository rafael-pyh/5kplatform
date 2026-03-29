'use client';

import { useState, useEffect } from 'react';

/**
 * Hook para detectar breakpoints de media query
 * @param query - Media query string (ex: '(max-width: 768px)')
 * @returns boolean indicando se a query corresponde ao viewport atual
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Criar media query list
    const mediaQueryList = window.matchMedia(query);

    // Handler para mudanças na media query
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setMatches(e.matches);
    };

    // Setar valor inicial
    setMatches(mediaQueryList.matches);

    // Adicionar listener
    mediaQueryList.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, [query]);

  // Retornar false durante SSR para evitar hydration mismatch
  return isMounted ? matches : false;
}

/**
 * Hook para detectar se está em modo mobile
 * @returns boolean indicando se está em mobile (<768px)
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

/**
 * Hook para detectar se está em modo tablet
 * @returns boolean indicando se está em tablet (768px - 1024px)
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

/**
 * Hook para detectar se está em modo desktop
 * @returns boolean indicando se está em desktop (>1024px)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}
