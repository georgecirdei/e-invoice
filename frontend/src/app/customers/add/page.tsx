'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { customerService } from '@/services/customer.service';
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

export default function AddCustomerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  const onSubmit = async (data: CustomerFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      await customerService.create(data);

      // Redirect to customers list
      router.push('/customers');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create customer');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute><MainLayout><div className="mb-6 flex items-center justify-between"><h1 className="text-3xl font-bold tracking-tight">Add Customer</h1>
          </div><div>
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
              Add New Customer
            </h1>
            <p className="text-gray-600">
              Enter customer details to add them to your database
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>
                All fields marked with * are required
              </CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                <Alert type="error" className="mb-6">
                  {error}
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
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? 'Adding...' : 'Add Customer'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => router.push('/customers')}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        </div></MainLayout></ProtectedRoute>
  );
}

