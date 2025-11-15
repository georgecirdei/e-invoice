export interface Customer {
  id: string;
  name: string;
  email: string;
  taxId: string | null;
  registrationNumber: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  postalCode: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  _count?: {
    invoices: number;
  };
}

export interface CreateCustomerData {
  name: string;
  email: string;
  taxId?: string;
  registrationNumber?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  postalCode?: string;
}

export interface UpdateCustomerData {
  name?: string;
  email?: string;
  taxId?: string;
  registrationNumber?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isActive?: boolean;
}

export interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
}

