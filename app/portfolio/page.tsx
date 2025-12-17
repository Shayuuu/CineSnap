import { projects } from '@/lib/portfolio'
import ProjectCard from '@/components/ProjectCard'
import type { Metadata } from 'next'
import { motion } from 'framer-motion'

export const metadata: Metadata = {
  title: 'Portfolio - CineSnap',
  description: 'Showcase of my projects including CineSnap and other innovative solutions',
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
              <motion.a
                href="/movies"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 glass rounded-lg font-clash font-semibold text-white/80 hover:text-white hover:border-white/30 border border-white/10 transition-colors touch-manipulation min-h-[44px] flex items-center gap-2"
              >
                <span>🎬</span>
                Explore CineSnap
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

