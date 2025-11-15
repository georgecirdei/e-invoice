'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { paymentService } from '@/services/payment.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

const paymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface RecordPaymentModalProps {
  invoiceId: string;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  currency: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  invoiceId,
  invoiceNumber,
  totalAmount,
  paidAmount,
  currency,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remainingAmount = totalAmount - paidAmount;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: remainingAmount,
      paymentDate: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: PaymentFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      await paymentService.recordPayment(invoiceId, data);

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="max-w-2xl w-full">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Record Payment</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Invoice: {invoiceNumber}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {error && <Alert type="error" className="mb-4">{error}</Alert>}

            {/* Payment Summary */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-lg font-bold text-gray-900">
                    {currency} {totalAmount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Paid</p>
                  <p className="text-lg font-bold text-green-600">
                    {currency} {paidAmount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Remaining</p>
                  <p className="text-lg font-bold text-primary-600">
                    {currency} {remainingAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Payment Amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  helperText={`Max: ${currency} ${remainingAmount.toFixed(2)}`}
                  error={errors.amount?.message}
                  {...register('amount', { valueAsNumber: true })}
                  required
                />

                <Input
                  label="Payment Date"
                  type="date"
                  error={errors.paymentDate?.message}
                  {...register('paymentDate')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  {...register('paymentMethod')}
                >
                  <option value="">Select payment method</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="DEBIT_CARD">Debit Card</option>
                  <option value="CASH">Cash</option>
                  <option value="CHECK">Check</option>
                  <option value="PAYPAL">PayPal</option>
                  <option value="STRIPE">Stripe</option>
                  <option value="OTHER">Other</option>
                </select>
                {errors.paymentMethod && (
                  <p className="mt-1 text-sm text-red-600">{errors.paymentMethod.message}</p>
                )}
              </div>

              <Input
                label="Reference Number"
                placeholder="Transaction reference (optional)"
                error={errors.reference?.message}
                {...register('reference')}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="Additional notes (optional)"
                  {...register('notes')}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Recording...' : 'Record Payment'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

