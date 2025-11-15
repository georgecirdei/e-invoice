'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/user.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onChangePassword = async (data: PasswordFormData) => {
    try {
      setIsChangingPassword(true);
      setError(null);
      setSuccess(null);

      await userService.changePassword(data.currentPassword, data.newPassword);

      setSuccess('Password changed successfully! Please login again.');
      reset();
      
      // Logout after 2 seconds
      setTimeout(() => {
        logout();
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setError('Please enter your password to confirm account deletion');
      return;
    }

    if (
      !confirm(
        'Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted.'
      )
    ) {
      return;
    }

    try {
      setIsDeletingAccount(true);
      setError(null);

      await userService.deleteAccount(deletePassword);

      alert('Account deleted successfully');
      logout();
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <ProtectedRoute><MainLayout><div className="mb-6 flex items-center justify-between"><h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
            <Button variant="outline" size="sm" onClick={() => router.push('/profile')}>
              View Profile
            </Button>
          </div><div>
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Account Settings</h2>
              <p className="text-muted-foreground">Manage your account security and preferences</p>
            </div>
            <Button variant="outline" onClick={() => router.push('/profile')}>
              View Profile
            </Button>
          </div>

          {error && <Alert type="error" className="mb-6">{error}</Alert>}
          {success && <Alert type="success" className="mb-6">{success}</Alert>}

          {/* Change Password */}
          <Card className="mb-6 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="Enter current password"
                  error={errors.currentPassword?.message}
                  {...register('currentPassword')}
                  required
                />

                <Input
                  label="New Password"
                  type="password"
                  placeholder="Enter new password"
                  helperText="Min 8 characters, 1 uppercase, 1 lowercase, 1 number"
                  error={errors.newPassword?.message}
                  {...register('newPassword')}
                  required
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Confirm new password"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                  required
                />

                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword ? 'Changing...' : 'Change Password'}
                  </Button>
              </form>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          {user?.role !== 'SUPER_ADMIN' && (
            <Card className="border-destructive/50 shadow-sm">
              <CardHeader className="pb-3 bg-destructive/5">
                <CardTitle className="text-base text-destructive">⚠️ Danger Zone</CardTitle>
                <CardDescription className="text-destructive/80">
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-red-200">
                    <h3 className="text-sm font-semibold text-red-900 mb-2">
                      Delete Account
                    </h3>
                    <p className="text-sm text-red-700 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>

                    <div className="space-y-3">
                      <Input
                        label="Enter your password to confirm"
                        type="password"
                        placeholder="Your password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                      />

                      <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={isDeletingAccount}
                      >
                        {isDeletingAccount ? 'Deleting...' : 'Delete My Account'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {user?.role === 'SUPER_ADMIN' && (
            <Card className="border-purple-200/50 shadow-sm bg-purple-50/50">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔐</span>
                  <div>
                    <p className="text-sm font-medium text-purple-900 mb-1">
                      Super Admin Protection
                    </p>
                    <p className="text-sm text-purple-700">
                      Super Admin accounts cannot be deleted for security reasons. Contact system administrator if you need to remove this account.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        </div></MainLayout></ProtectedRoute>
  );
}

