import { useMutation } from '@tanstack/react-query';
import { shopCategories } from 'apps/seller-ui/src/utils/categories';
import axios from 'axios';
import React from 'react'
import { useForm } from 'react-hook-form';

const CreateShop = ({ sellerId, setActiveStep }: {
    sellerId: string,
    setActiveStep: (step: number) => void;
}) => {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const shopCreateMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/create-shop`, data);
            return response.data;
        },
        onSuccess: (data) => {
            setActiveStep(3);
        }
    });

    const onSubmit = async (data: any) => {
        const shopData = { ...data, sellerId };
        shopCreateMutation.mutate(shopData);
    }

    const countWords = (text: string) => text.trim().split(/\s+/).length;

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <h3 className='text-2xl font-semibold text-center mb-4'>Setup new shop</h3>

                <div className='mb-1'>
                    <label className='block text-gray-700 mb-1'>Name *</label>
                    <input
                        type='text'
                        placeholder='Shop name'
                        className='w-full p-2 border border-gray-300 rounded outline-none mb-1'
                        {...register('name', {
                            required: 'Name is required',
                        })}
                    />
                    {errors.name && <span className='text-red-500 text-sm'>{errors.name.message}</span>}
                </div>

                <div className='mb-1'>
                    <label className='block text-gray-700 mb-1'>Bio (Max 100 words) *</label>
                    <input
                        type='text'
                        placeholder='Shop bio'
                        maxLength={100}
                        className='w-full p-2 border border-gray-300 rounded outline-none mb-1'
                        {...register('bio', {
                            required: 'Shop bio required',
                            // validate: (value) => countWords(value) >= 100 && 'Bio must be less than 100 words'
                        })}
                    />
                    {errors.bio && <span className='text-red-500 text-sm'>{errors.bio.message}</span>}
                </div>

                <div className='mb-1'>
                    <label className='block text-gray-700 mb-1'>Address *</label>
                    <input
                        type='text'
                        maxLength={100}
                        placeholder='Shop location'
                        className='w-full p-2 border border-gray-300 rounded outline-none mb-1'
                        {...register('address', {
                            required: 'Shop Address is required',
                            // validate: (value) => countWords(value) >= 100 && 'Address must be less than 100 words'
                        })}
                    />
                    {errors.address && <span className='text-red-500 text-sm'>{errors.address.message}</span>}
                </div>

                <div className='mb-1'>
                    <label className='block text-gray-700 mb-1'>Opening Hours *</label>
                    <input
                        type='text'
                        placeholder='e.g, Mon-Fri 9AM - 6PM'
                        className='w-full p-2 border border-gray-300 rounded outline-none mb-1'
                        {...register('openingHours', {
                            required: 'Opening hours are required',
                        })}
                    />
                    {errors.openingHours && <span className='text-red-500 text-sm'>{errors.openingHours.message}</span>}
                </div>

                <div className='mb-1'>
                    <label className='block text-gray-700 mb-1'>Website</label>
                    <input
                        type='text'
                        placeholder='https://example.com'
                        className='w-full p-2 border border-gray-300 rounded outline-none mb-1'
                        {...register('website', {
                            pattern: {
                                value: /^(https?:\/\/)?([\w\d-]+\.)+\w{2,}(\/.*)?$/,
                                message: "Enter a valid URL"
                            }
                        })}
                    />
                    {errors.website && <span className='text-red-500 text-sm'>{errors.website.message}</span>}
                </div>

                <div className='mb-1'>
                    <label className='block text-gray-700 mb-1'>Category *</label>
                    <select
                        className='w-full p-2 border border-gray-300 rounded outline-none mb-1'
                        {...register('category', { required: 'Category is required' })}
                    >
                        <option value="">Select category</option>
                        {shopCategories?.map((category) => (
                            <option key={category.value} value={category.value}>
                                {category.label}
                            </option>
                        ))}
                    </select>
                    {errors.category && <span className='text-red-500 text-sm'>{errors.category.message}</span>}
                </div>

                <button
                    type='submit'
                    className='w-full text-lg bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 mt-4'
                >
                    Create Shop
                </button>
            </form>
        </div>
    )
}

export default CreateShop