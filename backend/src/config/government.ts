/**
 * Government API Configuration
 * Supports multiple government e-invoice systems
 */

export interface GovernmentAPIConfig {
  provider: 'myinvois' | 'zatca' | 'ksef' | 'efactura' | 'mock' | 'none';
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  enabled: boolean;
}

export const governmentConfig: GovernmentAPIConfig = {
  provider: (process.env.GOV_API_PROVIDER as any) || 'mock',
  baseUrl: process.env.GOV_API_BASE_URL || 'http://localhost:9000/mock-gov-api',
  clientId: process.env.GOV_API_CLIENT_ID || 'test-client-id',
  clientSecret: process.env.GOV_API_CLIENT_SECRET || 'test-client-secret',
  enabled: process.env.GOV_API_ENABLED === 'true' || false,
};

/**
 * Government API endpoints by provider
 */
export const governmentEndpoints = {
  myinvois: {
    auth: '/connect/token',
    submit: '/api/v1.0/documentsubmissions',
    status: '/api/v1.0/documents',
    validate: '/api/v1.0/documents/validate',
  },
  zatca: {
    auth: '/compliance/invoices',
    submit: '/invoices/reporting/single',
    status: '/invoices/clearance/single',
    validate: '/compliance/invoices',
  },
  ksef: {
    auth: '/api/online/Session/InitToken',
    submit: '/api/online/Invoice/Send',
    status: '/api/online/Invoice/Status',
    validate: '/api/online/Invoice/Validate',
  },
  efactura: {
    auth: '/api/v1/oauth/token',
    submit: '/api/v1/upload',
    status: '/api/v1/messages',
    validate: '/api/v1/validate',
  },
  mock: {
    auth: '/auth/token',
    submit: '/invoices/submit',
    status: '/invoices/status',
    validate: '/invoices/validate',
  },
};

/**
 * Get endpoints for current provider
 */
export function getGovernmentEndpoints() {
  const provider = governmentConfig.provider;
  if (provider === 'none') {
    return governmentEndpoints.mock;
  }
  return governmentEndpoints[provider] || governmentEndpoints.mock;
}

/**
 * Provider-specific documentation and notes
 */
export const providerInfo = {
  myinvois: {
    name: 'MyInvois (Malaysia)',
    authority: 'IRBM (Inland Revenue Board of Malaysia)',
    documentation: 'https://sdk.myinvois.hasil.gov.my/',
    format: 'JSON',
    notes: 'Requires registration with IRBM and OAuth 2.0 credentials',
  },
  zatca: {
    name: 'ZATCA (Saudi Arabia)',
    authority: 'Zakat, Tax and Customs Authority',
    documentation: 'https://zatca.gov.sa/en/E-Invoicing',
    format: 'XML (UBL 2.1) with cryptographic stamps',
    notes: 'Requires ZATCA onboarding and digital certificates',
  },
  ksef: {
    name: 'KSeF (Poland)',
    authority: 'Ministry of Finance - Poland',
    documentation: 'https://www.gov.pl/web/kas/ksef',
    format: 'XML (FA_VAT schema)',
    notes: 'Polish National e-Invoice System, requires authorization token from Ministry',
  },
  efactura: {
    name: 'e-Factura (Romania)',
    authority: 'ANAF (National Agency for Fiscal Administration)',
    documentation: 'https://www.anaf.ro/anaf/internet/ANAF/despre_anaf/strategii_anaf/e_factura',
    format: 'XML (UBL-RO)',
    notes: 'Romanian e-Invoice system, requires ANAF registration and OAuth credentials',
  },
  mock: {
    name: 'Mock API (Testing)',
    authority: 'Internal Testing',
    documentation: 'N/A',
    format: 'Flexible (simulates any format)',
    notes: 'For development and testing purposes only',
  },
};

