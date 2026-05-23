'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api/auth';

const schema = z.object({
    email: z.email('Invalid email address'),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
    const [sent, setSent] = useState(false);

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    const onSubmit = async ({ email }: FormData) => {
        try {
            await authApi.forgotPassword(email);
            setSent(true);
        } catch {
            // Always show success to prevent email enumeration
            setSent(true);
        }
    };

    if (sent) {
        return (
            <div className="text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-primary/10
          flex items-center justify-center mx-auto">
                    <Mail className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Check your email</h2>
                <p className="text-muted-foreground">
                    If an account exists for{' '}
                    <span className="text-foreground font-medium">
            {getValues('email')}
          </span>
                    , we sent a password reset link. It expires in 1 hour.
                </p>
                <Button variant="outline" asChild>
                    <Link href="/login">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Login
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold">Forgot password?</h2>
                <p className="text-muted-foreground mt-2">
                    Enter your email and we'll send you a reset link
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                        type="email"
                        placeholder="you@example.com"
                        {...register('email')}
                        className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                >
                    {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Send Reset Link
                </Button>
            </form>

            <p className="text-center">
                <Link
                    href="/login"
                    className="text-sm text-muted-foreground
            hover:text-foreground flex items-center
            justify-center gap-1"
                >
                    <ArrowLeft size={14} />
                    Back to Login
                </Link>
            </p>
        </div>
    );
}