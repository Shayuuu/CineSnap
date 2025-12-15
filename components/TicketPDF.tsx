'use client'

import { useEffect, useState, useCallback } from 'react'
import { Page, Text, View, Document, StyleSheet, Image, pdf } from '@react-pdf/renderer'
import QRCode from 'qrcode'

type TicketPDFProps = {
  bookingId: string
  movieTitle: string
  showtime: string
  seats: string[]
  total: number
  qrData?: string
  posterUrl?: string
  theaterName?: string
  screenName?: string
  themeColors?: {
    primary: string
    secondary: string
    accent: string
  }
}

const createStyles = (hasPoster: boolean) => StyleSheet.create({
  page: {
    padding: 0,
    backgroundColor: '#0a0a0a',
    color: '#ffffff',
    fontFamily: 'Helvetica',
  },
  container: {
    padding: 18,
    height: 559, // Fixed height: 595 (page) - 36 (padding) = 559
    backgroundColor: hasPoster ? 'rgba(0,0,0,0.75)' : '#0a0a0a',
    flexDirection: 'column',
  },
  header: {
    marginBottom: 12,
    alignItems: 'center',
  },
  brand: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 4,
    borderRadius: 4,
  },
  brandSub: {
    fontSize: 10,
    color: '#ffffff',
    opacity: 0.95,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 2,
    borderRadius: 2,
  },
  content: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 6,
  },
  leftSection: {
    flex: 1,
    marginRight: 15,
  },
  rightSection: {
    width: 100,
    alignItems: 'center',
  },
  posterThumbnail: {
    width: 100,
    height: 150,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#ffffff',
    borderStyle: 'solid',
  },
  poster: {
    width: 100,
    height: 150,
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 4,
    borderRadius: 4,
  },
  movieSubtitle: {
    fontSize: 11,
    color: '#ffffff',
    marginBottom: 10,
    opacity: 0.95,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 2,
    borderRadius: 2,
  },
  showtime: {
    fontSize: 12,
    color: '#ffffff',
    marginBottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 2,
    borderRadius: 2,
  },
  qrContainer: {
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#ffffff',
    borderStyle: 'solid',
  },
  qrImage: {
    width: 120,
    height: 120,
  },
  auditorium: {
    fontSize: 12,
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 4,
    borderRadius: 4,
  },
  seatInfo: {
    fontSize: 12,
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 4,
    borderRadius: 4,
  },
  divider: {
    borderTop: '1 dashed #ffffff',
    marginVertical: 6,
    opacity: 0.5,
  },
  location: {
    fontSize: 11,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 1.4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 3,
    borderRadius: 3,
  },
  bookingId: {
    fontSize: 9,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 2,
    borderRadius: 2,
  },
  section: {
    marginBottom: 15,
  },
  label: {
    fontSize: 10,
    color: '#a0a0a0',
    marginBottom: 5,
  },
  value: {
    fontSize: 14,
    color: '#ffffff',
  },
})

