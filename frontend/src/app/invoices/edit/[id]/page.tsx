'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { invoiceService } from '@/services/invoice.service';
import { customerService } from '@/services/customer.service';
import type { Customer } from '@/types/customer';
import type { Invoice, CreateInvoiceLineItem } from '@/types/invoice';
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

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [lineItems, setLineItems] = useState<CreateInvoiceLineItem[]>([
    { description: '', quantity: 1, unitPrice: 0, taxRate: 0 },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
  });

  useEffect(() => {
    loadInvoice();
    loadCustomers();
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      const data = await invoiceService.getById(invoiceId);
      
      // Check if invoice can be edited
      if (data.status !== 'DRAFT') {
        setError('Only draft invoices can be edited');
        setTimeout(() => router.push(`/invoices/${invoiceId}`), 2000);
        return;
      }

      setInvoice(data);

      // Set form values
      setValue('customerId', data.customerId);
      setValue('invoiceDate', new Date(data.invoiceDate).toISOString().split('T')[0]);
      setValue('dueDate', data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : '');
      setValue('currency', data.currency);
      setValue('notes', data.notes || '');

      // Set line items
      if (data.lineItems && data.lineItems.length > 0) {
        setLineItems(
          data.lineItems.map((item) => ({
            description: item.description,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            taxRate: Number(item.taxRate),
          }))
        );
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load invoice');
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const result = await customerService.getAll({ limit: 100 });
      setCustomers(result.customers);
    } catch (err) {
      console.error('Failed to load customers:', err);
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

      await invoiceService.update(invoiceId, {
        ...data,
        lineItems,
      });

      // Redirect to invoice detail
      router.push(`/invoices/${invoiceId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update invoice');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading invoice...</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  if (error && !invoice) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <Alert type="error" className="mb-6">
            {error}
          </Alert>
          <Button variant="outline" onClick={() => router.push('/invoices')}>
            ← Back to Invoices
          </Button>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Edit Invoice</h1>
          <p className="text-muted-foreground mt-2">
            Update invoice {invoice?.invoiceNumber}
          </p>
        </div>

        <div className="max-w-4xl">
          {error && (
            <Alert type="error" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Customer Selection */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>Select the customer for this invoice</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Customer <span className="text-destructive">*</span>
                  </label>
                  <select
                    className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    {...register('customerId')}
                    disabled={isLoadingData}
                  >
                    <option value="">Select a customer...</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.email}
                      </option>
                    ))}
                  </select>
                  {errors.customerId && (
                    <p className="mt-1 text-sm text-destructive">{errors.customerId.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Invoice Details */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
                <CardDescription>Set dates and currency</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <Input
                  label="Currency"
                  type="text"
                  placeholder="USD"
                  error={errors.currency?.message}
                  {...register('currency')}
                  required
                />

                <div>
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <textarea
                    className="w-full px-3 py-2 border border-input rounded-md min-h-[100px] focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Optional notes..."
                    {...register('notes')}
                  />
                  {errors.notes && (
                    <p className="mt-1 text-sm text-destructive">{errors.notes.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Line Items</CardTitle>
                <CardDescription>Add products or services</CardDescription>
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
                {isLoading ? 'Updating...' : 'Update Invoice'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.push(`/invoices/${invoiceId}`)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}

