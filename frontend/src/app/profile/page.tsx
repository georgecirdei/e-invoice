'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/user.service';
import type { User } from '@/types/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getProfile();
      setProfile(data);
      
      reset({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email,
      });
    } catch (err: any) {
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(false);

      const updatedUser = await userService.updateProfile(data);
      
      // Update user in auth store
      setUser(updatedUser);
      setProfile(updatedUser);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute><MainLayout><div className="mb-6 flex items-center justify-between"><h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          </div><div>
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">My Profile</h2>
            <p className="text-muted-foreground">Manage your personal information and preferences</p>
          </div>

          {/* Profile Information */}
          <Card className="mb-6 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {error && <Alert type="error" className="mb-6">{error}</Alert>}
              {success && (
                <Alert type="success" className="mb-6">
                  Profile updated successfully!
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    placeholder="John"
                    error={errors.firstName?.message}
                    {...register('firstName')}
                    required
                  />

                  <Input
                    label="Last Name"
                    placeholder="Doe"
                    error={errors.lastName?.message}
                    {...register('lastName')}
                    required
                  />
                </div>

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="john@example.com"
                  error={errors.email?.message}
                  helperText="Changing your email will require re-verification"
                  {...register('email')}
                  required
                />

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/settings')}
                  >
                    Account Settings
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Account Information</CardTitle>
              <CardDescription>View your account details</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">User ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">{profile?.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {profile?.role}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Account Status</dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        profile?.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {profile?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
        </div></MainLayout></ProtectedRoute>
  );
}

