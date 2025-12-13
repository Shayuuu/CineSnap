'use client'

import { useEffect, useRef } from 'react'
import QRCodeLib from 'qrcode'

type Props = {
  value: string
  size?: number
  className?: string
}

export default function QRCode({ value, size = 200, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCodeLib.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
    }
  }, [value, size])

  return (
    <div className={className}>
      <canvas ref={canvasRef} className="rounded-lg" />
    </div>
  )
}

