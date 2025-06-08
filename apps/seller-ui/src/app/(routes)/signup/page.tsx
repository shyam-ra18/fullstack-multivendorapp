"use client";
import { useMutation } from '@tanstack/react-query';
import StripeLogo from 'apps/seller-ui/src/assets/svgs/stripeLogo';
import CreateShop from 'apps/seller-ui/src/shared/modules/auth/CreateShop';
import { countries } from 'apps/seller-ui/src/utils/countries';
import axios, { AxiosError } from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

const Signup = () => {
    const [activeStep, setActiveStep] = useState(1);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [canResend, setCanResend] = useState<boolean>(false);
    const [showOtp, setShowOtp] = useState<boolean>(false);
    const [timer, setTimer] = useState(60);
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [sellerData, setSellerData] = useState<FormData | null>(null);
    const [sellerId, setSellerId] = useState('');
    const inputRefs = useRef<HTMLInputElement[]>([]);
    const router = useRouter()
    const { register, handleSubmit, formState: { errors } } = useForm();

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

    const signupMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/seller-registration`, data);
            return response.data;
        },
        onSuccess: (_, formData) => {
            setSellerData(formData);
            setShowOtp(true);
            setCanResend(false);
            setTimer(60);
            startResendTimer();
        }
    });

    const verifyOtpMutation = useMutation({
        mutationFn: async () => {
            if (!sellerData) return;
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify-seller`, {
                ...sellerData,
                otp: otp.join('')
            });
            return response.data;
        },
        onSuccess: (data) => {
            setSellerId(data?.seller?.id);
            setActiveStep(2);
        }
    })

    const onSubmit = (data: any) => {
        signupMutation.mutate(data);
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^[0-9]?$/.test(value)) return;

        const newOpt = [...otp];
        newOpt[index] = value;
        setOtp(newOpt);

        if (value && index < inputRefs?.current?.length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    }

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    }

    const resendOtp = () => {
        if (sellerData) {
            signupMutation.mutate(sellerData);
        }
    }

    const connectStripe = async () => {
        try {
            router.push('/success');
            return
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/create-stripe-link`, { sellerId });

            if (response.data.url) {
                window.location.href = response.data.url;
            }
        } catch (error) {
            console.log(`Stripe Error: ${error}`);
        }
    }

    return (
        <div className="w-full flex flex-col items-center pt-10 min-h-screen">
            {/* Stepper */}
            <div className='relative flex items-center justify-between md:w-1/2 mb-8'>
                <div className='absolute top-[25%] left-0 w-[80%] md:w-[90%] h-1 bg-gray-300 -z-10' />
                {[1, 2, 3].map((step, index) => (
                    <div key={`step-${step}`}>
                        <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold ${step <= activeStep ? 'bg-blue-600' : 'bg-gray-300'}`}>
                            {step}
                        </div>
                        <span className='ml-[-24px]'>
                            {step === 1 ? "Create Account" : step === 2 ? "Setup Shop" : "Connect Bank"}
                        </span>
                    </div>
                ))}
            </div>

            {/* Step Content */}
            <div className='md:w-[480px] p-8 bg-white shadow rounded-lg'>
                {activeStep === 1 ? (
                    <>
                        {!showOtp ? (
                            <form onSubmit={handleSubmit(onSubmit)} >
                                <h3 className='text-2xl font-semibold text-center mb-4'>Create Account</h3>
                                <div className='mb-1'>
                                    <label htmlFor='name' className='block text-gray-700 font-semibold mb-1' >
                                        Name
                                    </label>
                                    <input
                                        type='text'
                                        id='name'
                                        placeholder='Enter your name'
                                        className='w-full p-2 border border-gray-300 rounded outline-none mb-1'
                                        {...register('name', {
                                            required: 'Name is required',
                                        })}
                                    />
                                    {errors.name && <span className='text-red-500 text-sm'>{errors.name.message}</span>}
                                </div>

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

                                <div className='mb-1'>
                                    <label htmlFor='phone' className='block text-gray-700 font-semibold mb-1' >
                                        Phone Number
                                    </label>
                                    <input
                                        type='tel'
                                        id='phone'
                                        placeholder='9876543210'
                                        className='w-full p-2 border border-gray-300 rounded outline-none mb-1'
                                        {...register('phone', {
                                            required: 'Phone Number is required',
                                            pattern: {
                                                value: /^\+?[1-9]\d{1,14}$/,
                                                message: 'Invalid phone number format'
                                            },
                                            minLength: {
                                                value: 10,
                                                message: 'Phone number must be at least 10 digits'
                                            },
                                            maxLength: {
                                                value: 15,
                                                message: 'Phone number cannot exceed 15 digits'
                                            }
                                        })}
                                    />
                                    {errors.phone && <span className='text-red-500 text-sm'>{errors.phone.message}</span>}
                                </div>

                                <div className='mb-1'>
                                    <label htmlFor='phone' className='block text-gray-700 font-semibold mb-1' >
                                        Country
                                    </label>
                                    <select
                                        className='w-full p-2 border border-gray-300 rounded-[4px] outline-none mb-1'
                                        {...register('country', {
                                            required: 'Country is required'
                                        })}
                                    >
                                        <option value="">Select your country</option>
                                        {countries?.map((country) => (
                                            <option key={country.code} value={country.code}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.country && <span className='text-red-500 text-sm'>{errors.country.message}</span>}
                                </div>

                                <div className='mb-4'>
                                    <label htmlFor='password' className='block text-gray-700 font-semibold mb-1' >
                                        Password
                                    </label>
                                    <div className='relative'>
                                        <input
                                            type={passwordVisible ? 'text' : 'password'}
                                            id='password'
                                            placeholder='Minimum 6 characters'
                                            className='w-full p-2 border border-gray-300 rounded outline-none mb-1'
                                            {...register('password', {
                                                required: 'Password is required',
                                                minLength: {
                                                    value: 6,
                                                    message: 'Password must be at least 6 characters'
                                                }
                                            })}
                                        />
                                        <button type='button' onClick={() => setPasswordVisible(!passwordVisible)} className='absolute inset-y-0 right-3 flex items-center text-gray-400'>
                                            {passwordVisible ? <Eye /> : <EyeOff />}
                                        </button>
                                    </div>
                                    {errors.password && <span className='text-red-500 text-sm'>{errors.password.message}</span>}
                                </div>

                                <button
                                    type='submit'
                                    disabled={signupMutation.isPending}
                                    className='w-full text-lg cursor-pointer bg-black text-white py-2 rounded-lg font-semibold'
                                >
                                    {signupMutation.isPending ? "Signing up..." : "Signup"}
                                </button>

                                {signupMutation.isError &&
                                    signupMutation.error instanceof AxiosError && (
                                        <p className='text-red-500 text-sm mt-2'>{signupMutation.error.response?.data?.message || signupMutation.error.message}</p>
                                    )
                                }

                                <p className='pt-3 text-center'>
                                    Already have an account? {" "}
                                    <Link href="/login" className='text-blue-500 font-semibold' >Login</Link>
                                </p>

                            </form>
                        ) : (
                            <div>
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

                            </div>
                        )}
                    </>
                ) : null}

                {activeStep === 2 ? (
                    <CreateShop sellerId={sellerId} setActiveStep={setActiveStep} />
                ) : null}

                {activeStep === 3 ? (
                    <div className='text-center'>
                        <h3 className='text-2xl font-semibold'>Withdraw Method</h3>
                        <br />
                        <button
                            className='w-full m-auto flex items-center justify-center gap-3 text-lg bg-[#334155] text-white py-2 rounded-lg'
                            onClick={connectStripe}
                        >
                            <StripeLogo />
                            Connect Stripe
                        </button>
                    </div>
                ) : null}
            </div>

        </div>
    )
}

export default Signup