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

