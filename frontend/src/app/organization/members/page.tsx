'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { organizationService } from '@/services/organization.service';
import type { Organization, OrganizationMember } from '@/types/organization';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

const addMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'MANAGER', 'USER', 'VIEWER']),
});

type AddMemberFormData = z.infer<typeof addMemberSchema>;

export default function MembersPage() {
  const router = useRouter();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddMemberFormData>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      role: 'USER',
    },
  });

  useEffect(() => {
    loadOrganization();
  }, []);

  const loadOrganization = async () => {
    try {
      setIsLoading(true);
      const org = await organizationService.getMyOrganization();
      
      if (!org) {
        router.push('/organization/setup');
        return;
      }

      // Fetch full organization with members
      const fullOrg = await organizationService.getById(org.id);
      setOrganization(fullOrg);
    } catch (err: any) {
      setError('Failed to load organization');
    } finally {
      setIsLoading(false);
    }
  };

  const onAddMember = async (data: AddMemberFormData) => {
    if (!organization) return;

    try {
      setIsAdding(true);
      setError(null);
      setSuccess(null);

      await organizationService.addMember(organization.id, {
        email: data.email,
        role: data.role,
      });

      setSuccess('Member added successfully!');
      setShowAddForm(false);
      reset();
      await loadOrganization();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!organization || !confirm('Are you sure you want to remove this member?')) return;

    try {
      setError(null);
      await organizationService.removeMember(organization.id, userId);
      setSuccess('Member removed successfully!');
      await loadOrganization();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!organization) return;

    try {
      setError(null);
      await organizationService.updateMemberRole(organization.id, userId, newRole);
      setSuccess('Role updated successfully!');
      await loadOrganization();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update role');
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading members...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute><MainLayout><div className="mb-6 flex items-center justify-between"><h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
            <Button  size="sm" onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? 'Cancel' : '+ Add Member'}
            </Button>
          </div><div>
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              ← Back to Dashboard
            </Button>
          </div>

          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Team Members
              </h1>
              <p className="text-gray-600">
                Manage your organization's team members and their roles
              </p>
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'Cancel' : '+ Add Member'}
            </Button>
          </div>

          {error && (
            <Alert type="error" className="mb-6">
              {error}
            </Alert>
          )}

          {success && (
            <Alert type="success" className="mb-6">
              {success}
            </Alert>
          )}

          {/* Add Member Form */}
          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Add New Member</CardTitle>
                <CardDescription>
                  Invite a user to join your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onAddMember)} className="space-y-4">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="user@example.com"
                    helperText="User must already be registered in the system"
                    error={errors.email?.message}
                    {...register('email')}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      {...register('role')}
                    >
                      <option value="VIEWER">Viewer - Can view invoices</option>
                      <option value="USER">User - Can create invoices</option>
                      <option value="MANAGER">Manager - Can manage customers & invoices</option>
                      <option value="ADMIN">Admin - Full access</option>
                    </select>
                    {errors.role && (
                      <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isAdding}
                  >
                    {isAdding ? 'Adding...' : 'Add Member'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Members List */}
          <Card>
            <CardHeader>
              <CardTitle>Current Members ({organization?.users?.length || 0})</CardTitle>
              <CardDescription>
                Team members in {organization?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!organization?.users || organization.users.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No members found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {organization.users.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                          {!member.isActive && (
                            <span className="ml-2 text-xs text-red-600">(Inactive)</span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Member since {new Date(member.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <select
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="VIEWER">Viewer</option>
                          <option value="USER">User</option>
                          <option value="MANAGER">Manager</option>
                          <option value="ADMIN">Admin</option>
                        </select>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Role Information */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-0.5">
                    ADMIN
                  </span>
                  <p className="text-sm text-gray-600">
                    Full access - Manage organization, members, invoices, customers, settings
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-0.5">
                    MANAGER
                  </span>
                  <p className="text-sm text-gray-600">
                    Manage invoices, customers, and view reports
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-0.5">
                    USER
                  </span>
                  <p className="text-sm text-gray-600">
                    Create and manage own invoices
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-0.5">
                    VIEWER
                  </span>
                  <p className="text-sm text-gray-600">
                    View-only access to invoices and reports
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </div></MainLayout></ProtectedRoute>
  );
}

