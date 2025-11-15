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

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, error: authError, clearError } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      clearError();
      
      await login(data);
      
      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = error || authError;

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

        {/* Login Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your E-Invoice account
            </CardDescription>
          </CardHeader>

          <CardContent>
            {displayError && (
              <Alert type="error" className="mb-4">
                {displayError}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Input
                  label="Email"
                  type="email"
                  placeholder="m@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-foreground">
                    Password <span className="text-destructive">*</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className={`w-full h-10 px-3 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                    errors.password ? 'border-destructive' : 'border-input'
                  }`}
                  {...register('password')}
                  required
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-foreground text-background hover:bg-foreground/90 border-0"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>

              <div className="text-center text-sm text-muted-foreground mt-4">
                Don&apos;t have an account?{' '}
                <Link
                  href="/register"
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
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

