'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

type BentoCardProps = {
  children: ReactNode
  className?: string
  span?: 'col-span-1' | 'col-span-2' | 'row-span-1' | 'row-span-2'
  delay?: number
}

export function BentoCard({ children, className = '', span = 'col-span-1', delay = 0 }: BentoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      className={`
        glass-enhanced rounded-2xl p-6 sm:p-8 
        border border-white/10 hover:border-cyan-400/30
        hover:shadow-[0_8px_32px_rgba(0,249,255,0.2),0_0_60px_rgba(255,45,146,0.1)]
        transition-all duration-300 cursor-pointer
        ${span}
        ${className}
      `}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      <div className="relative h-full w-full">
        {children}
      </div>
    </motion.div>
  )
}

type BentoGridProps = {
  children: ReactNode
  className?: string
}

export default function BentoGrid({ children, className = '' }: BentoGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 ${className}`}>
      {children}
    </div>
  )
}

