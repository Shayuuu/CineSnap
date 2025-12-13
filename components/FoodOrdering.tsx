'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/dateUtils'

type FoodItem = {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  imageUrl: string | null
}

type Props = {
  bookingId?: string
  onOrderComplete?: (total: number) => void
}

export default function FoodOrdering({ bookingId, onOrderComplete }: Props) {
  const [items, setItems] = useState<FoodItem[]>([])
  const [cart, setCart] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    fetchFoodItems()
  }, [selectedCategory])

  const fetchFoodItems = async () => {
    try {
      const url = selectedCategory
        ? `/api/food?category=${selectedCategory}`
        : '/api/food'
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
      }
    } catch (err) {
      console.error('Failed to fetch food items:', err)
    }
  }

  const addToCart = (itemId: string) => {
    setCart((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }))
  }

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const newCart = { ...prev }
      if (newCart[itemId] > 1) {
        newCart[itemId] -= 1
      } else {
        delete newCart[itemId]
      }
      return newCart
    })
  }

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = items.find((i) => i.id === itemId)
      return total + (item ? item.price * quantity : 0)
    }, 0)
  }

  const getCartCount = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0)
  }

  const categories = ['POPCORN', 'DRINKS', 'SNACKS', 'COMBO']
  const itemsByCategory = categories.reduce((acc, cat) => {
    acc[cat] = items.filter((item) => item.category === cat)
    return acc
  }, {} as Record<string, FoodItem[]>)

  return (
    <div className="glass rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-clash font-bold text-white">Food & Beverages</h3>
        {getCartCount() > 0 && (
          <div className="px-4 py-2 glass-strong rounded-full">
            <span className="text-white font-semibold">{getCartCount()} items</span>
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            selectedCategory === null
              ? 'bg-white text-black'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              selectedCategory === cat
                ? 'bg-white text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Food Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong rounded-xl p-4 border border-white/10"
          >
            <div className="aspect-square bg-white/5 rounded-lg mb-3 flex items-center justify-center">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <span className="text-4xl">
                  {item.category === 'POPCORN' ? '🍿' : item.category === 'DRINKS' ? '🥤' : item.category === 'SNACKS' ? '🍫' : '🍔'}
                </span>
              )}
            </div>
            <h4 className="font-semibold text-white mb-1">{item.name}</h4>
            {item.description && (
              <p className="text-xs text-gray-400 mb-2">{item.description}</p>
            )}
            <div className="flex items-center justify-between mt-3">
              <span className="text-lg font-bold text-white">{formatCurrency(item.price)}</span>
              <div className="flex items-center gap-2">
                {cart[item.id] ? (
                  <>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                    >
                      -
                    </button>
                    <span className="text-white font-semibold w-8 text-center">{cart[item.id]}</span>
                    <button
                      onClick={() => addToCart(item.id)}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                    >
                      +
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => addToCart(item.id)}
                    className="px-4 py-2 bg-white text-black rounded-lg font-semibold text-sm hover:bg-white/90 transition-colors"
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Cart Summary */}
      {getCartCount() > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-xl p-6 border-2 border-white/20"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xl font-clash font-bold text-white">Total</span>
            <span className="text-2xl font-clash font-bold text-white">{formatCurrency(getCartTotal())}</span>
          </div>
          <button
            onClick={() => onOrderComplete?.(getCartTotal())}
            className="w-full py-3 bg-white text-black rounded-lg font-clash font-bold text-lg hover:bg-white/90 transition-colors"
          >
            Add to Booking
          </button>
        </motion.div>
      )}
    </div>
  )
}

