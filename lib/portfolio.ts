export type Project = {
  id: string
  title: string
  shortDescription: string
  fullDescription: string[]
  technologies: string[]
  githubUrl?: string
  liveUrl?: string
  featured?: boolean
}

export const projects: Project[] = [
  {
    id: "cinesnap",
    title: "CineSnap - Premium Movie Booking Platform",
    shortDescription: "Full-stack movie ticket booking platform with real-time seat locking, payment integration, OTT recommendations, and cinema-grade UI/UX experience.",
    fullDescription: [
      "CineSnap is a modern, full-stack movie ticket booking platform designed to provide a premium cinema experience with cutting-edge features and seamless user interactions. Built with Next.js 16 and TypeScript, the platform combines real-time functionality, secure payment processing, and intelligent movie recommendations into a unified ecosystem that revolutionizes how users discover and book movie tickets.",
      
      "The platform features a sophisticated real-time seat locking system powered by Redis (Upstash), ensuring that seats are temporarily reserved during the booking process to prevent double-booking conflicts. Users can select seats from an interactive 3D seat map with visual feedback, view real-time availability, and complete bookings with integrated payment gateways including Stripe and Razorpay for secure transactions.",
      
      "CineSnap integrates with The Movie Database (TMDb) API to fetch comprehensive movie data, including trailers, cast information, ratings, and watch providers. The platform intelligently distinguishes between cinema releases and OTT-exclusive content, displaying appropriate showtimes for theater releases and streaming platform links for OTT content. A dedicated OTT section showcases trending movies from Netflix, Prime Video, Apple TV+, and Disney+ Hotstar.",
      
      "The application includes advanced features such as dynamic showtime generation, food and beverage ordering, loyalty points system, wishlist functionality, and comprehensive review system. The admin dashboard allows theater management to add movies, manage showtimes, and monitor bookings. The platform also features email notifications, QR code ticket generation, PDF ticket downloads, and booking cancellation with refund policies.",
      
      "Built with modern web technologies including React 19, Next.js 16, PostgreSQL (Neon), NextAuth.js for authentication, Framer Motion for animations, and Tailwind CSS for responsive design. The application follows mobile-first principles with touch-optimized interfaces, ensuring excellent user experience across all devices. Performance optimizations include ISR caching, parallel API calls, batch database operations, and optimized image loading."
    ],
    technologies: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "PostgreSQL (Neon)",
      "Redis (Upstash)",
      "NextAuth.js",
      "Stripe",
      "Razorpay",
      "TMDb API",
      "Framer Motion",
      "Tailwind CSS",
      "Node.js",
      "Express.js"
    ],
    featured: true,
    liveUrl: "https://cine-snap-58ne2p2xu-shayan-portfolios-projects.vercel.app",
    githubUrl: "https://github.com/Shayuuu/CineSnap"
  },
  {
    id: "cognizant-safe-city",
    title: "Cognizant Safe City",
    shortDescription: "AI-powered smart city solution integrating emergency-responsive traffic signals, real-time headcount tech for fire safety, and mobile apps for citizen feedback.",
    fullDescription: [
      "The Cognizant Safe City project is a cutting-edge, AI-powered public safety solution developed to modernize urban security and optimize emergency response mechanisms. Designed in collaboration with Cognizant under its CSR and Academic Connect initiative, the platform aims to integrate smart surveillance, real-time analytics, and citizen-focused tools into a unified ecosystem that supports proactive law enforcement and safer communities.",
      
      "Key features include a real-time facial recognition system using OpenCV and Python, enabling authorities to identify individuals from surveillance feeds and match them with criminal databases. A geo-mapping dashboard visualizes crime-prone zones and patrol routes, providing data-driven insights for intelligent policing. The platform also includes a centralized incident reporting portal, allowing citizens to file complaints and track their resolution, thereby fostering transparency and community trust.",
      
      "We engineered a dynamic emergency alert system, including a panic button trigger for distress situations, integrated with police and emergency units for instant response. Leveraging IoT and cloud services, the system also supports anomaly detection in public spaces and secure data handling through encrypted APIs and role-based access control. The web application—built with React.js, Node.js, Express.js, and MongoDB—delivers a seamless experience, combining modern UI/UX with powerful backend capabilities.",
      
      "Machine Learning models were incorporated to detect suspicious behavior and predict crime hotspots using historical data patterns. As part of the development team, I contributed to AI modules, UI development, secure API integration, and performance optimization. The project was successfully presented to Cognizant mentors and showcased at intercollegiate innovation forums, representing a significant leap toward intelligent, safer urban infrastructure."
    ],
    technologies: [
      "AI",
      "AR",
      "Full Stack (React, Node.js)",
      "IoT",
      "Embedded Systems",
      "Machine Learning",
      "Computer Vision",
      "PostgreSQL",
      "AWS"
    ],
    featured: true
  }
]

