'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuthStore } from '@/store/authStore';
import { adminService, type SystemStats } from '@/services/admin.service';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Check if user is Super Admin
    if (user.role !== 'SUPER_ADMIN') {
      setAccessDenied(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      return;
    }

    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminService.getSystemStats();
      setStats(data);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Access denied. Super Admin privileges required.');
        setAccessDenied(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError(err.response?.data?.message || 'Failed to load statistics');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (accessDenied) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="max-w-md">
            <CardContent className="text-center py-12">
              <div className="text-red-600 text-5xl mb-4">🚫</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-4">
                Super Admin privileges required to access this area.
              </p>
              <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">🔐 System Administration</h1>
        </div>
        <div>
          {error && (
            <Alert type="error" className="mb-6">
              {error}
            </Alert>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading statistics...</p>
            </div>
          ) : (
            <>
              {/* System Stats */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                <Card className="border-l-4 border-purple-500">
                  <CardHeader>
                    <CardTitle className="text-lg">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-purple-600">{stats?.totalUsers || 0}</p>
                    <p className="text-sm text-gray-500 mt-1">System-wide</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-blue-500">
                  <CardHeader>
                    <CardTitle className="text-lg">Organizations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-blue-600">
                      {stats?.totalOrganizations || 0}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Active tenants</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-green-500">
                  <CardHeader>
                    <CardTitle className="text-lg">Invoices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600">
                      {stats?.totalInvoices || 0}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Total created</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-yellow-500">
                  <CardHeader>
                    <CardTitle className="text-lg">Customers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-yellow-600">
                      {stats?.totalCustomers || 0}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">In database</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-primary-500">
                  <CardHeader>
                    <CardTitle className="text-lg">Countries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-primary-600">
                      {stats?.activeCountries || 0}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Configured</p>
                  </CardContent>
                </Card>
              </div>

              {/* Admin Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      🌍 Country Management
                    </CardTitle>
                    <CardDescription>
                      Configure countries, tax rates, and compliance rules
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full"
                      onClick={() => router.push('/admin/countries')}
                    >
                      Manage Countries
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      👥 User Management
                    </CardTitle>
                    <CardDescription>
                      View all users across all organizations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full"
                      onClick={() => router.push('/admin/users')}
                    >
                      View Users
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      🏢 Organization Management
                    </CardTitle>
                    <CardDescription>
                      View and manage all organizations (tenants)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full"
                      onClick={() => router.push('/admin/organizations')}
                    >
                      View Organizations
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      📝 Pages & CMS
                    </CardTitle>
                    <CardDescription>
                      Manage landing pages and content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => router.push('/admin/pages')}
                    >
                      Manage Pages
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Information */}
              <Card className="mt-6 bg-purple-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-purple-900">Super Admin Privileges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-purple-800 space-y-2">
                    <p>✅ Configure country-specific e-invoice requirements</p>
                    <p>✅ Manage compliance rules and XML templates</p>
                    <p>✅ View all users and organizations system-wide</p>
                    <p>✅ Set tax rates and legal requirements per country</p>
                    <p>✅ Monitor system health and statistics</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div></MainLayout></ProtectedRoute>
  );
}

