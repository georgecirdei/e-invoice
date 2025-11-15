'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { paymentService, type PaymentStats } from '@/services/payment.service';
import { invoiceService } from '@/services/invoice.service';
import type { Invoice } from '@/types/invoice';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

export default function PaymentsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [overdueInvoices, setOverdueInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    try {
      setIsLoading(true);
      const [paymentStats, overdue] = await Promise.all([
        paymentService.getPaymentStats(),
        paymentService.getOverdueInvoices(),
      ]);
      setStats(paymentStats);
      setOverdueInvoices(overdue);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load payment data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Payment Tracking</h1>
        </div>
        <div>
          {error && <Alert type="error" className="mb-6">{error}</Alert>}

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading payment data...</p>
            </div>
          ) : (
            <>
              {/* Payment Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      ${stats?.totalRevenue?.toFixed(2) || '0.00'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats?.paidInvoices || 0} paid invoices
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Outstanding
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      ${stats?.outstandingAmount?.toFixed(2) || '0.00'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats?.unpaidInvoices || 0} unpaid invoices
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Overdue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {stats?.overdueInvoices || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Invoices past due date
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Collection Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {stats && stats.totalInvoices > 0
                        ? Math.round((stats.paidInvoices / stats.totalInvoices) * 100)
                        : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Payment success rate
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Overdue Invoices Alert */}
              {overdueInvoices.length > 0 && (
                <Card className="mb-6 border-l-4 border-red-500">
                  <CardHeader>
                    <CardTitle className="text-red-900">
                      ⚠️ Overdue Invoices ({overdueInvoices.length})
                    </CardTitle>
                    <CardDescription className="text-red-700">
                      These invoices are past their due date and need attention
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {overdueInvoices.map((invoice) => (
                        <div
                          key={invoice.id}
                          className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-gray-600">
                              {invoice.customer?.name} • Due: {new Date(invoice.dueDate!).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-600">
                              ${Number(invoice.totalAmount - invoice.paidAmount).toFixed(2)}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/invoices/${invoice.id}`)}
                              className="mt-2"
                            >
                              View Invoice
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                  <CardDescription>Overview of invoice payment status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Total Invoices</p>
                        <p className="text-2xl font-bold">{stats?.totalInvoices || 0}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Breakdown</div>
                        <div className="flex gap-4 mt-1">
                          <span className="text-xs">
                            <span className="font-medium text-green-600">{stats?.paidInvoices || 0}</span> Paid
                          </span>
                          <span className="text-xs">
                            <span className="font-medium text-yellow-600">{stats?.partiallyPaid || 0}</span> Partial
                          </span>
                          <span className="text-xs">
                            <span className="font-medium text-red-600">{stats?.unpaidInvoices || 0}</span> Unpaid
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-700 mb-1">Collected</p>
                        <p className="text-xl font-bold text-green-900">
                          ${stats?.totalRevenue?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-sm text-orange-700 mb-1">Pending Collection</p>
                        <p className="text-xl font-bold text-orange-900">
                          ${stats?.outstandingAmount?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div></MainLayout></ProtectedRoute>
  );
}

