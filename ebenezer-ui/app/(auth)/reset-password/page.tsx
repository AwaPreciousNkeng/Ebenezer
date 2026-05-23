'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api/auth';

const schema = z
    .object({
        newPassword: z
            .string()
            .min(8, 'At least 8 characters'),
        confirmPassword: z.string(),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });
type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token') ?? '';
    const [showPw, setShowPw] = useState(false);
    const [done, setDone] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    const onSubmit = async ({ newPassword }: FormData) => {
        if (!token) {
            toast.error('Invalid reset token');
            return;
        }
        try {
            await authApi.resetPassword(token, newPassword);
            setDone(true);
        } catch (err: any) {
            toast.error(
                err.response?.data?.message || 'Reset failed. Link may have expired.'
            );
        }
    };

    if (done) {
        return (
            <div className="text-center space-y-6">
                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
                <h2 className="text-2xl font-bold">Password Reset!</h2>
                <p className="text-muted-foreground">
                    Your password has been updated successfully.
                </p>
                <Button onClick={() => router.push('/login')}>
                    Continue to Login
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold">Reset password</h2>
                <p className="text-muted-foreground mt-2">
                    Enter your new password below
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label>New Password</Label>
                    <div className="relative">
                        <Input
                            type={showPw ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...register('newPassword')}
                            className={errors.newPassword ? 'border-red-500' : ''}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw(!showPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2
                text-muted-foreground hover:text-foreground"
                        >
                            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {errors.newPassword && (
                        <p className="text-red-500 text-sm">
                            {errors.newPassword.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input
                        type={showPw ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...register('confirmPassword')}
                        className={
                            errors.confirmPassword ? 'border-red-500' : ''
                        }
                    />
                    {errors.confirmPassword && (
                        <p className="text-red-500 text-sm">
                            {errors.confirmPassword.message}
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
                    Reset Password
                </Button>
            </form>
        </div>
    );
}