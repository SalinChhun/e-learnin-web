'use client';
import '@/styles/custom.css'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { TogglePasswordVisibility } from "@/components/shared/TogglePasswordVisibility";
import { PasswordUtils } from '../../../utils/PasswordUtils';

const loginSchema = z.object({
    username: z.string().nonempty('Please enter a valid username'),
    password: z.string().min(3, 'Password must be at least 3 characters'),
    rememberMe: z.boolean().default(false)
});

type LoginFormValues = z.infer<typeof loginSchema>;

const REMEMBER_ME_COOKIE = 'rememberedUser';
const COOKIE_EXPIRY = 30; // Day

function LoginFormContent({ callbackUrl = '/courses' }: { callbackUrl: string }) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: '',
            password: '',
            rememberMe: false,
        },
    });

    useEffect(() => {
        const rememberedUser = Cookies.get(REMEMBER_ME_COOKIE);
        if (rememberedUser) {
            try {
                const userData = JSON.parse(PasswordUtils.decrypt(rememberedUser));
                setValue('username', userData.username);
                setValue('rememberMe', true);
            } catch (e) {
                Cookies.remove(REMEMBER_ME_COOKIE);
            }
        }
    }, [setValue]);

    const onSubmit = async (data: LoginFormValues) => {
        try {
            setIsLoading(true);
            setError(null);

            // Remove error parameter from URL if present
            if (typeof window !== 'undefined') {
                const url = new URL(window.location.href);
                if (url.searchParams.has('error')) {
                    url.searchParams.delete('error');
                    window.history.replaceState({}, '', url.toString());
                }
            }

            if (data.rememberMe) {
                // Only store username, never store password
                const userData = { username: data.username };
                const encryptedData = PasswordUtils.encrypt(JSON.stringify(userData));
                Cookies.set(REMEMBER_ME_COOKIE, encryptedData, { 
                    expires: COOKIE_EXPIRY,
                    secure: window.location.protocol === 'https:',
                    sameSite: 'strict',
                    path: '/',
                    domain: window.location.hostname
                });
            } else {
                Cookies.remove(REMEMBER_ME_COOKIE, {
                    path: '/',
                    domain: window.location.hostname 
                });
            }

            // Call NextAuth signIn function
            const result = await signIn('credentials', {
                redirect: false,
                username: data.username,
                password: data.password,
                remember: data.rememberMe ? "on" : ""
            });

            if (result?.error) {
                // Use the actual error message from the API
                setError(result.error || 'Invalid username or password');
                return;
            }
    
            router.push(callbackUrl);
        } catch (error: any) {
            setError('An unexpected error occurred');
           process.env.NODE_ENV && console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container-fluid g-0 h-100" style={{ backgroundColor: '#003D7A', minHeight: '100vh' }}>
            <div className="row g-0 h-100">
                <div className="col-12 d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                    <div className="d-flex flex-column" style={{ 
                        width: '100%', 
                        maxWidth: '450px', 
                        backgroundColor: 'white', 
                        borderRadius: '12px', 
                        padding: '48px 40px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div className="d-flex flex-column gap-4">
                            <div className="d-flex flex-column gap-2 align-items-center">
                                <div className="d-flex justify-content-center">
                                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M0 16C0 7.16344 7.16344 0 16 0H64C72.8366 0 80 7.16344 80 16V64C80 72.8366 72.8366 80 64 80H16C7.16344 80 0 72.8366 0 64V16Z"
                                            fill="url(#paint0_linear_10_164)"/>
                                        <path
                                            d="M58.8401 37.844C59.1981 37.6861 59.502 37.4266 59.7139 37.0976C59.9259 36.7687 60.0368 36.3848 60.0327 35.9935C60.0287 35.6022 59.9099 35.2207 59.6912 34.8962C59.4724 34.5717 59.1633 34.3185 58.8021 34.168L41.6601 26.36C41.139 26.1223 40.5729 25.9993 40.0001 25.9993C39.4273 25.9993 38.8612 26.1223 38.3401 26.36L21.2001 34.16C20.844 34.316 20.5411 34.5723 20.3284 34.8976C20.1157 35.223 20.0024 35.6033 20.0024 35.992C20.0024 36.3807 20.1157 36.761 20.3284 37.0864C20.5411 37.4117 20.844 37.6681 21.2001 37.824L38.3401 45.64C38.8612 45.8777 39.4273 46.0007 40.0001 46.0007C40.5729 46.0007 41.139 45.8777 41.6601 45.64L58.8401 37.844Z"
                                            stroke="white" strokeWidth="4" strokeLinecap="round"
                                            strokeLinejoin="round"/>
                                        <path d="M60 36V48" stroke="white" strokeWidth="4" strokeLinecap="round"
                                              strokeLinejoin="round"/>
                                        <path
                                            d="M28 41V48C28 49.5913 29.2643 51.1174 31.5147 52.2426C33.7652 53.3679 36.8174 54 40 54C43.1826 54 46.2348 53.3679 48.4853 52.2426C50.7357 51.1174 52 49.5913 52 48V41"
                                            stroke="white" strokeWidth="4" strokeLinecap="round"
                                            strokeLinejoin="round"/>
                                        <defs>
                                            <linearGradient id="paint0_linear_10_164" x1="40" y1="0" x2="40" y2="80"
                                                            gradientUnits="userSpaceOnUse">
                                                <stop stopColor="#003D7A"/>
                                                <stop offset="1" stopColor="#0052A3"/>
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                                <h2 className="text-center mb-0" style={{ color: '#003D7A', fontSize: '24px', fontWeight: '600' }}>
                                    PPCBank E-Learning
                                </h2>
                                <p className="text-center mb-0" style={{ color: '#6B7280', fontSize: '14px' }}>
                                    Sign in to your account
                                </p>
                            </div>
                            <form onSubmit={handleSubmit(onSubmit)} className="d-flex flex-column" style={{ gap: '24px' }}>
                                <div className="d-flex flex-column" style={{ gap: '20px' }}>
                                    <div className="d-flex flex-column" style={{ gap: '8px' }}>
                                        <label htmlFor="username" style={{ 
                                            fontSize: '14px', 
                                            fontWeight: '500', 
                                            color: '#374151',
                                            marginBottom: '4px'
                                        }}>
                                            Username
                                        </label>
                                        <div className="wl-position-relative">
                                            {/*<span className="wl-user-icon"/>*/}
                                            <input 
                                                type="text" 
                                                id="username"
                                                className="wl-icon-inp w-100"
                                                placeholder="Enter your username" 
                                                required  
                                                {...register('username')} 
                                                style={{
                                                    backgroundColor: '#F3F4F6',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    padding: '12px 16px',
                                                    fontSize: '14px'
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="d-flex flex-column" style={{ gap: '8px' }}>
                                        <label htmlFor="password" style={{ 
                                            fontSize: '14px', 
                                            fontWeight: '500', 
                                            color: '#374151',
                                            marginBottom: '4px'
                                        }}>
                                            Password
                                        </label>
                                        <div className="wl-position-relative">
                                            {/*<span className="wl-lock-icon"/>*/}
                                            <input 
                                                className="wl-icon-inp w-100"
                                                type={showPassword ? "text" : "password"}
                                                id="password"
                                                placeholder="Enter your password"
                                                required  
                                                {...register('password')} 
                                                minLength={3}
                                                style={{
                                                    backgroundColor: '#F3F4F6',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    padding: '12px 16px',
                                                    paddingRight: '48px',
                                                    fontSize: '14px'
                                                }}
                                            />
                                            <div 
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="wl-icon-container cursor-pointer"
                                            >
                                                <TogglePasswordVisibility 
                                                    showPassword={showPassword}
                                                    onToggle={() => setShowPassword(!showPassword)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {error && (
                                    <div className="alert alert-danger" style={{ margin: 0 }}>
                                        {error}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    style={{
                                        backgroundColor: '#003D7A',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '23px 24px',
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        opacity: isLoading ? 0.7 : 1,
                                        transition: 'opacity 0.2s',
                                        marginBottom: '50px;'
                                    }}
                                >
                                    {isLoading ? (
                                        <span>Loading...</span>
                                    ) : (
                                        <>
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                                                 xmlns="http://www.w3.org/2000/svg">
                                                <path d="M6.66675 11.3333L10.0001 8L6.66675 4.66666" stroke="white"
                                                      strokeWidth="1.33333" strokeLinecap="round"
                                                      strokeLinejoin="round"/>
                                                <path d="M10 8H2" stroke="white" strokeWidth="1.33333"
                                                      strokeLinecap="round" strokeLinejoin="round"/>
                                                <path
                                                    d="M10 2H12.6667C13.0203 2 13.3594 2.14048 13.6095 2.39052C13.8595 2.64057 14 2.97971 14 3.33333V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H10"
                                                    stroke="white" strokeWidth="1.33333" strokeLinecap="round"
                                                    strokeLinejoin="round"/>
                                            </svg>
                                            <span>Sign In</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginForm() {
    return (
        <Suspense fallback={<div className="text-center p-5"></div>}>
            <LoginFormWithSearchParams/>
        </Suspense>
    );
}

function LoginFormWithSearchParams() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams?.get('callbackUrl') || '/courses';

    return <LoginFormContent callbackUrl={callbackUrl}/>;
}
