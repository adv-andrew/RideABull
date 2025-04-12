'use client'

import React, { useState, useEffect } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { motion } from 'framer-motion'
import Link from 'next/link'

type Ride = {
  id: string
  driver: {
    name: string
    avatar: string
    rating: number
  }
  origin: string
  destination: string
  date: string
  time: string
  seats: number
  price: number
  ecoSavings: number
}

export default function Dashboard() {
  const [rides, setRides] = useState<Ride[]>([])
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [searchOrigin, setSearchOrigin] = useState('')
  const [searchDestination, setSearchDestination] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize Google Maps
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      version: 'weekly',
      libraries: ['places']
    })

    loader.load().then(() => {
      const map = new google.maps.Map(document.getElementById('map')!, {
        center: { lat: 37.7749, lng: -122.4194 }, // San Francisco by default
        zoom: 12,
        styles: [
          {
            featureType: 'all',
            elementType: 'geometry',
            stylers: [{ color: '#242f3e' }]
          },
          {
            featureType: 'all',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#242f3e' }]
          },
          {
            featureType: 'all',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#746855' }]
          }
        ]
      })
      setMap(map)
    })

    // Fetch mock rides data
    const mockRides: Ride[] = [
      {
        id: '1',
        driver: {
          name: 'John Doe',
          avatar: 'https://i.pravatar.cc/150?u=john',
          rating: 4.8
        },
        origin: 'UC Berkeley',
        destination: 'San Francisco',
        date: '2024-04-15',
        time: '14:00',
        seats: 3,
        price: 15,
        ecoSavings: 2.5
      },
      // Add more mock rides...
    ]

    setRides(mockRides)
    setIsLoading(false)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Ride A Bull
            </h1>
            <Link
              href="/rides/new"
              className="btn-primary"
            >
              Post a Ride
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Origin
                  </label>
                  <input
                    type="text"
                    value={searchOrigin}
                    onChange={(e) => setSearchOrigin(e.target.value)}
                    className="input-field"
                    placeholder="Where from?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={searchDestination}
                    onChange={(e) => setSearchDestination(e.target.value)}
                    className="input-field"
                    placeholder="Where to?"
                  />
                </div>
              </div>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {rides.map((ride) => (
                <motion.div
                  key={ride.id}
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start space-x-4">
                    <img
                      src={ride.driver.avatar}
                      alt={ride.driver.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {ride.origin} → {ride.destination}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {ride.date} at {ride.time}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            ${ride.price}
                          </p>
                          <p className="text-sm text-green-600">
                            {ride.ecoSavings} kg CO₂ saved
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {ride.driver.name}
                          </span>
                          <span className="text-sm text-yellow-500">
                            ★ {ride.driver.rating}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {ride.seats} seats available
                          </span>
                          <Link
                            href={`/rides/${ride.id}`}
                            className="btn-primary text-sm"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div className="hidden lg:block">
            <div
              id="map"
              className="h-[calc(100vh-12rem)] w-full rounded-lg shadow-lg"
            />
          </div>
        </div>
      </main>
    </div>
  )
} 