function TicketDocument({ 
  bookingId, 
  movieTitle, 
  showtime, 
  seats, 
  total, 
  qrData, 
  posterUrl,
  theaterName,
  screenName,
  themeColors
}: TicketPDFProps & { qrDataUrl?: string }) {
  const seatDisplay = seats.length > 0 ? seats.join(', ') : 'N/A'
  const screenNumber = screenName ? screenName.replace(/[^0-9]/g, '') || '01' : '01'
  const ticketStyles = createStyles(!!posterUrl)
  
  return (
    <Document>
      <Page size={[420, 595]} style={ticketStyles.page} wrap={false}>
        <View style={ticketStyles.container}>
          {/* Header */}
          <View style={ticketStyles.header}>
            <Text style={ticketStyles.brand}>CineSnap</Text>
            <Text style={ticketStyles.brandSub}>BY SHAYAN SHAIKH</Text>
          </View>

          {/* Content Layout - Movie Info and Poster */}
          <View style={ticketStyles.content}>
            {/* Left Section - Movie Info */}
            <View style={ticketStyles.leftSection}>
              <Text style={ticketStyles.movieTitle}>{movieTitle}</Text>
              <Text style={ticketStyles.movieSubtitle}>English | 2D</Text>
              <Text style={ticketStyles.showtime}>{showtime}</Text>
            </View>

            {/* Right Section - Small Poster Thumbnail (optional, since poster is background) */}
            {posterUrl && (
              <View style={ticketStyles.rightSection}>
                <View style={ticketStyles.posterThumbnail}>
                  <Image 
                    src={posterUrl} 
                    style={ticketStyles.poster}
                    cache={false}
                  />
                </View>
              </View>
            )}
          </View>

          {/* QR Code - Centered */}
          <View style={{ alignItems: 'center', marginTop: 8, marginBottom: 6 }}>
            {qrData ? (
              <View style={ticketStyles.qrContainer}>
                <Image src={qrData} style={ticketStyles.qrImage} />
              </View>
            ) : null}
          </View>

          {/* Auditorium and Seat Info */}
          <View style={{ alignItems: 'center', marginBottom: 6 }}>
            <Text style={ticketStyles.auditorium}>AUDI {screenNumber}</Text>
            <Text style={ticketStyles.seatInfo}>{seatDisplay}</Text>
          </View>

          {/* Divider */}
          <View style={ticketStyles.divider} />

          {/* Location */}
          {theaterName && (
            <Text style={ticketStyles.location}>
              {theaterName}
            </Text>
          )}

          {/* Booking ID */}
          <Text style={ticketStyles.bookingId}>
            Booking ID: {bookingId.slice(0, 8).toUpperCase()}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export default function TicketPDF(props: TicketPDFProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [posterDataUrl, setPosterDataUrl] = useState<string | null>(null)
  const [themeColors, setThemeColors] = useState<{ primary: string; secondary: string; accent: string } | undefined>(undefined)
  const [downloading, setDownloading] = useState(false)

  // Fetch theme colors from poster
  useEffect(() => {
    let mounted = true
    const loadThemeColors = async () => {
      if (!props.posterUrl || props.posterUrl.startsWith('data:')) return
      
      try {
        const imageUrl = props.posterUrl.startsWith('/') 
          ? `${window.location.origin}${props.posterUrl}`
          : props.posterUrl.startsWith('http') 
            ? props.posterUrl 
            : `${window.location.origin}/${props.posterUrl}`
        
        const response = await fetch(`/api/poster/colors?url=${encodeURIComponent(imageUrl)}`)
        if (response.ok) {
          const data = await response.json()
          if (mounted && data.colors) {
            setThemeColors(data.colors)
          }
        }
      } catch (err) {
        console.warn('Failed to load theme colors:', err)
      }
    }
    loadThemeColors()
    return () => {
      mounted = false
    }
  }, [props.posterUrl])

  // Convert poster URL to data URL for react-pdf via API proxy
  useEffect(() => {
    let mounted = true
    const loadPoster = async () => {
      if (!props.posterUrl) {
        setPosterDataUrl(null)
        return
      }
      
      try {
        // If it's already a data URL, use it directly
        if (props.posterUrl.startsWith('data:')) {
          if (mounted) setPosterDataUrl(props.posterUrl)
          return
        }
        
        // Ensure the URL is absolute
        let imageUrl = props.posterUrl
        if (imageUrl.startsWith('/')) {
          imageUrl = `${window.location.origin}${imageUrl}`
        } else if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
          // If it's a relative path, make it absolute
          imageUrl = `${window.location.origin}/${imageUrl}`
        }
        
        // Use API route to proxy and convert to data URL
        try {
          const proxyResponse = await fetch(`/api/poster?url=${encodeURIComponent(imageUrl)}`)
          
          if (proxyResponse.ok) {
            const data = await proxyResponse.json()
            if (data.dataUrl && mounted) {
              setPosterDataUrl(data.dataUrl)
              return
            }
          }
          
          // Fallback: try direct fetch
          const response = await fetch(imageUrl, {
            mode: 'cors',
            credentials: 'omit',
            cache: 'no-cache',
          })
          
          if (response.ok) {
            const blob = await response.blob()
            const reader = new FileReader()
            
            reader.onloadend = () => {
              if (mounted && reader.result) {
                setPosterDataUrl(reader.result as string)
              }
            }
            
            reader.onerror = () => {
              console.warn('Poster conversion failed')
              if (mounted) setPosterDataUrl(null)
            }
            
            reader.readAsDataURL(blob)
          } else {
            console.warn('Poster fetch failed:', response.status)
            if (mounted) setPosterDataUrl(null)
          }
        } catch (fetchError) {
          console.warn('Poster fetch error:', fetchError)
          if (mounted) setPosterDataUrl(null)
        }
      } catch (err) {
        console.error('Poster loading error:', err)
        if (mounted) setPosterDataUrl(null)
      }
    }
    loadPoster()
    return () => {
      mounted = false
    }
  }, [props.posterUrl])

  useEffect(() => {
    let mounted = true
    const makeQR = async () => {
      try {
        const data = props.qrData || props.bookingId
        if (!data) return
        const url = await QRCode.toDataURL(data, { margin: 1, width: 256 })
        if (mounted) setQrDataUrl(url)
      } catch (err) {
        console.error('QR generation failed:', err)
      }
    }
    makeQR()
    return () => {
      mounted = false
    }
  }, [props.qrData, props.bookingId])

  const handleDownload = useCallback(async () => {
    try {
      setDownloading(true)
      
      // Wait a bit for poster to load if it's still loading
      if (props.posterUrl && !posterDataUrl && !props.posterUrl.startsWith('data:')) {
        // Wait up to 3 seconds for poster to load
        let waited = 0
        while (!posterDataUrl && waited < 3000) {
          await new Promise(resolve => setTimeout(resolve, 100))
          waited += 100
        }
      }
      
      const blob = await pdf(
        <TicketDocument 
          {...props} 
          qrData={qrDataUrl || undefined}
          posterUrl={posterDataUrl || props.posterUrl || undefined}
          theaterName={props.theaterName}
          screenName={props.screenName}
          themeColors={themeColors}
        />
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `cinesnap-ticket-${props.bookingId.slice(0, 8)}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF download failed:', err)
    } finally {
      setDownloading(false)
    }
  }, [props, qrDataUrl, posterDataUrl, themeColors])

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="px-8 py-4 bg-white text-black rounded-full font-clash font-semibold text-base hover:bg-white/90 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {downloading ? 'Generating PDF...' : 'Download Ticket PDF'}
    </button>
  )
}

