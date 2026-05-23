'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api/auth';

const schema = z.object({
    firstName: z.string().trim().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().trim().min(2, 'Last name must be at least 2 characters'),
    email: z.string().trim().email('Invalid email address'),
    password: z
        .string()
        .min(8, 'At least 8 characters')
        .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Must contain at least one number')
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
    const router = useRouter();
    const [showPw, setShowPw] = useState(false);
    const [done, setDone] = useState(false);

    const {
        register, handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    const onSubmit = async (data: FormData) => {
        try {
            await authApi.register(data);
            setDone(true);
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            const message = error.response?.data?.message || error.message || 'Registration failed';
            toast.error(message);
        }
    };

    if (done) {
        return (
            <div className="text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
                <h2 className="text-2xl font-bold">Check your email</h2>
                <p className="text-muted-foreground">
                    We sent a verification link to your email address.
                    Click it to activate your account.
                </p>
                <Button variant="outline" onClick={() => router.push('/login')}>
                    Back to Login
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <div className="flex items-center justify-center gap-2
          mb-6 lg:hidden">
                    <div className="w-8 h-8 rounded-lg bg-primary
            flex items-center justify-center">
                        <span className="text-primary-foreground font-bold">E</span>
                    </div>
                    <span className="font-bold text-xl">Ebenezer</span>
                </div>
                <h2 className="text-3xl font-bold">Create your account</h2>
                <p className="text-muted-foreground mt-2">
                    Start journaling your trades for free
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input
                        placeholder="John"
                        {...register('firstName')}
                        className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && (
                        <p className="text-red-500 text-sm">
                            {errors.firstName.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input
                        placeholder="Doe"
                        {...register('lastName')}
                        className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && (
                        <p className="text-red-500 text-sm">
                            {errors.lastName.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                        type="email"
                        placeholder="you@example.com"
                        {...register('email')}
                        className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm">{errors.email.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                        <Input
                            type={showPw ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...register('password')}
                            className={errors.password ? 'border-red-500' : ''}
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
                    {errors.password && (
                        <p className="text-red-500 text-sm">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Account
                </Button>
            </form>

            <p className="text-center text-muted-foreground text-sm">
                Already have an account?{' '}
                <Link href="/login"
                      className="text-primary font-medium hover:underline">
                    Log in
                </Link>
            </p>
        </div>
    );
}