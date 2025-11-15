'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Invoices', href: '/invoices', icon: '📄' },
  { name: 'Customers', href: '/customers', icon: '👥' },
  { name: 'Payments', href: '/payments', icon: '💰' },
  { name: 'Reports', href: '/reports', icon: '📊' },
  { name: 'Compliance', href: '/compliance', icon: '🏛️' },
];

const adminNavigation = [
  { name: 'Admin Panel', href: '/admin', icon: '🔐' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <div className="w-[220px] flex h-screen flex-col fixed inset-y-0 z-50 border-r bg-background">
      {/* shadcn Logo */}
      <div className="flex items-center border-b px-6 h-14">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            EI
          </div>
          <div className="text-base font-semibold">E-Invoice</div>
        </Link>
      </div>

      {/* shadcn Navigation - Always Visible */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* Admin Section */}
        {user?.role === 'SUPER_ADMIN' && (
          <>
            <div className="my-4 border-t" />
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Administration
              </p>
            </div>
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                      : 'text-muted-foreground hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300'
                  )}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* shadcn User Info */}
      <div className="border-t p-4">
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

