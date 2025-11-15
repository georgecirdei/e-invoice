'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { complianceService, type ComplianceStats } from '@/services/compliance.service';
import { invoiceService } from '@/services/invoice.service';
import type { Invoice } from '@/types/invoice';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

export default function CompliancePage() {
  const router = useRouter();
  const [stats, setStats] = useState<ComplianceStats | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [complianceStats, invoicesData] = await Promise.all([
        complianceService.getStats(),
        invoiceService.getAll({ limit: 10, status: 'SUBMITTED' }),
      ]);

      setStats(complianceStats);
      setRecentInvoices(invoicesData.invoices);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load compliance data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    const colors: Record<string, string> = {
      VALIDATED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      SUBMITTED: 'bg-blue-100 text-blue-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading compliance data...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Compliance & Submissions</h1>
        </div>
        <div>
          {error && (
            <Alert type="error" className="mb-6">
              {error}
            </Alert>
          )}

          {/* Compliance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Submitted</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{stats?.submitted || 0}</p>
                <p className="text-sm text-gray-500 mt-1">To government</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Validated</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{stats?.validated || 0}</p>
                <p className="text-sm text-gray-500 mt-1">Approved</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rejected</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">{stats?.rejected || 0}</p>
                <p className="text-sm text-gray-500 mt-1">Need attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-600">{stats?.pending || 0}</p>
                <p className="text-sm text-gray-500 mt-1">Processing</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary-600">{stats?.complianceRate || 0}%</p>
                <p className="text-sm text-gray-500 mt-1">Compliance</p>
              </CardContent>
            </Card>
          </div>

          {/* Information Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Government E-Invoice Integration</CardTitle>
              <CardDescription>
                Automatic submission and validation with government systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">How It Works</h4>
                  <ol className="text-sm text-gray-600 space-y-2">
                    <li>1. Create invoice with all required details</li>
                    <li>2. Submit invoice (marks as SUBMITTED in system)</li>
                    <li>3. Click "Submit to Government" button</li>
                    <li>4. System validates and sends to government API</li>
                    <li>5. Receive VALIDATED or REJECTED status</li>
                    <li>6. If rejected, fix issues and retry</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Status Meanings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        SUBMITTED
                      </span>
                      <span className="text-gray-600">Ready for government submission</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        PENDING
                      </span>
                      <span className="text-gray-600">Processing by government</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        VALIDATED
                      </span>
                      <span className="text-gray-600">Approved by government</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        REJECTED
                      </span>
                      <span className="text-gray-600">Rejected - needs correction</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Submissions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions ({recentInvoices.length})</CardTitle>
              <CardDescription>
                Invoices submitted to government e-invoice system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentInvoices.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No submissions yet</p>
                  <p className="text-sm text-gray-400">
                    Submit invoices to government from the invoice detail page
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Invoice #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Submitted
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Gov Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Gov ID
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentInvoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-primary-600">
                              {invoice.invoiceNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{invoice.customer?.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {invoice.submittedAt
                                ? new Date(invoice.submittedAt).toLocaleDateString()
                                : '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                invoice.governmentStatus
                              )}`}
                            >
                              {invoice.governmentStatus || 'NOT SUBMITTED'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {invoice.governmentId ? (
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {invoice.governmentId.substring(0, 12)}...
                              </code>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/invoices/${invoice.id}`)}
                            >
                              View Details
                            </Button>
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

