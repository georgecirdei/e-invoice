'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { invoiceService } from '@/services/invoice.service';
import { customerService } from '@/services/customer.service';
import type { Customer } from '@/types/customer';
import type { CreateInvoiceLineItem } from '@/types/invoice';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { LineItemsForm } from '@/components/invoice/LineItemsForm';

const invoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  dueDate: z.string().optional(),
  currency: z.string().default('USD'),
  notes: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

export default function CreateInvoicePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [lineItems, setLineItems] = useState<CreateInvoiceLineItem[]>([
    { description: '', quantity: 1, unitPrice: 0, taxRate: 0 },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceDate: new Date().toISOString().split('T')[0],
      currency: 'USD',
    },
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const result = await customerService.getAll({ limit: 100 });
      setCustomers(result.customers);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate line items
      if (lineItems.length === 0) {
        setError('Please add at least one line item');
        return;
      }

      const hasEmptyDescription = lineItems.some((item) => !item.description.trim());
      if (hasEmptyDescription) {
        setError('All line items must have a description');
        return;
      }

      const hasInvalidQuantity = lineItems.some((item) => item.quantity <= 0);
      if (hasInvalidQuantity) {
        setError('All line items must have a quantity greater than 0');
        return;
      }

      await invoiceService.create({
        ...data,
        lineItems,
      });

      // Redirect to invoices list
      router.push('/invoices');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute><MainLayout><div className="mb-6 flex items-center justify-between"><h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
          </div><div>
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <Button variant="outline" onClick={() => router.push('/invoices')}>
              ← Back to Invoices
            </Button>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Invoice</h1>
            <p className="text-gray-600">Create a new invoice for your customer</p>
          </div>

          {error && (
            <Alert type="error" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Invoice Details */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
                <CardDescription>Basic invoice information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer <span className="text-red-500">*</span>
                  </label>
                  {isLoadingCustomers ? (
                    <div className="text-sm text-gray-500">Loading customers...</div>
                  ) : customers.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      No customers found.{' '}
                      <button
                        type="button"
                        onClick={() => router.push('/customers/add')}
                        className="text-primary-600 hover:text-primary-700 underline"
                      >
                        Add a customer first
                      </button>
                    </div>
                  ) : (
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      {...register('customerId')}
                    >
                      <option value="">Select a customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} ({customer.email})
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.customerId && (
                    <p className="mt-1 text-sm text-red-600">{errors.customerId.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Invoice Date"
                    type="date"
                    error={errors.invoiceDate?.message}
                    {...register('invoiceDate')}
                    required
                  />

                  <Input
                    label="Due Date"
                    type="date"
                    error={errors.dueDate?.message}
                    {...register('dueDate')}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      {...register('currency')}
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    placeholder="Additional notes or payment terms (optional)"
                    {...register('notes')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader>
                <CardTitle>Items & Services</CardTitle>
                <CardDescription>Add products or services to this invoice</CardDescription>
              </CardHeader>
              <CardContent>
                <LineItemsForm lineItems={lineItems} onChange={setLineItems} errors={errors} />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                type="submit"
                size="lg"
                disabled={isLoading || customers.length === 0}
                className="flex-1"
              >
                {isLoading ? 'Creating...' : 'Create Invoice'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.push('/invoices')}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
        </div></MainLayout></ProtectedRoute>
  );
}

