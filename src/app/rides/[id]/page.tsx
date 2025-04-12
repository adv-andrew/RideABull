'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader } from '@googlemaps/js-api-loader'
import { motion } from 'framer-motion'

type Ride = {
  id: string
  driver: {
    name: string
    avatar: string
    rating: number
    totalRides: number
  }
  origin: string
  destination: string
  date: string
  time: string
  seats: {
    total: number
    available: number
  }
  price: number
  ecoSavings: number
  preferences: {
    music: boolean
    pets: boolean
    smoking: boolean
  }
  notes: string
}

export default function RideDetails() {
  const params = useParams()
  const [ride, setRide] = useState<Ride | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBooking, setIsBooking] = useState(false)
  const [map, setMap] = useState<google.maps.Map | null>(null)

  useEffect(() => {
    // Load Google Maps
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      version: 'weekly',
      libraries: ['places']
    })

    loader.load().then(() => {
      const map = new google.maps.Map(document.getElementById('ride-map')!, {
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 12
      })
      setMap(map)

      // Mock ride data
      const mockRide: Ride = {
        id: params.id as string,
        driver: {
          name: 'John Doe',
          avatar: 'https://i.pravatar.cc/150?u=john',
          rating: 4.8,
          totalRides: 42
        },
        origin: 'UC Berkeley',
        destination: 'San Francisco',
        date: '2024-04-15',
        time: '14:00',
        seats: {
          total: 4,
          available: 2
        },
        price: 15,
        ecoSavings: 2.5,
        preferences: {
          music: true,
          pets: false,
          smoking: false
        },
        notes: 'Quick ride to SF. Will make one stop at the gas station.'
      }

      setRide(mockRide)
      setIsLoading(false)

      // Draw route on map
      const directionsService = new google.maps.DirectionsService()
      const directionsRenderer = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true
      })

      directionsService.route({
        origin: mockRide.origin,
        destination: mockRide.destination,
        travelMode: google.maps.TravelMode.DRIVING
      }, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRenderer.setDirections(result)
        }
      })
    })
  }, [params.id])

  const handleBooking = async () => {
    setIsBooking(true)
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rideId: params.id,
          seats: 1
        }),
      })

      if (!response.ok) {
        throw new Error('Booking failed')
      }

      // Handle successful booking
      window.location.href = '/dashboard'
    } catch (error) {
      console.error('Booking error:', error)
    } finally {
      setIsBooking(false)
    }
  }

  if (isLoading || !ride) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
            >
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src={ride.driver.avatar}
                  alt={ride.driver.name}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {ride.driver.name}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-500">★</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {ride.driver.rating} · {ride.driver.totalRides} rides
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {ride.origin} → {ride.destination}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {ride.date} at {ride.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${ride.price}
                    </p>
                    <p className="text-sm text-green-600">
                      {ride.ecoSavings} kg CO₂ saved
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Ride Preferences
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className={`flex items-center space-x-2 ${
                      ride.preferences.music ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      <span>🎵</span>
                      <span>Music</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${
                      ride.preferences.pets ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      <span>🐾</span>
                      <span>Pets</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${
                      ride.preferences.smoking ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      <span>🚬</span>
                      <span>Smoking</span>
                    </div>
                  </div>
                </div>

                {ride.notes && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Additional Notes
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {ride.notes}
                    </p>
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        Available Seats
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {ride.seats.available} out of {ride.seats.total}
                      </p>
                    </div>
                    <button
                      onClick={handleBooking}
                      disabled={isBooking || ride.seats.available === 0}
                      className={`btn-primary ${
                        ride.seats.available === 0
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                    >
                      {isBooking
                        ? 'Booking...'
                        : ride.seats.available === 0
                        ? 'Fully Booked'
                        : 'Book Seat'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="hidden lg:block">
            <div
              id="ride-map"
              className="h-[calc(100vh-8rem)] w-full rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  )
} 