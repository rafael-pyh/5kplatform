'use server';

const BRASIL_API_BASE = 'https://brasilapi.com.br/api';

interface StateResponse {
  id: string;
  name: string;
  abbreviation: string;
}

interface CityResponse {
  id: string;
  name: string;
}

/**
 * Fetch all Brazilian states from BrasilAPI
 */
export async function getStates(): Promise<StateResponse[]> {
  try {
    const response = await fetch(`${BRASIL_API_BASE}/ibge/uf/v1`);
    
    if (!response.ok) {
      console.error('BrasilAPI Error:', response.statusText);
      return [];
    }

    const data = await response.json();
    // BrasilAPI returns states with 'id', 'nome', 'sigla'
    // Transform to match our interface
    return data.map((state: any) => ({
      id: state.id,
      name: state.nome,
      abbreviation: state.sigla,
    })) || [];
  } catch (error) {
    console.error('Error fetching states:', error);
    return [];
  }
}

/**
 * Fetch cities for a given state from BrasilAPI
 * @param stateAbbreviation - State abbreviation (e.g., 'SP', 'RJ')
 */
export async function getCitiesByState(stateAbbreviation: string): Promise<CityResponse[]> {
  if (!stateAbbreviation) return [];

  try {
    const response = await fetch(
      `${BRASIL_API_BASE}/ibge/municipios/v1/${stateAbbreviation}`
    );

    if (!response.ok) {
      console.error('BrasilAPI Error:', response.statusText);
      return [];
    }

    const data = await response.json();
    // BrasilAPI returns cities with 'id' and 'nome'
    // Transform to match our interface
    return data.map((city: any) => ({
      id: city.id,
      name: city.nome,
    })) || [];
  } catch (error) {
    console.error(`Error fetching cities for ${stateAbbreviation}:`, error);
    return [];
  }
}
