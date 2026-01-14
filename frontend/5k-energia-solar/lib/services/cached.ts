/**
 * Cached Services - Wraps all API services with automatic caching
 * Reduces API calls and improves performance
 * 
 * Usage: Import from this file instead of directly from service files
 */

import { cacheApiCall } from '../apiCache';
import { 
  personService as originalPersonService, 
  leadService as originalLeadService 
} from './index';
import type { Person, Lead, CreatePersonDto, UpdatePersonDto, LeadFilters, CreateLeadDto, LeadStatus, UpdateLeadDto } from '../types';

// Cache TTL configurations
const CACHE_TTLS = {
  persons: 3 * 60 * 1000,      // 3 minutes
  personById: 5 * 60 * 1000,   // 5 minutes
  leads: 3 * 60 * 1000,        // 3 minutes
  leadById: 5 * 60 * 1000,     // 5 minutes
  newLeads: 2 * 60 * 1000,     // 2 minutes (more frequent updates)
};

/**
 * Cached Person Service
 */
export const cachedPersonService = {
  async getAll(activeOnly?: boolean): Promise<Person[]> {
    return cacheApiCall(
      `api_cache_persons_all_${activeOnly ? 'active' : 'all'}`,
      () => originalPersonService.getAll(activeOnly),
      { ttlMs: CACHE_TTLS.persons }
    );
  },

  async getById(id: string): Promise<Person> {
    return cacheApiCall(
      `api_cache_person_${id}`,
      () => originalPersonService.getById(id),
      { ttlMs: CACHE_TTLS.personById }
    );
  },

  async getByQRCode(qrCode: string): Promise<Person> {
    // Don't cache QR code lookups - these are public endpoints
    return originalPersonService.getByQRCode(qrCode);
  },

  async create(data: CreatePersonDto): Promise<Person> {
    // Don't cache POST requests
    return originalPersonService.create(data);
  },

  async update(id: string, data: UpdatePersonDto): Promise<Person> {
    // Don't cache PUT requests
    return originalPersonService.update(id, data);
  },

  async deactivate(id: string): Promise<void> {
    // Don't cache DELETE requests
    return originalPersonService.deactivate(id);
  },
};

/**
 * Cached Lead Service
 */
export const cachedLeadService = {
  async getAll(filters?: LeadFilters): Promise<Lead[]> {
    const filterKey = filters ? `_${JSON.stringify(filters)}` : '';
    return cacheApiCall(
      `api_cache_leads_all${filterKey}`,
      () => originalLeadService.getAll(filters),
      { ttlMs: CACHE_TTLS.leads }
    );
  },

  async getByOwner(ownerId: string): Promise<Lead[]> {
    return cacheApiCall(
      `api_cache_leads_owner_${ownerId}`,
      () => originalLeadService.getByOwner(ownerId),
      { ttlMs: CACHE_TTLS.leads }
    );
  },

  async getById(id: string): Promise<Lead> {
    return cacheApiCall(
      `api_cache_lead_${id}`,
      () => originalLeadService.getById(id),
      { ttlMs: CACHE_TTLS.leadById }
    );
  },

  async create(data: CreateLeadDto): Promise<Lead> {
    // Don't cache POST requests
    return originalLeadService.create(data);
  },

  async updateStatus(id: string, status: LeadStatus): Promise<Lead> {
    // Don't cache PATCH requests
    return originalLeadService.updateStatus(id, status);
  },

  async update(id: string, data: UpdateLeadDto): Promise<Lead> {
    // Don't cache PUT requests
    return originalLeadService.update(id, data);
  },

  async delete(id: string): Promise<void> {
    // Don't cache DELETE requests
    return originalLeadService.delete(id);
  },

  async getNewLeads(): Promise<Lead[]> {
    return cacheApiCall(
      'api_cache_leads_new',
      () => originalLeadService.getNewLeads(),
      { ttlMs: CACHE_TTLS.newLeads }
    );
  },

  async getStats(): Promise<any> {
    return cacheApiCall(
      'api_cache_leads_stats',
      () => originalLeadService.getStats(),
      { ttlMs: CACHE_TTLS.leads }
    );
  },

  async getMyLeads(): Promise<Lead[]> {
    return cacheApiCall(
      'api_cache_my_leads',
      () => originalLeadService.getMyLeads(),
      { ttlMs: CACHE_TTLS.leads }
    );
  },
};
