# Portfolio Code for Your Other Website

## 1. Project Data Structure (`lib/portfolio.ts`)

```typescript
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
```

## 2. Project Card Component (`components/ProjectCard.tsx`)

```typescript
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Project } from '@/lib/portfolio'
import { useState } from 'react'

type Props = {
  project: Project
  index: number
}

export default function ProjectCard({ project, index }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-strong rounded-2xl p-6 sm:p-8 border border-white/10 hover:border-white/20 transition-all hover-lift group"
    >
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="text-2xl sm:text-3xl font-clash font-bold text-white group-hover:text-yellow-400 transition-colors">
            {project.title}
          </h3>
          {project.featured && (
            <span className="px-3 py-1 glass rounded-full text-xs font-semibold text-yellow-400 border border-yellow-400/30 whitespace-nowrap">
              Featured
            </span>
          )}
        </div>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
          {project.shortDescription}
        </p>
      </div>

      {/* Technologies */}
      <div className="mb-4 flex flex-wrap gap-2">
        {project.technologies.map((tech, techIndex) => (
          <span
            key={techIndex}
            className="px-3 py-1.5 glass rounded-lg text-xs sm:text-sm text-white/80 border border-white/10 hover:border-white/20 transition-colors"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Full Description */}
      <div className="mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-semibold touch-manipulation min-h-[44px]"
        >
          <span>{isExpanded ? 'Show Less' : 'Read More'}</span>
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-lg"
          >
            ▼
          </motion.span>
        </button>
        
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 space-y-4"
          >
            {project.fullDescription.map((paragraph, pIndex) => (
              <p
                key={pIndex}
                className="text-gray-300 text-sm sm:text-base leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
          </motion.div>
        )}
      </div>

      {/* Links */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
        {project.liveUrl && (
          <motion.a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-white text-black rounded-lg font-clash font-semibold text-sm hover:bg-white/90 transition-colors touch-manipulation min-h-[44px] flex items-center gap-2"
          >
            <span>🌐</span>
            Live Demo
          </motion.a>
        )}
        {project.githubUrl && (
          <motion.a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 glass rounded-lg font-clash font-semibold text-sm text-white/80 hover:text-white hover:border-white/30 border border-white/10 transition-colors touch-manipulation min-h-[44px] flex items-center gap-2"
          >
            <span>💻</span>
            View Code
          </motion.a>
        )}
      </div>
    </motion.div>
  )
}
```

## 3. Portfolio Page (`app/portfolio/page.tsx`)

```typescript
import { projects } from '@/lib/portfolio'
import ProjectCard from '@/components/ProjectCard'
import type { Metadata } from 'next'
import { motion } from 'framer-motion'

export const metadata: Metadata = {
  title: 'Portfolio - Your Name',
  description: 'Showcase of my projects including innovative solutions',
}

export default function PortfolioPage() {
  const featuredProjects = projects.filter(p => p.featured)
  const otherProjects = projects.filter(p => !p.featured)

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-20 sm:pb-32 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-clash font-bold mb-4">
            <span className="gradient-text-gold">My Portfolio</span>
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto">
            Showcasing innovative projects built with modern technologies and best practices
          </p>
        </motion.div>

        {/* Featured Projects */}
        {featuredProjects.length > 0 && (
          <div className="mb-12 sm:mb-16">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl sm:text-3xl font-clash font-bold text-white mb-6 sm:mb-8"
            >
              Featured Projects
            </motion.h2>
            <div className="space-y-6 sm:space-y-8">
              {featuredProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Other Projects */}
        {otherProjects.length > 0 && (
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl sm:text-3xl font-clash font-bold text-white mb-6 sm:mb-8"
            >
              Other Projects
            </motion.h2>
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              {otherProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index + featuredProjects.length} />
              ))}
            </div>
          </div>
        )}

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 sm:mt-16 text-center"
        >
          <div className="glass rounded-2xl p-8 sm:p-12 border border-white/10">
            <h3 className="text-2xl sm:text-3xl font-clash font-bold text-white mb-4">
              Interested in working together?
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.a
                href="mailto:your.email@example.com"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white text-black rounded-lg font-clash font-semibold hover:bg-white/90 transition-colors touch-manipulation min-h-[44px] flex items-center gap-2"
              >
                <span>📧</span>
                Get In Touch
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
```

## Usage Instructions

1. **Copy the files** to your other website project
2. **Install dependencies** (if not already installed):
   - `framer-motion` for animations
   - `next` and `react` if using Next.js
3. **Customize**:
   - Update email in the contact section
   - Modify project descriptions
   - Add/remove projects
   - Adjust styling to match your website theme
4. **Add navigation link** to your portfolio page

## Notes

- The code uses Tailwind CSS classes (glass, glass-strong, etc.) - adjust these to match your styling system
- Uses Framer Motion for animations - replace with your preferred animation library if needed
- The `gradient-text-gold` class should be defined in your CSS
- Mobile-responsive design included
- Touch-friendly buttons (min-h-[44px])

