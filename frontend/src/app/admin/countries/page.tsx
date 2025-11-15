'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { adminService, type CountryConfig } from '@/services/admin.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

const countrySchema = z.object({
  countryCode: z.string().length(2, 'Country code must be 2 characters').toUpperCase(),
  countryName: z.string().min(2, 'Country name is required'),
  apiProvider: z.enum(['myinvois', 'zatca', 'ksef', 'efactura', 'mock']),
  apiBaseUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  apiClientId: z.string().optional(),
  apiClientSecret: z.string().optional(),
  xmlFormat: z.string().min(1, 'XML format is required'),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  standardTaxRate: z.number().min(0).max(100),
  reducedTaxRate: z.number().min(0).max(100).optional(),
  requiresTaxId: z.boolean().default(true),
  requiresRegNumber: z.boolean().default(false),
});

type CountryFormData = z.infer<typeof countrySchema>;

export default function CountriesPage() {
  const router = useRouter();
  const [countries, setCountries] = useState<CountryConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCountry, setEditingCountry] = useState<CountryConfig | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CountryFormData>({
    resolver: zodResolver(countrySchema),
    defaultValues: {
      requiresTaxId: true,
      requiresRegNumber: false,
      apiProvider: 'mock',
    },
  });

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getCountries();
      setCountries(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load countries');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: CountryFormData) => {
    try {
      setError(null);

      if (editingCountry) {
        await adminService.updateCountry(editingCountry.id, data);
        setSuccess('Country updated successfully!');
      } else {
        await adminService.createCountry(data);
        setSuccess('Country created successfully!');
      }

      setShowAddForm(false);
      setEditingCountry(null);
      reset();
      await loadCountries();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save country');
    }
  };

  const handleEdit = (country: CountryConfig) => {
    setEditingCountry(country);
    setShowAddForm(true);
    
    setValue('countryCode', country.countryCode);
    setValue('countryName', country.countryName);
    setValue('apiProvider', country.apiProvider as any);
    setValue('apiBaseUrl', country.apiBaseUrl || '');
    setValue('apiClientId', country.apiClientId || '');
    setValue('apiClientSecret', country.apiClientSecret || '');
    setValue('xmlFormat', country.xmlFormat);
    setValue('currency', country.currency);
    setValue('standardTaxRate', Number(country.standardTaxRate));
    setValue('reducedTaxRate', country.reducedTaxRate ? Number(country.reducedTaxRate) : undefined);
    setValue('requiresTaxId', country.requiresTaxId);
    setValue('requiresRegNumber', country.requiresRegNumber);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      await adminService.deleteCountry(id);
      setSuccess('Country deleted successfully!');
      await loadCountries();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete country');
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingCountry(null);
    reset();
    setError(null);
  };

  return (
    <ProtectedRoute><MainLayout><div className="mb-6 flex items-center justify-between"><h1 className="text-3xl font-bold tracking-tight">🌍 Country Management</h1>
          </div><div>
          {error && <Alert type="error" className="mb-6">{error}</Alert>}
          {success && <Alert type="success" className="mb-6">{success}</Alert>}

          {/* Add/Edit Form */}
          {showAddForm && (
            <Card className="mb-6 border-purple-200">
              <CardHeader>
                <CardTitle>
                  {editingCountry ? 'Edit Country Configuration' : 'Add New Country'}
                </CardTitle>
                <CardDescription>
                  Configure e-invoice requirements and government API settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Country Code"
                      placeholder="MY, SA, US"
                      error={errors.countryCode?.message}
                      {...register('countryCode')}
                      required
                      disabled={!!editingCountry}
                    />
                    <Input
                      label="Country Name"
                      placeholder="Malaysia"
                      error={errors.countryName?.message}
                      {...register('countryName')}
                      required
                    />
                  </div>

                  {/* Government API */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-4">Government API Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">API Provider</label>
                        <select
                          className="w-full px-3 py-2 border rounded-md"
                          {...register('apiProvider')}
                        >
                          <option value="mock">Mock (Testing)</option>
                          <option value="myinvois">MyInvois (Malaysia)</option>
                          <option value="zatca">ZATCA (Saudi Arabia)</option>
                          <option value="ksef">KSeF (Poland)</option>
                          <option value="efactura">e-Factura (Romania)</option>
                        </select>
                      </div>
                      <Input
                        label="API Base URL"
                        placeholder="https://api.government.com"
                        error={errors.apiBaseUrl?.message}
                        {...register('apiBaseUrl')}
                      />
                      <Input
                        label="API Client ID"
                        placeholder="client-id"
                        error={errors.apiClientId?.message}
                        {...register('apiClientId')}
                      />
                      <Input
                        label="API Client Secret"
                        type="password"
                        placeholder="client-secret"
                        error={errors.apiClientSecret?.message}
                        {...register('apiClientSecret')}
                      />
                    </div>
                  </div>

                  {/* XML & Legal */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-4">XML & Legal Requirements</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="XML Format"
                        placeholder="UBL-MY"
                        error={errors.xmlFormat?.message}
                        {...register('xmlFormat')}
                        required
                      />
                      <Input
                        label="Currency"
                        placeholder="MYR"
                        error={errors.currency?.message}
                        {...register('currency')}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="requiresTaxId"
                          className="rounded"
                          {...register('requiresTaxId')}
                        />
                        <label htmlFor="requiresTaxId" className="text-sm">
                          Requires Tax ID
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="requiresRegNumber"
                          className="rounded"
                          {...register('requiresRegNumber')}
                        />
                        <label htmlFor="requiresRegNumber" className="text-sm">
                          Requires Registration Number
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Tax Rates */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-4">Tax Rates (%)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Standard Tax Rate"
                        type="number"
                        step="0.01"
                        placeholder="10"
                        error={errors.standardTaxRate?.message}
                        {...register('standardTaxRate', { valueAsNumber: true })}
                        required
                      />
                      <Input
                        label="Reduced Tax Rate (Optional)"
                        type="number"
                        step="0.01"
                        placeholder="6"
                        error={errors.reducedTaxRate?.message}
                        {...register('reducedTaxRate', { valueAsNumber: true })}
                      />
                      <div>
                        <label className="block text-sm font-medium mb-1">Zero Rate</label>
                        <div className="px-3 py-2 bg-gray-100 border rounded-md text-gray-700">
                          0%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-4">
                    <Button type="submit">
                      {editingCountry ? 'Update Country' : 'Create Country'}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Countries List */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Country Configurations ({countries.length})</CardTitle>
                  <CardDescription>
                    Manage e-invoice requirements for different countries
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setShowAddForm(true);
                    setEditingCountry(null);
                    reset();
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  + Add Country
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading countries...</p>
                </div>
              ) : countries.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No countries configured</p>
                  <Button  onClick={() => setShowAddForm(true)}>
                    Add First Country
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Country
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          API Provider
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Tax Rates
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Requirements
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {countries.map((country) => (
                        <tr key={country.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{getFlagEmoji(country.countryCode)}</span>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {country.countryName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {country.countryCode} • {country.xmlFormat}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {country.apiProvider}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div>Standard: {Number(country.standardTaxRate)}%</div>
                            {country.reducedTaxRate && (
                              <div className="text-gray-500">
                                Reduced: {Number(country.reducedTaxRate)}%
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs">
                            {country.requiresTaxId && (
                              <div className="text-green-600">✓ Tax ID required</div>
                            )}
                            {country.requiresRegNumber && (
                              <div className="text-green-600">✓ Reg # required</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                country.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {country.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(country)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(country.id, country.countryName)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div></MainLayout></ProtectedRoute>
  );
}

function getFlagEmoji(countryCode: string): string {
  const flags: Record<string, string> = {
    MY: '🇲🇾',
    SA: '🇸🇦',
    US: '🇺🇸',
    PL: '🇵🇱',
    RO: '🇷🇴',
    SG: '🇸🇬',
    GB: '🇬🇧',
    DE: '🇩🇪',
    FR: '🇫🇷',
    AU: '🇦🇺',
    CA: '🇨🇦',
  };
  return flags[countryCode] || '🌍';
}

