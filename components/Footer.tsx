'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative mt-auto border-t border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/5 via-transparent to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 relative z-10">
        <div className="footer-bottom relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-lg sm:text-xl font-clash font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                <span className="text-2xl">🎬</span>
                <span className="gradient-text-gold">CineSnap</span>
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Premium movie ticket booking experience with real-time seat locking and immersive cinema-grade UI.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h4 className="text-base sm:text-lg font-clash font-semibold text-white mb-3 sm:mb-4">Quick Links</h4>
              <ul className="space-y-1.5 sm:space-y-2">
                {[
                  { href: '/movies', label: 'Movies' },
                  { href: '/bookings', label: 'My Bookings' },
                ].map((link, index) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    whileHover={{ x: 5 }}
                  >
                    <Link href={link.href} className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm touch-manipulation flex items-center gap-1 group">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h4 className="text-base sm:text-lg font-clash font-semibold text-white mb-3 sm:mb-4">Tech Stack</h4>
              <ul className="space-y-1.5 sm:space-y-2">
                {['Next.js 16', 'TypeScript', 'MySQL', 'Tailwind CSS'].map((tech, index) => (
                  <motion.li
                    key={tech}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className="text-gray-400 text-xs sm:text-sm flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></span>
                    {tech}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="footer-bottom-content pt-6 sm:pt-8 border-t border-white/10"
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
              <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
                &copy; {currentYear} CineSnap. All Rights Reserved.
              </p>
              <p className="text-gray-500 text-[10px] sm:text-xs text-center sm:text-right flex items-center gap-1">
                Made with{' '}
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="inline-block"
                >
                  ❤️
                </motion.span>
                {' '}for movie lovers
              </p>
            </div>
            {/* Signature Watermark */}
            <div className="signature-watermark">S</div>
          </motion.div>
        </div>
      </div>
    </footer>
  )
}

