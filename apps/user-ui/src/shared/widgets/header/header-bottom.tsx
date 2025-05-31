"use client";

import { navItems } from 'apps/user-ui/src/configs/constants';
import useUser from 'apps/user-ui/src/hooks/useUser';
import { AlignLeft, ChevronDown, Heart, ShoppingCart, UserIcon } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'

const HeaderBottom = () => {
    const [Show, setShow] = useState(false);
    const [IsSticky, setIsSticky] = useState(false);
    const { user, isLoading, isError, refetch } = useUser();

    const handleShow = () => {
        setShow(!Show);
    };

    //Track the scroll position
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > 100) {
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [])

    return (
        <div className={`w-full transition-all duration-300  ${IsSticky ? 'fixed top-0 left-0 z-50 bg-white shadow-lg' : 'relative'}`}>
            <div className={`w-[80%] relative m-auto flex items-center justify-between ${IsSticky ? 'pt-3' : 'py-0'}`}>
                {/* All Dropdowns */}
                <div className={`w-[260px] ${IsSticky && 'mb-2'} cursor-pointer flex items-center justify-between px-5  h-[50px] bg-[#3489ff] `}
                    onClick={handleShow}
                >
                    <div className='flex items-center gap-2'>
                        <AlignLeft color='white' />
                        <span className='text-white font-medium'>All Categories</span>
                    </div>

                    <ChevronDown color='white' />
                </div>

                {/* Dropdown menu */}
                {Show ? (
                    <div className={`absolute left-0 ${IsSticky ? 'top-[70px]' : 'top-[50px]'} w-[260px] h-[400px] bg-[#f5f5f5]`}>
                    </div>
                ) : null}

                {/* Navigation Links */}
                <div className='flex items-center'>
                    {navItems.map((i: NavItemsTypes, index: number) => (
                        <Link
                            className='px-5 font-medium text-lg cursor-pointer hover:text-[#3489ff]'
                            href={i.href}
                            key={`nav-${index}`}
                        >
                            {i.title}
                        </Link>
                    ))}
                </div>

                <div>
                    {IsSticky ? (
                        <div className='flex items-center gap-8' >
                            <div className='flex items-center gap-2' >
                                {!isLoading && user ? (
                                    <>
                                        <Link
                                            href="/profile"
                                            className='border-2 w-[46px] h-[46px] rounded-full flex items-center justify-center border-[#010f1c1a]'
                                        >
                                            <UserIcon size={27} color='black' />
                                        </Link>
                                        <Link href="/profile">
                                            <span className='block font-medium'>Hello,</span>
                                            <span className='font-semibold'>{user?.name}</span>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className='border-2 w-[46px] h-[46px] rounded-full flex items-center justify-center border-[#010f1c1a]'
                                        >
                                            <UserIcon size={27} color='black' />
                                        </Link>
                                        <Link href="/login">
                                            <span className='block font-medium' >Hello,</span>
                                            <span className='font-semibold'>{isLoading ? '...' : "Sign In"}</span>
                                        </Link>
                                    </>
                                )}
                            </div>

                            <div className='flex items-center gap-5' >
                                <Link
                                    href="/wishlist"
                                    className='relative'
                                >
                                    <Heart size={28} color='black' />
                                    <div className='w-5 h-5 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute -top-1.5 -right-2.5'>
                                        <span className='text-white text-xs font-medium'>2</span>
                                    </div>
                                </Link>

                                <Link
                                    href="/cart"
                                    className='relative'
                                >
                                    <ShoppingCart size={28} color='black' />
                                    <div className='w-5 h-5 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute -top-1.5 -right-2.5'>
                                        <span className='text-white text-xs font-medium'>0</span>
                                    </div>
                                </Link>

                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    )
}

export default HeaderBottom