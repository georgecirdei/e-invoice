import apiClient from '@/lib/api';

export interface CountryConfig {
  id: string;
  countryCode: string;
  countryName: string;
  isActive: boolean;
  apiProvider: string;
  apiBaseUrl: string | null;
  apiClientId: string | null;
  apiClientSecret: string | null;
  xmlFormat: string;
  xmlNamespace: string | null;
  currency: string;
  dateFormat: string;
  standardTaxRate: number;
  reducedTaxRate: number | null;
  zeroTaxRate: number;
  requiresTaxId: boolean;
  requiresRegNumber: boolean;
  _count?: {
    complianceRules: number;
    xmlTemplates: number;
  };
}

export interface SystemStats {
  totalUsers: number;
  totalOrganizations: number;
  totalInvoices: number;
  totalCustomers: number;
  activeCountries: number;
}

export const adminService = {
  /**
   * Get system statistics
   */
  async getSystemStats(): Promise<SystemStats> {
    const response = await apiClient.get('/admin/stats');
    return response.data.data.stats;
  },

  /**
   * Get all countries
   */
  async getCountries(): Promise<CountryConfig[]> {
    const response = await apiClient.get('/admin/countries');
    return response.data.data.countries;
  },

  /**
   * Get country by ID
   */
  async getCountryById(id: string): Promise<CountryConfig> {
    const response = await apiClient.get(`/admin/countries/${id}`);
    return response.data.data.country;
  },

  /**
   * Create country
   */
  async createCountry(data: Partial<CountryConfig>): Promise<CountryConfig> {
    const response = await apiClient.post('/admin/countries', data);
    return response.data.data.country;
  },

  /**
   * Update country
   */
  async updateCountry(id: string, data: Partial<CountryConfig>): Promise<CountryConfig> {
    const response = await apiClient.put(`/admin/countries/${id}`, data);
    return response.data.data.country;
  },

  /**
   * Delete country
   */
  async deleteCountry(id: string): Promise<void> {
    await apiClient.delete(`/admin/countries/${id}`);
  },

  /**
   * Get all users
   */
  async getAllUsers(page: number = 1, limit: number = 20) {
    const response = await apiClient.get('/admin/users', { params: { page, limit } });
    return response.data.data;
  },

  /**
   * Get all organizations
   */
  async getAllOrganizations(page: number = 1, limit: number = 20) {
    const response = await apiClient.get('/admin/organizations', { params: { page, limit } });
    return response.data.data;
  },
};

