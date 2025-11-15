'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, error: authError, clearError } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      clearError();
      
      await registerUser(data);
      
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = error || authError;

  if (success) {
    return (
      <div className="bg-muted flex min-h-screen flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Card>
            <CardContent className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-2">
                Registration Successful!
              </h2>
              <p className="text-muted-foreground mb-4">
                Your account has been created successfully.
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to login page...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted flex min-h-screen flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        {/* Logo/Brand */}
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg font-bold text-sm">
            EI
          </div>
          <span className="text-xl font-semibold">E-Invoice</span>
        </Link>

        {/* Register Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>
              Enter your information to get started
            </CardDescription>
          </CardHeader>

          <CardContent>
            {displayError && (
              <Alert type="error" className="mb-4">
                {displayError}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  type="text"
                  placeholder="John"
                  error={errors.firstName?.message}
                  {...register('firstName')}
                  required
                />

                <Input
                  label="Last Name"
                  type="text"
                  placeholder="Doe"
                  error={errors.lastName?.message}
                  {...register('lastName')}
                  required
                />
              </div>

              <Input
                label="Email"
                type="email"
                placeholder="m@example.com"
                error={errors.email?.message}
                {...register('email')}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="Create a strong password"
                error={errors.password?.message}
                helperText="Min 8 characters, 1 uppercase, 1 lowercase, 1 number"
                {...register('password')}
                required
              />

              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="w-full bg-foreground text-background hover:bg-foreground/90"
              >
                {isLoading ? 'Creating account...' : 'Sign up'}
              </Button>

              <div className="text-center text-sm text-muted-foreground mt-4">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Terms */}
        <p className="text-center text-xs text-muted-foreground px-6">
          By continuing, you agree to our{' '}
          <a href="#" className="underline hover:text-primary">
            Terms of Service
          </a>
          {' '}and{' '}
          <a href="#" className="underline hover:text-primary">
            Privacy Policy
          </a>.
        </p>
      </div>
    </div>
  );
}

