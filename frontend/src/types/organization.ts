export interface Organization {
  id: string;
  name: string;
  taxId: string;
  registrationNumber: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  postalCode: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  users?: OrganizationMember[];
  _count?: {
    users: number;
    invoices: number;
    customers: number;
  };
}

export interface OrganizationMember {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateOrganizationData {
  name: string;
  taxId: string;
  registrationNumber?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  postalCode?: string;
}

export interface UpdateOrganizationData {
  name?: string;
  taxId?: string;
  registrationNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface AddMemberData {
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'USER' | 'VIEWER';
}

