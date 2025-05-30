"use client";
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';

type FormData = {
    email: string;
    password: string;
};
const ForgotPassword = () => {
    const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [canResend, setCanResend] = useState<boolean>(false);
    const [ServerError, setServerError] = useState<string | null>(null);
    const [timer, setTimer] = useState(60);
    const router = useRouter();
    const inputRefs = useRef<HTMLInputElement[]>([]);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

    const startResendTimer = () => {
        const interval = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer < 1) {
                    clearInterval(interval);
                    setCanResend(true);
                    return 0;
                }
                return prevTimer - 1;
            });
        }, 1000)
    }

    const requestOtpMutation = useMutation({
        mutationFn: async ({ email }: { email: string }) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user-forgot-password`, { email });
            return response.data;
        },
        onSuccess: (_, { email }) => {
            setUserEmail(email);
            setStep('otp');
            setServerError(null);
            setCanResend(false);
            startResendTimer();
        },
        onError: (error: AxiosError) => {
            const errorMessage = (error.response?.data as { message: string })?.message || "Invalid email. Try again!";
            setServerError(errorMessage);
        }
    });

    const verifyOtpMutation = useMutation({
        mutationFn: async () => {
            if (!userEmail) return;
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user-verify-forgot-password`, {
                email: userEmail,
                otp: otp.join(""),
            });
            return response.data;
        },
        onSuccess: () => {
            setStep('reset');
            setServerError(null);
        },
        onError: (error: AxiosError) => {
            const errorMessage = (error.response?.data as { message: string })?.message || "Invalid OTP. Try again!";
            setServerError(errorMessage);
        }
    });

    const resetPasswordMutation = useMutation({
        mutationFn: async ({ password }: { password: string }) => {
            if (!userEmail) return;
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user-reser-password`, {
                email: userEmail,
                newPassword: password
            });
            return response.data;
        },
        onSuccess: () => {
            setServerError(null);
            toast.success("Password reset successfully!");
            router.push('/login');
        },
        onError: (error: AxiosError) => {
            const errorMessage = (error.response?.data as { message: string })?.message || "Failed to reset password. Try again!";
            setServerError(errorMessage);
        }
    });

    const onSubmit = (data: FormData) => {
        console.log(data)
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^[0-9]?$/.test(value)) return;

        const newotp = [...otp];
        newotp[index] = value;
        setOtp(newotp);

        if (value && index < inputRefs?.current?.length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    }

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    }

    const onSubmitEmail = ({ email }: { email: string }) => {
        requestOtpMutation.mutate({ email });
    }

    const onSubmitPassword = ({ password }: { password: string }) => {
        resetPasswordMutation.mutate({ password });
    }

    return (
        <div className='w-full py-10 min-h-[85vh] bg-[#f1f1f1]'>
            <Toaster />
            <h1 className='text-4xl font-Poppins font-semibold text-black text-center'>
                Forgot Password
            </h1>

            <p className='text-center text-lg font-medium py-3 text-[#00000099]' >
                Home . Forgot-password
            </p>

            <div className='w-full flex justify-center'>
                <div className='md:w-[480px] p-8 bg-white shadow rounded-lg'>
                    {step === 'email' && (
                        <>
                            <h3 className='text-3xl font-semibold text-center mb-2'> Remember Password ? </h3>
                            <p className='text-center text-gray-500 mb-6'>
                                Go back to?{' '}
                                <Link href={'/login'} className='text-[#3489ff] font-semibold cursor-pointer' >
                                    Login
                                </Link>
                            </p>

                            <form onSubmit={handleSubmit(onSubmitEmail)} >
                                <div className='mb-1'>
                                    <label htmlFor='email' className='block text-gray-700 font-semibold mb-1' >
                                        Email
                                    </label>
                                    <input
                                        type='email'
                                        id='email'
                                        placeholder='example@.com'
                                        className='w-full p-2 border border-gray-300 rounded outline-none mb-1'
                                        {...register('email', {
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w{2,3})+$/,
                                                message: 'Invalid email address'
                                            }
                                        })}
                                    />
                                    {errors.email && <span className='text-red-500 text-sm'>{errors.email.message}</span>}
                                </div>

                                <button
                                    type='submit'
                                    className='w-full text-lg cursor-pointer mt-4 bg-black text-white py-2 rounded-lg font-semibold'
                                    disabled={requestOtpMutation.isPending}
                                >
                                    {requestOtpMutation.isPending ? 'Sending OTP...' : 'Send OTP'}
                                </button>

                                {ServerError && <span className='text-red-500 text-sm mt-2'>{ServerError}</span>}
                            </form>
                        </>
                    )}

                    {step === 'otp' && (
                        <>
                            <h3 className='text-xl font-semibold text-center mb-4' >Enter OTP</h3>
                            <div className='flex justify-center gap-6' >
                                {otp?.map((digit, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        ref={(el) => {
                                            if (el && inputRefs.current) {
                                                inputRefs.current[index] = el
                                            }
                                        }}
                                        maxLength={1}
                                        className='w-12 h-12 text-center border border-gray-300 outline-none !rounded'
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    />
                                ))}
                            </div>
                            <button
                                className='w-full mt-4 text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-lg'
                                disabled={verifyOtpMutation.isPending}
                                onClick={() => verifyOtpMutation.mutate()}
                            >
                                {verifyOtpMutation.isPending ? "Verifying..." : 'Verify OTP'}
                            </button>
                            <p className='text-center text-sm mt-4'>
                                {canResend ? (
                                    <button
                                        onClick={resendOtp}
                                        className='text-blue-500 cursor-pointer font-semibold'
                                    >
                                        Resend OTP
                                    </button>
                                ) : (
                                    `Resend OTP in ${timer}s`
                                )}
                            </p>
                            {
                                verifyOtpMutation.isError && verifyOtpMutation.error instanceof Error &&
                                <p className='text-red-500 text-sm mt-2'>{verifyOtpMutation.error?.response?.data?.message || verifyOtpMutation.error.message}</p>
                            }
                        </>
                    )}

                    {step === "reset" && (
                        <>
                            <h3 className='text-xl font-semibold text-center mb-4' >Reset Password</h3>

                            <form onSubmit={handleSubmit(onSubmitPassword)} >
                                <label className='block text-gray-700 mb-1' >New Password</label>
                                <input
                                    type={'password'}
                                    placeholder='Enter New Password'
                                    className='w-full p-2 border border-gray-300 rounded outline-none mb-1'
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: {
                                            value: 6,
                                            message: 'Password must be at least 6 characters'
                                        }
                                    })}
                                />
                                {errors.password && <p className='text-red-500 text-sm'>{String(errors.password.message)}</p>}

                                <button
                                    type='submit'
                                    className='w-full mt-4 text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-lg'
                                    disabled={resetPasswordMutation.isPending}
                                >
                                    {resetPasswordMutation.isPending ? "Resetting..." : 'Reset Password'}
                                </button>

                                {ServerError && <p className='text-red-500 text-sm mt-2'>{ServerError}</p>}
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword