import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'

// Mock database
let rides = [
  {
    id: '1',
    driver: {
      id: '1',
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
]

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401 }
    )
  }

  return new NextResponse(JSON.stringify(rides))
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401 }
    )
  }

  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.origin || !data.destination || !data.date || !data.time || !data.seats || !data.price) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      )
    }

    // Create new ride
    const newRide = {
      id: (rides.length + 1).toString(),
      driver: {
        id: session.user.id,
        name: session.user.name || 'Anonymous',
        avatar: session.user.image || 'https://i.pravatar.cc/150',
        rating: 5.0,
        totalRides: 0
      },
      ...data,
      seats: {
        total: data.seats,
        available: data.seats
      },
      ecoSavings: calculateEcoSavings(data.origin, data.destination)
    }

    rides.push(newRide)

    return new NextResponse(JSON.stringify(newRide), { status: 201 })
  } catch (error) {
    console.error('Error creating ride:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create ride' }),
      { status: 500 }
    )
  }
}

// Mock function to calculate eco savings
function calculateEcoSavings(origin: string, destination: string): number {
  // In a real application, this would use the Google Maps API to calculate distance
  // and then apply some formula to estimate CO2 savings
  return Math.round(Math.random() * 5 * 10) / 10 // Random number between 0 and 5 with one decimal
} 