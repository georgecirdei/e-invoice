'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { invoiceService } from '@/services/invoice.service';
import type { Invoice } from '@/types/invoice';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Input } from '@/components/ui/Input';
import { DensityToggle } from '@/components/ui/DensityToggle';

function InvoicesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Read status from URL
  useEffect(() => {
    const statusFromUrl = searchParams.get('status');
    setStatusFilter(statusFromUrl || '');
  }, [searchParams]);

  // Reload when page or filter changes
  useEffect(() => {
    loadInvoices();
  }, [currentPage, statusFilter, searchParams]);

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current status from URL to ensure it's fresh
      const currentStatus = searchParams.get('status') || statusFilter;

      const result = await invoiceService.getAll({
        page: currentPage,
        limit: 10, // shadcn style: comfortable 10 rows
        search: searchTerm || undefined,
        status: currentStatus || undefined,
      });

      setInvoices(result.invoices);
      setTotalPages(result.pagination.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadInvoices();
  };

  const handleDelete = async (id: string, invoiceNumber: string) => {
    if (!confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`)) return;

    try {
      await invoiceService.delete(id);
      await loadInvoices();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete invoice');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      SUBMITTED: 'bg-purple-100 text-purple-800',
      VALIDATED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <Button size="sm" onClick={() => router.push('/invoices/create')}>
            + Create Invoice
          </Button>
        </div>
        <div>
          {error && <Alert type="error" className="mb-6">{error}</Alert>}

          {/* shadcn Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="flex gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search by invoice number or customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-48">
                  <select
                    className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="">All Statuses</option>
                    <option value="DRAFT">Draft</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="VALIDATED">Validated</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                <Button type="submit" variant="outline">Search</Button>
                {(searchTerm || statusFilter) && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('');
                      setCurrentPage(1);
                      router.push('/invoices');
                    }}
                  >
                    Clear
                  </Button>
                )}
              </form>
              {statusFilter && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Filtered by:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {statusFilter}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* shadcn Invoice Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Invoices ({invoices.length})</CardTitle>
              <CardDescription>View and manage your invoices</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading invoices...</p>
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📄</div>
                  <h3 className="text-lg font-semibold mb-2">No invoices</h3>
                  <p className="text-muted-foreground mb-4">Get started by creating your first invoice.</p>
                  <Button onClick={() => router.push('/invoices/create')}>
                    + Create Invoice
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          Invoice #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          Customer
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="font-medium text-sm text-primary">
                              {invoice.invoiceNumber}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {invoice._count?.lineItems || 0} item(s)
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium">{invoice.customer?.name}</div>
                            <div className="text-xs text-muted-foreground">{invoice.customer?.email}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm">
                              {new Date(invoice.invoiceDate).toLocaleDateString()}
                            </div>
                            {invoice.dueDate && (
                              <div className="text-xs text-muted-foreground">
                                Due: {new Date(invoice.dueDate).toLocaleDateString()}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-semibold">
                              {invoice.currency} {Number(invoice.totalAmount).toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Tax: {Number(invoice.taxAmount).toFixed(2)}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                              {invoice.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/invoices/${invoice.id}`)}
                              >
                                View
                              </Button>
                              {invoice.status === 'DRAFT' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(invoice.id, invoice.invoiceNumber)}
                                >
                                  Delete
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* shadcn Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    }>
      <InvoicesPageContent />
    </Suspense>
  );
}

