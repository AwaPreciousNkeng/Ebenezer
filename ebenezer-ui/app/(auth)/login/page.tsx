'use client';
import {useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {Eye, EyeOff, Loader2} from 'lucide-react';
import {toast} from 'sonner';
import {AxiosError} from 'axios';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {authApi} from '@/lib/api/auth';
import {useAuthStore} from '@/store/authStore';
import {GoogleAuthButton} from '@/components/auth/GoogleAuthButton';

const schema = z.object({
    email: z.email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
    const router = useRouter();
    const setAuth = useAuthStore((s) => s.setAuth);
    const [showPw, setShowPw] = useState(false);

    const {
        register, handleSubmit,
        formState: {errors, isSubmitting},
    } = useForm<FormData>({resolver: zodResolver(schema)});

    const onSubmit = async (data: FormData) => {
        try {
            const res = await authApi.login(data);

            const {user, access_token: accessToken, refresh_token: refreshToken} = res.data;
            setAuth(user, accessToken, refreshToken);
            toast.success(`Welcome back, ${user.fullName}!`);
            router.push('/dashboard');
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            console.error("Login submission error caught:", err);
            const message = error.response?.data?.message || error.message || 'Invalid credentials';
            toast.error(message);
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-6 lg:hidden">
                    <div className="w-8 h-8 rounded-lg bg-primary
            flex items-center justify-center">
                        <span className="text-primary-foreground font-bold">E</span>
                    </div>
                    <span className="font-bold text-xl">Ebenezer</span>
                </div>
                <h2 className="text-3xl font-bold">Welcome back</h2>
                <p className="text-muted-foreground mt-2">
                    Log in to your trading journal
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
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
                    <div className="flex justify-between items-center">
                        <Label htmlFor="password">Password</Label>
                        <Link href="/forgot-password"
                              className="text-sm text-primary hover:underline">
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <Input
                            id="password"
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
                            {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
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
                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                    )}
                    Log In
                </Button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border"/>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        or continue with
                    </span>
                </div>
            </div>

            <GoogleAuthButton/>

            <p className="text-center text-muted-foreground text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/register"
                      className="text-primary font-medium hover:underline">
                    Sign up for free
                </Link>
            </p>
        </div>
    );
}