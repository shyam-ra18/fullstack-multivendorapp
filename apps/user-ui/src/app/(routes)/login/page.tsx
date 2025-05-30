"use client";
import { useMutation } from '@tanstack/react-query';
import GoogleButton from 'apps/user-ui/src/shared/components/google-button';
import axios, { AxiosError } from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';

type FormData = {
    email: string;
    password: string;
};
const Login = () => {

    const [PasswordVisible, setPasswordVisible] = useState(false);
    const [ServerError, setServerError] = useState<string | null>(null);
    const [RememberMe, setRememberMe] = useState(false);
    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

    const loginMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/login-user`,
                data,
                { withCredentials: true }
            );
            return response.data;
        },
        onSuccess: (data) => {
            setServerError(null);
            router.push('/');
        },
        onError: (error: AxiosError) => {
            const errorMessage = (error.response?.data as { message: string })?.message || "Invalid credentials!";
            setServerError(errorMessage);
        }
    });

    const onSubmit = (data: FormData) => {
        loginMutation.mutate(data);
    };

    return (
        <div className='w-full py-10 min-h-[85vh] bg-[#f1f1f1]'>
            <h1 className='text-4xl font-Poppins font-semibold text-black text-center'>
                Login
            </h1>

            <p className='text-center text-lg font-medium py-3 text-[#00000099]' >
                Home . Login
            </p>

            <div className='w-full flex justify-center'>
                <div className='md:w-[480px] p-8 bg-white shadow rounded-lg'>
                    <h3 className='text-3xl font-semibold text-center mb-2' >Login to Eshop</h3>
                    <p className='text-center text-gray-500 mb-6'>
                        Don't have an account?{' '}
                        <Link href={'/signup'} className='text-[#3489ff] font-semibold cursor-pointer' >
                            Sign Up
                        </Link>
                    </p>

                    <GoogleButton />

                    <div className='flex items-center my-5 text-gray-400 text-sm'>
                        <div className='flex-1 border-t bg-gray-300' />
                        <span className='px-3'>or continue with email</span>
                        <div className='flex-1 border-t bg-gray-300' />
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} >
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
                            <label htmlFor='password' className='block text-gray-700 font-semibold mb-1' >
                                Password
                            </label>
                            <div className='relative'>
                                <input
                                    type={PasswordVisible ? 'text' : 'password'}
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
                                <button type='button' onClick={() => setPasswordVisible(!PasswordVisible)} className='absolute inset-y-0 right-3 flex items-center text-gray-400'>
                                    {PasswordVisible ? <Eye /> : <EyeOff />}
                                </button>
                            </div>
                            {errors.password && <span className='text-red-500 text-sm'>{errors.password.message}</span>}
                        </div>

                        <div className='flex items-center justify-between mb-2'>
                            <label className='flex items-center text-gray-600'>
                                <input type="checkbox"
                                    className='mr-2'
                                    checked={RememberMe}
                                    onChange={(e) => setRememberMe(!RememberMe)}
                                />
                                Remember me
                            </label>
                            <Link href={'/forgot-password'} className='text-[#3489ff] text-sm cursor-pointer' >
                                Forgot Password?
                            </Link>
                        </div>

                        <button
                            type='submit'
                            className='w-full text-lg cursor-pointer bg-black text-white py-2 rounded-lg font-semibold'
                            disabled={loginMutation.isPending}
                        >
                            {loginMutation.isPending ? "Loggin in..." : "Login"}
                        </button>

                        {ServerError && <span className='text-red-500 text-sm mt-2'>{ServerError}</span>}
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login