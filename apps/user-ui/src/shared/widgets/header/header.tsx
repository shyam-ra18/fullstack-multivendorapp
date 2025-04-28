import Link from 'next/link'
import React from 'react'
import { Heart, Search, ShoppingCart, UserIcon } from 'lucide-react'
import HeaderBottom from './header-bottom'

const Header = () => {
    return (
        <div className='w-full bg-white'>
            <div className='w-[80%] py-5 m-auto flex items-center justify-between' >

                <div>
                    <Link href="/">
                        <span className='text-2xl font-bold'>Eshop-Multivendor</span>
                    </Link>
                </div>

                <div className='w-[50%] relative'>
                    <input
                        type="text"
                        placeholder='Search Product'
                        className='w-full border border-[#3489ff] outline-none h-[45px] px-4 rounded-lg font-Poppins font-medium'
                    />
                    <div
                        className='absolute top-0 right-0 cursor-pointer px-4 h-[45px] flex justify-center items-center bg-[#3489ff] rounded-r-lg text-white font-Poppins font-medium'
                    >
                        <Search size={20} color='white' />
                    </div>
                </div>

                <div className='flex items-center gap-8' >
                    <div className='flex items-center gap-2' >
                        <Link
                            href="/login"
                            className='border-2 w-[46px] h-[46px] rounded-full flex items-center justify-center border-[#010f1c1a]'
                        >
                            <UserIcon size={27} color='black' />
                        </Link>
                        <Link href="/login">
                            <span className='block font-medium' >Hello,</span>
                            <span className='font-semibold'>Sign In</span>
                        </Link>
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
            </div>

            <div className='border-b border-b-neutral-200' />
            <HeaderBottom />

        </div >
    )
}

export default Header