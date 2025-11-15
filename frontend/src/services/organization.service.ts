import apiClient from '@/lib/api';
import type {
  Organization,
  CreateOrganizationData,
  UpdateOrganizationData,
  AddMemberData,
  OrganizationMember,
} from '@/types/organization';

export const organizationService = {
  /**
   * Create a new organization
   */
  async create(data: CreateOrganizationData): Promise<Organization> {
    const response = await apiClient.post('/organizations', data);
    return response.data.data.organization;
  },

  /**
   * Get current user's organization
   */
  async getMyOrganization(): Promise<Organization | null> {
    try {
      const response = await apiClient.get('/organizations/me');
      return response.data.data.organization;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Get organization by ID
   */
  async getById(id: string): Promise<Organization> {
    const response = await apiClient.get(`/organizations/${id}`);
    return response.data.data.organization;
  },

  /**
   * Update organization
   */
  async update(id: string, data: UpdateOrganizationData): Promise<Organization> {
    const response = await apiClient.put(`/organizations/${id}`, data);
    return response.data.data.organization;
  },

  /**
   * Get all organizations (admin only)
   */
  async getAll(page: number = 1, limit: number = 10): Promise<{
    organizations: Organization[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await apiClient.get('/organizations', {
      params: { page, limit },
    });
    return response.data.data;
  },

  /**
   * Add member to organization
   */
  async addMember(organizationId: string, data: AddMemberData): Promise<OrganizationMember> {
    const response = await apiClient.post(`/organizations/${organizationId}/members`, data);
    return response.data.data.user;
  },

  /**
   * Remove member from organization
   */
  async removeMember(organizationId: string, userId: string): Promise<void> {
    await apiClient.delete(`/organizations/${organizationId}/members/${userId}`);
  },

  /**
   * Update member role
   */
  async updateMemberRole(
    organizationId: string,
    userId: string,
    role: string
  ): Promise<OrganizationMember> {
    const response = await apiClient.patch(
      `/organizations/${organizationId}/members/${userId}/role`,
      { role }
    );
    return response.data.data.user;
  },
};

