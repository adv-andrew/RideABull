import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'

// Mock database
let bookings: {
  id: string
  rideId: string
  userId: string
  seats: number
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: string
}[] = []

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401 }
    )
  }

  // Get user's bookings
  const userBookings = bookings.filter(booking => booking.userId === session.user.id)
  return new NextResponse(JSON.stringify(userBookings))
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
    if (!data.rideId || !data.seats) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      )
    }

    // In a real application, you would:
    // 1. Check if the ride exists
    // 2. Verify seat availability
    // 3. Create a payment intent with Gemini API
    // 4. Update ride's available seats
    // 5. Store the booking in the database

    const newBooking = {
      id: (bookings.length + 1).toString(),
      rideId: data.rideId,
      userId: session.user.id,
      seats: data.seats,
      status: 'confirmed' as const,
      createdAt: new Date().toISOString()
    }

    bookings.push(newBooking)

    return new NextResponse(JSON.stringify(newBooking), { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create booking' }),
      { status: 500 }
    )
  }
} 