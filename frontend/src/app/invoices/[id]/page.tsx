'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { invoiceService } from '@/services/invoice.service';
import { complianceService } from '@/services/compliance.service';
import { paymentService, type Payment } from '@/services/payment.service';
import { downloadInvoicePDF, downloadInvoiceXML, emailInvoice } from '@/lib/download';
import type { Invoice } from '@/types/invoice';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { RecordPaymentModal } from '@/components/invoice/RecordPaymentModal';

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingToGov, setIsSubmittingToGov] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isDownloadingXML, setIsDownloadingXML] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      setIsLoading(true);
      const data = await invoiceService.getById(invoiceId);
      setInvoice(data);
      
      // Load payment history
      try {
        const paymentData = await paymentService.getInvoicePayments(invoiceId);
        setPayments(paymentData);
      } catch (err) {
        console.error('Failed to load payments:', err);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!invoice || !confirm('Are you sure you want to submit this invoice?')) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await invoiceService.submit(invoice.id);
      await loadInvoice();
      setSuccess('Invoice submitted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;

    try {
      setIsDownloadingPDF(true);
      setError(null);
      await downloadInvoicePDF(invoice.id, invoice.invoiceNumber);
      setSuccess('PDF downloaded successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError('Failed to download PDF');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleDownloadXML = async () => {
    if (!invoice) return;

    try {
      setIsDownloadingXML(true);
      setError(null);
      await downloadInvoiceXML(invoice.id, invoice.invoiceNumber);
      setSuccess('XML downloaded successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError('Failed to download XML');
    } finally {
      setIsDownloadingXML(false);
    }
  };

  const handleEmailInvoice = async () => {
    if (!invoice || !confirm(`Send invoice to ${invoice.customer?.email}?`)) return;

    try {
      setIsEmailing(true);
      setError(null);
      await emailInvoice(invoice.id);
      setSuccess(`Invoice emailed to ${invoice.customer?.email}!`);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to email invoice');
    } finally {
      setIsEmailing(false);
    }
  };

  const handleSubmitToGovernment = async () => {
    if (!invoice || !confirm('Submit this invoice to government e-invoice system?')) return;

    try {
      setIsSubmittingToGov(true);
      setError(null);
      const result = await complianceService.submitToGovernment(invoice.id);
      
      if (result.success) {
        setSuccess('Invoice submitted to government successfully! Status: ' + result.data.submission.status);
        await loadInvoice();
      } else {
        setError(result.message || 'Government submission failed');
      }
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit to government');
    } finally {
      setIsSubmittingToGov(false);
    }
  };

  const handleRetrySubmission = async () => {
    if (!invoice || !confirm('Retry submitting this invoice to government?')) return;

    try {
      setIsRetrying(true);
      setError(null);
      const result = await complianceService.retrySubmission(invoice.id);
      
      if (result.success) {
        setSuccess('Invoice resubmitted successfully! Status: ' + result.data.submission.status);
        await loadInvoice();
      } else {
        setError(result.message || 'Retry failed');
      }
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to retry submission');
    } finally {
      setIsRetrying(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-muted text-foreground',
      PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      SUBMITTED: 'bg-purple-100 text-purple-800',
      VALIDATED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-muted text-foreground',
    };
    return colors[status] || 'bg-muted text-foreground';
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading invoice...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !invoice) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">{error || 'Invoice not found'}</p>
              <Button onClick={() => router.push('/invoices')}>Back to Invoices</Button>
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
          <h1 className="text-3xl font-bold tracking-tight">Invoice Details</h1>
        </div>
        <div className="max-w-5xl mx-auto">
          {(error || success) && (
            <div className="mb-6">
              {error && <Alert type="error">{error}</Alert>}
              {success && <Alert type="success">{success}</Alert>}
            </div>
          )}

          <div className="mb-6 flex justify-between items-center">
            <Button variant="outline" onClick={() => router.push('/invoices')}>
              ← Back to Invoices
            </Button>
            <div className="flex gap-2 flex-wrap">
              {invoice.status === 'DRAFT' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/invoices/edit/${invoice.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Invoice'}
                  </Button>
                </>
              )}
              {invoice.status === 'SUBMITTED' && 
               !invoice.governmentId && 
               invoice.governmentStatus !== 'VALIDATED' &&
               invoice.governmentStatus !== 'PENDING' && (
                <Button
                  onClick={handleSubmitToGovernment}
                  disabled={isSubmittingToGov}
                >
                  {isSubmittingToGov ? 'Submitting...' : '🏛️ Submit to Government'}
                </Button>
              )}
              {invoice.governmentStatus === 'REJECTED' && (
                <Button
                  onClick={handleRetrySubmission}
                  disabled={isRetrying}
                >
                  {isRetrying ? 'Retrying...' : '🔄 Retry Submission'}
                </Button>
              )}
              {invoice.paymentStatus !== 'PAID' && 
               invoice.governmentStatus === 'VALIDATED' && (
                <Button
                  onClick={() => setShowPaymentModal(true)}
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  💰 Record Payment
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={handleDownloadPDF}
                disabled={isDownloadingPDF}
              >
                {isDownloadingPDF ? '⏳ Downloading...' : '📄 PDF'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDownloadXML}
                disabled={isDownloadingXML}
              >
                {isDownloadingXML ? '⏳ Downloading...' : '📋 XML'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleEmailInvoice}
                disabled={isEmailing}
              >
                {isEmailing ? '📧 Sending...' : '📧 Email'}
              </Button>
            </div>
          </div>

          {/* Record Payment Modal */}
          {showPaymentModal && invoice && (
            <RecordPaymentModal
              invoiceId={invoice.id}
              invoiceNumber={invoice.invoiceNumber}
              totalAmount={Number(invoice.totalAmount)}
              paidAmount={Number(invoice.paidAmount)}
              currency={invoice.currency}
              onClose={() => setShowPaymentModal(false)}
              onSuccess={async () => {
                setSuccess('Payment recorded successfully!');
                await loadInvoice();
                setTimeout(() => setSuccess(null), 3000);
              }}
            />
          )}

          {/* Invoice Header */}
          <Card className="mb-6">
            <CardContent className="py-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {invoice.invoiceNumber}
                  </h1>
                  <div className="flex gap-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        invoice.status
                      )}`}
                    >
                      {invoice.status}
                    </span>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        invoice.paymentStatus === 'PAID'
                          ? 'bg-green-100 text-green-800'
                          : invoice.paymentStatus === 'PARTIALLY_PAID'
                          ? 'bg-yellow-100 text-yellow-800'
                          : invoice.paymentStatus === 'OVERDUE'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      💰 {invoice.paymentStatus.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Invoice Date</p>
                  <p className="text-lg font-semibold text-foreground">
                    {new Date(invoice.invoiceDate).toLocaleDateString()}
                  </p>
                  {invoice.dueDate && (
                    <>
                      <p className="text-sm text-muted-foreground mt-2">Due Date</p>
                      <p className="text-lg font-semibold text-foreground">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Bill To:</h3>
                <div className="text-foreground">
                  <p className="font-semibold text-lg">{invoice.customer?.name}</p>
                  <p className="text-sm">{invoice.customer?.email}</p>
                  {invoice.customer?.taxId && (
                    <p className="text-sm text-muted-foreground">Tax ID: {invoice.customer.taxId}</p>
                  )}
                  {invoice.customer?.address && (
                    <div className="text-sm mt-2 text-muted-foreground">
                      <p>{invoice.customer.address}</p>
                      <p>
                        {invoice.customer.city}
                        {invoice.customer.state && `, ${invoice.customer.state}`}{' '}
                        {invoice.customer.postalCode}
                      </p>
                      <p>{invoice.customer.country}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Items & Services</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="min-w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                      Price
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                      Tax %
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoice.lineItems?.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm text-foreground">{item.description}</td>
                      <td className="px-4 py-3 text-sm text-right text-foreground">
                        {Number(item.quantity)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-foreground">
                        {invoice.currency} {Number(item.unitPrice).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-foreground">
                        {Number(item.taxRate)}%
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-foreground">
                        {invoice.currency} {Number(item.totalAmount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="mt-6 border-t pt-4">
                <div className="space-y-2 max-w-md ml-auto">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">
                      {invoice.currency} {Number(invoice.subtotal).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax:</span>
                    <span className="font-medium">
                      {invoice.currency} {Number(invoice.taxAmount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xl font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-primary">
                      {invoice.currency} {Number(invoice.totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {invoice.notes && (
                <div className="mt-6 border-t pt-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">Notes:</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}

              {/* Payment Status */}
              <div className="mt-6 border-t pt-4">
                <h4 className="text-sm font-medium text-foreground mb-3">Payment Status</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted/50 p-3 rounded">
                    <p className="text-xs text-muted-foreground">Total Amount</p>
                    <p className="text-lg font-bold text-foreground">
                      {invoice.currency} {Number(invoice.totalAmount).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-xs text-muted-foreground">Paid</p>
                    <p className="text-lg font-bold text-green-600">
                      {invoice.currency} {Number(invoice.paidAmount).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded">
                    <p className="text-xs text-muted-foreground">Outstanding</p>
                    <p className="text-lg font-bold text-orange-600">
                      {invoice.currency} {(Number(invoice.totalAmount) - Number(invoice.paidAmount)).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              {payments.length > 0 && (
                <div className="mt-6 border-t pt-4">
                  <h4 className="text-sm font-medium text-foreground mb-3">
                    Payment History ({payments.length})
                  </h4>
                  <div className="space-y-2">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex justify-between items-center p-3 bg-muted/50 rounded"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {invoice.currency} {Number(payment.amount).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(payment.paymentDate).toLocaleDateString()} •{' '}
                            {payment.paymentMethod.replace('_', ' ')}
                            {payment.reference && ` • Ref: ${payment.reference}`}
                          </p>
                        </div>
                        {payment.notes && (
                          <p className="text-xs text-muted-foreground italic">{payment.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Government Submission Status */}
          {invoice.governmentId && (
            <Card className="mb-6 border-l-4 border-primary-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🏛️ Government E-Invoice Status
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      invoice.governmentStatus === 'VALIDATED'
                        ? 'bg-green-100 text-green-800'
                        : invoice.governmentStatus === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {invoice.governmentStatus}
                  </span>
                </CardTitle>
                <CardDescription>
                  Official government e-invoice submission details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Government Invoice ID</dt>
                    <dd className="mt-1 text-sm text-foreground font-mono bg-muted px-2 py-1 rounded">
                      {invoice.governmentId}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                    <dd className="mt-1 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          invoice.governmentStatus === 'VALIDATED'
                            ? 'bg-green-100 text-green-800'
                            : invoice.governmentStatus === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {invoice.governmentStatus}
                      </span>
                    </dd>
                  </div>
                  {invoice.submittedAt && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Submitted to Government</dt>
                      <dd className="mt-1 text-sm text-foreground">
                        {new Date(invoice.submittedAt).toLocaleString()}
                      </dd>
                    </div>
                  )}
                  {invoice.validatedAt && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Validated Date</dt>
                      <dd className="mt-1 text-sm text-foreground">
                        {new Date(invoice.validatedAt).toLocaleString()}
                      </dd>
                    </div>
                  )}
                </dl>
                {invoice.governmentStatus === 'VALIDATED' && (
                  <Alert type="success" className="mt-4">
                    ✅ This invoice has been successfully validated by the government e-invoice system.
                  </Alert>
                )}
                {invoice.governmentStatus === 'REJECTED' && (
                  <Alert type="error" className="mt-4">
                    ❌ This invoice was rejected by the government. Please review and retry submission.
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Created By</dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {invoice.createdBy?.firstName} {invoice.createdBy?.lastName}
                    <br />
                    <span className="text-muted-foreground">{invoice.createdBy?.email}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Created Date</dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {new Date(invoice.createdAt).toLocaleString()}
                  </dd>
                </div>
                {invoice.submittedAt && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Submitted Date</dt>
                    <dd className="mt-1 text-sm text-foreground">
                      {new Date(invoice.submittedAt).toLocaleString()}
                    </dd>
                  </div>
                )}
                {invoice.validatedAt && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Validated Date</dt>
                    <dd className="mt-1 text-sm text-foreground">
                      {new Date(invoice.validatedAt).toLocaleString()}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}

