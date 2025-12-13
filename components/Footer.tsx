'use client'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative mt-auto border-t border-white/10 bg-black/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        <div className="footer-bottom relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <h3 className="text-lg sm:text-xl font-clash font-bold text-white mb-3 sm:mb-4">CineSnap</h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                Premium movie ticket booking experience. Book your favorite movies with ease.
              </p>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-clash font-semibold text-white mb-3 sm:mb-4">Quick Links</h4>
              <ul className="space-y-1.5 sm:space-y-2">
                <li>
                  <a href="/movies" className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm touch-manipulation">
                    Movies
                  </a>
                </li>
                <li>
                  <a href="/bookings" className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm touch-manipulation">
                    My Bookings
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-clash font-semibold text-white mb-3 sm:mb-4">Contact</h4>
              <p className="text-gray-400 text-xs sm:text-sm">
                Experience the future of movie booking.
              </p>
            </div>
          </div>
          
          <div className="footer-bottom-content pt-6 sm:pt-8 border-t border-white/10">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
              <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
                &copy; {currentYear} CineSnap. All Rights Reserved.
              </p>
              <p className="text-gray-500 text-[10px] sm:text-xs text-center sm:text-right">
                Made with ❤️ for movie lovers
              </p>
            </div>
            {/* Signature Watermark */}
            <div className="signature-watermark">S</div>
          </div>
        </div>
      </div>
    </footer>
  )
}

