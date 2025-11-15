'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { organizationService } from '@/services/organization.service';
import type { Organization } from '@/types/organization';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

const organizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  taxId: z.string().min(3, 'Tax ID is required'),
  registrationNumber: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().min(2, 'Country is required'),
  postalCode: z.string().optional(),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

export default function OrganizationSettingsPage() {
  const router = useRouter();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
  });

  useEffect(() => {
    loadOrganization();
  }, []);

  const loadOrganization = async () => {
    try {
      setIsLoading(true);
      const org = await organizationService.getMyOrganization();
      
      if (!org) {
        router.push('/organization/setup');
        return;
      }

      setOrganization(org);
      reset({
        name: org.name,
        taxId: org.taxId,
        registrationNumber: org.registrationNumber || '',
        email: org.email,
        phone: org.phone || '',
        address: org.address || '',
        city: org.city || '',
        state: org.state || '',
        country: org.country,
        postalCode: org.postalCode || '',
      });
    } catch (err: any) {
      setError('Failed to load organization');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: OrganizationFormData) => {
    if (!organization) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(false);

      await organizationService.update(organization.id, data);

      setSuccess(true);
      await loadOrganization();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update organization');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading organization...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute><MainLayout><div className="mb-6 flex items-center justify-between"><h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
            <Button variant="outline" size="sm" onClick={() => router.push('/organization/members')}>
              Manage Members
            </Button>
          </div><div>
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              ← Back to Dashboard
            </Button>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Organization Settings
            </h1>
            <p className="text-gray-600">
              Manage your organization details and information
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
              <CardDescription>
                Update your company details as they appear on invoices
              </CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                <Alert type="error" className="mb-6">
                  {error}
                </Alert>
              )}

              {success && (
                <Alert type="success" className="mb-6">
                  Organization updated successfully!
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Basic Information
                  </h3>

                  <Input
                    label="Organization Name"
                    type="text"
                    placeholder="Acme Corporation"
                    error={errors.name?.message}
                    {...register('name')}
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Tax ID / VAT Number"
                      type="text"
                      placeholder="123456789"
                      error={errors.taxId?.message}
                      {...register('taxId')}
                      required
                    />

                    <Input
                      label="Registration Number"
                      type="text"
                      placeholder="REG-123456 (optional)"
                      error={errors.registrationNumber?.message}
                      {...register('registrationNumber')}
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-t pt-4">
                    Contact Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Email"
                      type="email"
                      placeholder="contact@company.com"
                      error={errors.email?.message}
                      {...register('email')}
                      required
                    />

                    <Input
                      label="Phone"
                      type="tel"
                      placeholder="+1 234 567 8900 (optional)"
                      error={errors.phone?.message}
                      {...register('phone')}
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-t pt-4">
                    Address
                  </h3>

                  <Input
                    label="Street Address"
                    type="text"
                    placeholder="123 Main Street (optional)"
                    error={errors.address?.message}
                    {...register('address')}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="City"
                      type="text"
                      placeholder="New York (optional)"
                      error={errors.city?.message}
                      {...register('city')}
                    />

                    <Input
                      label="State / Province"
                      type="text"
                      placeholder="NY (optional)"
                      error={errors.state?.message}
                      {...register('state')}
                    />

                    <Input
                      label="Postal Code"
                      type="text"
                      placeholder="10001 (optional)"
                      error={errors.postalCode?.message}
                      {...register('postalCode')}
                    />
                  </div>

                  <Input
                    label="Country"
                    type="text"
                    placeholder="United States"
                    error={errors.country?.message}
                    {...register('country')}
                    required
                  />
                </div>

                {/* Organization Stats */}
                {organization && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Organization Statistics
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-primary-600">
                          {organization._count?.users || 0}
                        </p>
                        <p className="text-sm text-gray-600">Members</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-primary-600">
                          {organization._count?.invoices || 0}
                        </p>
                        <p className="text-sm text-gray-600">Invoices</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-primary-600">
                          {organization._count?.customers || 0}
                        </p>
                        <p className="text-sm text-gray-600">Customers</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => router.push('/organization/members')}
                  >
                    Manage Members
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        </div></MainLayout></ProtectedRoute>
  );
}

