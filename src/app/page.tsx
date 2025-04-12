'use client'

import React from 'react'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      await signIn('credentials', {
        email: data.email,
        password: data.password,
        callbackUrl: '/dashboard'
      })
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="card max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Ride A Bull
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Student-only secure rideshare
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email (.edu only)
            </label>
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.edu$/i,
                  message: 'Must be a valid .edu email'
                }
              })}
              type="email"
              className="input-field"
              placeholder="university@edu"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message as string}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              {...register('password', { required: 'Password is required' })}
              type="password"
              className="input-field"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message as string}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex justify-center"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Image
              src="/google.svg"
              alt="Google logo"
              width={20}
              height={20}
            />
            Sign in with Google
          </button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
            Don't have an account?{' '}
            <a href="/register" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
              Register here
            </a>
          </p>
        </form>
      </div>
    </main>
  )
} 