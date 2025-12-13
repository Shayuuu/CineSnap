'use client'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative mt-auto border-t border-white/10 bg-black/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="footer-bottom relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-clash font-bold text-white mb-4">CineSnap</h3>
              <p className="text-gray-400 text-sm">
                Premium movie ticket booking experience. Book your favorite movies with ease.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-clash font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/movies" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Movies
                  </a>
                </li>
                <li>
                  <a href="/bookings" className="text-gray-400 hover:text-white transition-colors text-sm">
                    My Bookings
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-clash font-semibold text-white mb-4">Contact</h4>
              <p className="text-gray-400 text-sm">
                Experience the future of movie booking.
              </p>
            </div>
          </div>
          
          <div className="footer-bottom-content pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm text-center md:text-left">
                &copy; {currentYear} CineSnap. All Rights Reserved.
              </p>
              <p className="text-gray-500 text-xs text-center md:text-right">
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

