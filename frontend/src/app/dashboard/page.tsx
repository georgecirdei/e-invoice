'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { organizationService } from '@/services/organization.service';
import { invoiceService } from '@/services/invoice.service';
import { userService } from '@/services/user.service';
import type { Organization } from '@/types/organization';
import type { InvoiceStats } from '@/types/invoice';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { DensityToggle } from '@/components/ui/DensityToggle';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, setUser } = useAuthStore();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [invoiceStats, setInvoiceStats] = useState<InvoiceStats | null>(null);
  const [isLoadingOrg, setIsLoadingOrg] = useState(true);

  useEffect(() => {
    refreshUserData();
    loadOrganization();
    loadInvoiceStats();
  }, []);

  const refreshUserData = async () => {
    try {
      // Fetch fresh user data to update auth store
      const freshUserData = await userService.getProfile();
      setUser(freshUserData);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const loadOrganization = async () => {
    try {
      // Skip for Super Admin - they don't belong to organizations
      if (user?.role === 'SUPER_ADMIN') {
        setIsLoadingOrg(false);
        return;
      }

      const org = await organizationService.getMyOrganization();
      setOrganization(org);
    } catch (error) {
      console.error('Failed to load organization:', error);
    } finally {
      setIsLoadingOrg(false);
    }
  };

  const loadInvoiceStats = async () => {
    try {
      // Skip for Super Admin - they don't have org-specific stats
      if (user?.role === 'SUPER_ADMIN') {
        return;
      }

      const stats = await invoiceService.getStats();
      setInvoiceStats(stats);
    } catch (error) {
      console.error('Failed to load invoice stats:', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div>
          {/* shadcn Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">
              Welcome back, {user?.firstName || 'User'}! 👋
            </h2>
            <p className="text-muted-foreground mt-2">
              Here's what's happening with your invoices today.
            </p>
          </div>

          {/* Alerts */}
          {user?.role === 'SUPER_ADMIN' && (
            <Alert type="info" className="mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <strong className="font-semibold">🔐 Super Administrator Mode</strong>
                  <p className="text-sm mt-1">
                    You have system-wide access. Use the Admin Panel to manage countries, users, and organizations.
                  </p>
                </div>
                <Button onClick={() => router.push('/admin')} className="bg-purple-600 text-white hover:bg-purple-700">
                  Go to Admin Panel
                </Button>
              </div>
            </Alert>
          )}

          {user?.role !== 'SUPER_ADMIN' && !isLoadingOrg && !organization && (
            <Alert type="warning" className="mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <strong className="font-semibold">Set up your organization</strong>
                  <p className="text-sm mt-1">
                    You need to create an organization before you can create invoices.
                  </p>
                </div>
                <Button onClick={() => router.push('/organization/setup')}>
                  Set Up Now
                </Button>
              </div>
            </Alert>
          )}

          {organization && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{organization.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tax ID: {organization.taxId} • {organization._count?.users || 0} members
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push('/organization/settings')}>
                    Settings
                  </Button>
                </div>
              </CardHeader>
            </Card>
          )}

          {/* shadcn Stats Grid - Enhanced Cards */}
          <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-4">
            <div 
              className="@container/card cursor-pointer"
              onClick={() => router.push('/invoices')}
            >
              <Card className="bg-gradient-to-t from-primary/5 to-card">
                <CardHeader>
                  <CardDescription>Total Invoices</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {invoiceStats?.total || 0}
                  </CardTitle>
                  <CardAction>
                    <Badge variant="outline">
                      📊 All time
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                  <div className="line-clamp-1 font-medium">
                    Click to view all invoices
                  </div>
                  <div className="text-muted-foreground">
                    Complete invoice overview
                  </div>
                </CardFooter>
              </Card>
            </div>

            <div 
              className="@container/card cursor-pointer"
              onClick={() => router.push('/invoices?status=DRAFT')}
            >
              <Card className="bg-gradient-to-t from-primary/5 to-card">
                <CardHeader>
                  <CardDescription>Draft</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-yellow-600">
                    {invoiceStats?.draft || 0}
                  </CardTitle>
                  <CardAction>
                    <Badge variant="outline">
                      📝 Pending
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                  <div className="line-clamp-1 font-medium">
                    Awaiting submission
                  </div>
                  <div className="text-muted-foreground">
                    Ready to be submitted
                  </div>
                </CardFooter>
              </Card>
            </div>

            <div 
              className="@container/card cursor-pointer"
              onClick={() => router.push('/invoices?status=VALIDATED')}
            >
              <Card className="bg-gradient-to-t from-primary/5 to-card">
                <CardHeader>
                  <CardDescription>Validated</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-green-600">
                    {invoiceStats?.validated || 0}
                  </CardTitle>
                  <CardAction>
                    <Badge variant="outline">
                      ✅ Approved
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                  <div className="line-clamp-1 font-medium">
                    Successfully validated
                  </div>
                  <div className="text-muted-foreground">
                    Government approved
                  </div>
                </CardFooter>
              </Card>
            </div>

            <div 
              className="@container/card cursor-pointer"
              onClick={() => router.push('/invoices?status=REJECTED')}
            >
              <Card className="bg-gradient-to-t from-primary/5 to-card">
                <CardHeader>
                  <CardDescription>Rejected</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-red-600">
                    {invoiceStats?.rejected || 0}
                  </CardTitle>
                  <CardAction>
                    <Badge variant="outline">
                      ⚠️ Attention
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                  <div className="line-clamp-1 font-medium">
                    Need attention
                  </div>
                  <div className="text-muted-foreground">
                    Review and resubmit
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* shadcn Quick Actions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2" 
                  onClick={() => router.push('/invoices/create')}
                >
                  <span>➕</span>
                  <span>Create Invoice</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => router.push('/customers')}
                >
                  <span>👥</span>
                  <span>View Customers</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => router.push('/compliance')}
                >
                  <span>🏛️</span>
                  <span>Compliance</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2" 
                  onClick={() => router.push('/reports')}
                >
                  <span>📊</span>
                  <span>Reports</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* shadcn Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                  <dd className="mt-1 text-sm font-semibold">{user?.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Role</dt>
                  <dd className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {user?.role}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                  <dd className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {user?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Member Since</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}

