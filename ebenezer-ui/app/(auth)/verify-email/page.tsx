'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api/auth';

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token found.');
            return;
        }

        authApi
            .verifyEmail(token)
            .then(() => {
                setStatus('success');
                setMessage('Your email has been verified successfully!');
            })
            .catch((err) => {
                setStatus('error');
                setMessage(
                    err.response?.data?.message ||
                    'Verification failed. The link may have expired.'
                );
            });
    }, [token]);

    return (
        <div className="text-center space-y-6">
            {status === 'loading' && (
                <>
                    <Loader2 className="w-16 h-16 animate-spin
            text-primary mx-auto" />
                    <h2 className="text-2xl font-bold">
                        Verifying your email...
                    </h2>
                </>
            )}

            {status === 'success' && (
                <>
                    <CheckCircle className="w-16 h-16 text-emerald-500
            mx-auto" />
                    <h2 className="text-2xl font-bold">Email Verified!</h2>
                    <p className="text-muted-foreground">{message}</p>
                    <Button onClick={() => router.push('/login')}>
                        Continue to Login
                    </Button>
                </>
            )}

            {status === 'error' && (
                <>
                    <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                    <h2 className="text-2xl font-bold">Verification Failed</h2>
                    <p className="text-muted-foreground">{message}</p>
                    <div className="flex gap-3 justify-center">
                        <Button variant="outline"
                                onClick={() => router.push('/login')}>
                            Back to Login
                        </Button>
                        <Button onClick={() => router.push('/register')}>
                            Register Again
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}