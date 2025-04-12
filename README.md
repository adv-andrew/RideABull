# Ride A Bull

A modern ride-sharing application built with Next.js, allowing users to create, book, and manage rides.

## Features

- 🔐 Authentication (Email and Google OAuth)
- 🚗 Ride Creation and Management
- 📅 Booking System
- 👤 User Profiles
- 🎨 Modern UI with Tailwind CSS
- 📱 Responsive Design

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- NextAuth.js

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ride-a-bull.git
   cd ride-a-bull
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add the following environment variables:
   ```
   DATABASE_URL="your_database_url"
   NEXTAUTH_SECRET="your_nextauth_secret"
   GOOGLE_CLIENT_ID="your_google_client_id"
   GOOGLE_CLIENT_SECRET="your_google_client_secret"
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 