'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function Verify() {
  const router = useRouter()
  const [verificationStep, setVerificationStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const steps = [
    {
      title: 'Identity Verification',
      description: 'We\'ll verify your student status using your .edu email',
    },
    {
      title: 'Document Upload',
      description: 'Upload your student ID or enrollment verification',
    },
    {
      title: 'Blockchain Verification',
      description: 'Secure verification through Midnight blockchain',
    },
  ]

  const handleVerification = async () => {
    setIsLoading(true)
    setError('')

    try {
      // Simulate verification steps
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (verificationStep < steps.length) {
        setVerificationStep(prev => prev + 1)
      } else {
        // Final step completed
        router.push('/dashboard')
      }
    } catch (error) {
      setError('Verification failed. Please try again.')
      console.error('Verification error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="card max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Student Verification
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Complete verification to access the platform
          </p>
        </div>

        <div className="mb-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className={`flex items-center mb-4 ${
                index < verificationStep ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 ${
                  index < verificationStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index < verificationStep ? '✓' : index + 1}
              </motion.div>
              <div>
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <button
          onClick={handleVerification}
          disabled={isLoading}
          className="btn-primary w-full"
        >
          {isLoading
            ? 'Verifying...'
            : verificationStep === steps.length
            ? 'Complete Verification'
            : 'Continue'}
        </button>

        {verificationStep === steps.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-green-50 text-green-600 rounded-lg text-center"
          >
            Almost there! Click complete to finish verification.
          </motion.div>
        )}
      </div>
    </main>
  )
} 