'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader } from '@googlemaps/js-api-loader'
import { useForm } from 'react-hook-form'

type FormData = {
  origin: string
  destination: string
  date: string
  time: string
  seats: number
  price: number
  preferences: {
    music: boolean
    pets: boolean
    smoking: boolean
  }
  notes: string
}

export default function CreateRide() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const originAutocomplete = useRef<google.maps.places.Autocomplete | null>(null)
  const destinationAutocomplete = useRef<google.maps.places.Autocomplete | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const directionsService = useRef<google.maps.DirectionsService | null>(null)
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      preferences: {
        music: false,
        pets: false,
        smoking: false
      }
    }
  })

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      version: 'weekly',
      libraries: ['places']
    })

    loader.load().then(() => {
      // Initialize map
      const map = new google.maps.Map(document.getElementById('route-map')!, {
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 12
      })
      mapRef.current = map

      // Initialize directions service and renderer
      directionsService.current = new google.maps.DirectionsService()
      directionsRenderer.current = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true
      })

      // Initialize autocomplete for origin and destination
      const originInput = document.getElementById('origin') as HTMLInputElement
      const destinationInput = document.getElementById('destination') as HTMLInputElement

      originAutocomplete.current = new google.maps.places.Autocomplete(originInput, {
        types: ['geocode']
      })

      destinationAutocomplete.current = new google.maps.places.Autocomplete(destinationInput, {
        types: ['geocode']
      })

      // Update route when places are selected
      originAutocomplete.current.addListener('place_changed', updateRoute)
      destinationAutocomplete.current.addListener('place_changed', updateRoute)
    })
  }, [])

  const updateRoute = () => {
    if (!originAutocomplete.current || !destinationAutocomplete.current) return

    const origin = originAutocomplete.current.getPlace()
    const destination = destinationAutocomplete.current.getPlace()

    if (!origin?.geometry?.location || !destination?.geometry?.location) return

    const request = {
      origin: origin.geometry.location,
      destination: destination.geometry.location,
      travelMode: google.maps.TravelMode.DRIVING
    }

    directionsService.current?.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK && result) {
        directionsRenderer.current?.setDirections(result)
      }
    })
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/rides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        throw new Error('Failed to create ride')
      }
    } catch (error) {
      console.error('Error creating ride:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Create a New Ride
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Route Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="origin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Pick-up Location
                    </label>
                    <input
                      id="origin"
                      {...register('origin', { required: 'Pick-up location is required' })}
                      type="text"
                      className="input-field"
                      placeholder="Enter pick-up location"
                    />
                    {errors.origin && (
                      <p className="mt-1 text-sm text-red-600">{errors.origin.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="destination" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Drop-off Location
                    </label>
                    <input
                      id="destination"
                      {...register('destination', { required: 'Drop-off location is required' })}
                      type="text"
                      className="input-field"
                      placeholder="Enter drop-off location"
                    />
                    {errors.destination && (
                      <p className="mt-1 text-sm text-red-600">{errors.destination.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Date
                      </label>
                      <input
                        {...register('date', { required: 'Date is required' })}
                        type="date"
                        className="input-field"
                      />
                      {errors.date && (
                        <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Time
                      </label>
                      <input
                        {...register('time', { required: 'Time is required' })}
                        type="time"
                        className="input-field"
                      />
                      {errors.time && (
                        <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="seats" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Available Seats
                      </label>
                      <input
                        {...register('seats', {
                          required: 'Number of seats is required',
                          min: { value: 1, message: 'At least 1 seat is required' },
                          max: { value: 8, message: 'Maximum 8 seats allowed' }
                        })}
                        type="number"
                        className="input-field"
                      />
                      {errors.seats && (
                        <p className="mt-1 text-sm text-red-600">{errors.seats.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Price per Seat ($)
                      </label>
                      <input
                        {...register('price', {
                          required: 'Price is required',
                          min: { value: 0, message: 'Price cannot be negative' }
                        })}
                        type="number"
                        step="0.01"
                        className="input-field"
                      />
                      {errors.price && (
                        <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Preferences
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      {...register('preferences.music')}
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                      Music allowed
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      {...register('preferences.pets')}
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                      Pets allowed
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      {...register('preferences.smoking')}
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                      Smoking allowed
                    </label>
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Additional Notes
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={4}
                      className="input-field"
                      placeholder="Any additional information for passengers..."
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full"
              >
                {isLoading ? 'Creating ride...' : 'Create Ride'}
              </button>
            </form>
          </div>

          <div className="hidden lg:block">
            <div
              id="route-map"
              className="h-[calc(100vh-8rem)] w-full rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  )
} 