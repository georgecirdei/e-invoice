'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { invoiceService } from '@/services/invoice.service';
import { paymentService } from '@/services/payment.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

export default function ReportsPage() {
  const [invoiceStats, setInvoiceStats] = useState<any>(null);
  const [paymentStats, setPaymentStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [invoices, payments] = await Promise.all([
        invoiceService.getStats(),
        paymentService.getPaymentStats(),
      ]);
      setInvoiceStats(invoices);
      setPaymentStats(payments);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const invoiceStatusData = invoiceStats ? [
    { name: 'Draft', value: invoiceStats.draft, fill: 'var(--color-draft)' },
    { name: 'Submitted', value: invoiceStats.submitted, fill: 'var(--color-submitted)' },
    { name: 'Validated', value: invoiceStats.validated, fill: 'var(--color-validated)' },
    { name: 'Rejected', value: invoiceStats.rejected, fill: 'var(--color-rejected)' },
  ] : [];

  const paymentStatusData = paymentStats ? [
    { name: 'Paid', value: paymentStats.paidInvoices, fill: 'var(--color-paid)' },
    { name: 'Partially Paid', value: paymentStats.partiallyPaid, fill: 'var(--color-partial)' },
    { name: 'Unpaid', value: paymentStats.unpaidInvoices, fill: 'var(--color-unpaid)' },
  ] : [];

  const invoiceChartConfig = {
    draft: { label: 'Draft', color: '#eab308' },
    submitted: { label: 'Submitted', color: '#3b82f6' },
    validated: { label: 'Validated', color: '#10b981' },
    rejected: { label: 'Rejected', color: '#ef4444' },
  } satisfies ChartConfig;

  const paymentChartConfig = {
    paid: { label: 'Paid', color: '#10b981' },
    partial: { label: 'Partially Paid', color: '#f59e0b' },
    unpaid: { label: 'Unpaid', color: '#ef4444' },
  } satisfies ChartConfig;

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        </div>
        <div>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading analytics...</p>
            </div>
          ) : (
            <>
              {/* Revenue Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${paymentStats?.totalRevenue?.toFixed(2) || '0.00'}</div>
                    <p className="text-xs text-muted-foreground mt-1">From paid invoices</p>
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
                      ${paymentStats?.outstandingAmount?.toFixed(2) || '0.00'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Awaiting payment</p>
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
                      {paymentStats?.overdueInvoices || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Need attention</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Invoices
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{invoiceStats?.total || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">All time</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Invoice Status Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Invoice Status Distribution</CardTitle>
                    <CardDescription>Breakdown by invoice status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={invoiceChartConfig} className="h-[300px] w-full">
                      <PieChart>
                        <Pie
                          data={invoiceStatusData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Payment Status Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Status Distribution</CardTitle>
                    <CardDescription>Breakdown by payment status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={paymentChartConfig} className="h-[300px] w-full">
                      <BarChart data={paymentStatusData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="name"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" radius={4} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Stats */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Business Metrics</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Collection Rate</p>
                      <p className="text-2xl font-bold text-green-600">
                        {paymentStats?.totalInvoices > 0
                          ? Math.round((paymentStats.paidInvoices / paymentStats.totalInvoices) * 100)
                          : 0}%
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Avg Invoice Value</p>
                      <p className="text-2xl font-bold">
                        ${paymentStats?.totalInvoices > 0
                          ? (paymentStats.totalRevenue / paymentStats.paidInvoices).toFixed(2)
                          : '0.00'}
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Validation Rate</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {invoiceStats?.total > 0
                          ? Math.round((invoiceStats.validated / invoiceStats.total) * 100)
                          : 0}%
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Rejection Rate</p>
                      <p className="text-2xl font-bold text-red-600">
                        {invoiceStats?.total > 0
                          ? Math.round((invoiceStats.rejected / invoiceStats.total) * 100)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div></MainLayout></ProtectedRoute>
  );
}

