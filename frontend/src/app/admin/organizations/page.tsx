'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { adminService } from '@/services/admin.service';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

export default function OrganizationsPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadOrganizations();
  }, [currentPage]);

  const loadOrganizations = async () => {
    try {
      setIsLoading(true);
      const result = await adminService.getAllOrganizations(currentPage, 20);
      setOrganizations(result.organizations);
      setTotalPages(result.pagination.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load organizations');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute><MainLayout><div className="mb-6 flex items-center justify-between"><h1 className="text-3xl font-bold tracking-tight">🏢 Organization Management</h1>
          </div><div>
          {error && <Alert type="error" className="mb-6">{error}</Alert>}

          <Card>
            <CardHeader>
              <CardTitle>All Organizations ({organizations.length})</CardTitle>
              <CardDescription>System-wide organization list</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading organizations...</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Organization
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Tax ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Statistics
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Created
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {organizations.map((org) => (
                          <tr key={org.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{org.name}</div>
                              <div className="text-xs text-gray-500">{org.country}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {org.taxId}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{org.email}</div>
                              {org.phone && (
                                <div className="text-xs text-gray-500">{org.phone}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <div className="text-gray-600">
                                👥 {org._count?.users || 0} members
                              </div>
                              <div className="text-gray-600">
                                📄 {org._count?.invoices || 0} invoices
                              </div>
                              <div className="text-gray-600">
                                👤 {org._count?.customers || 0} customers
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  org.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {org.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(org.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex justify-between items-center">
                      <p className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div></MainLayout></ProtectedRoute>
  );
}

