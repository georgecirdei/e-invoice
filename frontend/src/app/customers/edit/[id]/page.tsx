'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { customerService } from '@/services/customer.service';
import type { Customer } from '@/types/customer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

const customerSchema = z.object({
  name: z.string().min(2, 'Customer name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  taxId: z.string().optional(),
  registrationNumber: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().min(2, 'Country is required'),
  postalCode: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  useEffect(() => {
    loadCustomer();
  }, [customerId]);

  const loadCustomer = async () => {
    try {
      setIsLoadingCustomer(true);
      const data = await customerService.getById(customerId);
      setCustomer(data);
      
      // Populate form with customer data
      reset({
        name: data.name,
        email: data.email,
        taxId: data.taxId || '',
        registrationNumber: data.registrationNumber || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country,
        postalCode: data.postalCode || '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load customer');
    } finally {
      setIsLoadingCustomer(false);
    }
  };

  const onSubmit = async (data: CustomerFormData) => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(false);

      await customerService.update(customerId, data);

      setSuccess(true);
      
      // Redirect after 1 second
      setTimeout(() => {
        router.push('/customers');
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update customer');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingCustomer) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading customer...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!customer) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="text-center py-12">
              <p className="text-gray-600 mb-4">Customer not found</p>
              <Button onClick={() => router.push('/customers')}>
                Back to Customers
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Edit Customer</h1>
        </div>
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => router.push('/customers')}
            >
              ← Back to Customers
            </Button>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Edit Customer
            </h1>
            <p className="text-gray-600">
              Update customer information
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>
                Editing: {customer.name}
                {customer._count && (
                  <span className="ml-2 text-primary-600">
                    • {customer._count.invoices} invoice(s)
                  </span>
                )}
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
                  Customer updated successfully! Redirecting...
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Basic Information
                  </h3>

                  <Input
                    label="Customer Name"
                    type="text"
                    placeholder="Acme Corporation"
                    error={errors.name?.message}
                    {...register('name')}
                    required
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="contact@customer.com"
                    error={errors.email?.message}
                    {...register('email')}
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Tax ID / VAT Number"
                      type="text"
                      placeholder="123456789 (optional)"
                      error={errors.taxId?.message}
                      {...register('taxId')}
                    />

                    <Input
                      label="Registration Number"
                      type="text"
                      placeholder="REG-123456 (optional)"
                      error={errors.registrationNumber?.message}
                      {...register('registrationNumber')}
                    />
                  </div>

                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="+1 234 567 8900 (optional)"
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
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
                    onClick={() => router.push('/customers')}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}

