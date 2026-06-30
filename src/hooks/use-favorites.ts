'use client'

import { useState, useCallback, useEffect } from 'react'

const FAVORITES_KEY = 'vizualizatorpro-favorites'

/**
 * Hook za upravljanje priljubljenih materialov
 * 
 * Shranjuje favorite v localStorage (client-side).
 * Materiali se dodajo/odstranijo z eno potezo.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY)
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFavorites(JSON.parse(stored))
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  const save = useCallback((ids: string[]) => {
    setFavorites(ids)
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids))
    } catch {
      // ignore storage errors
    }
  }, [])

  const toggleFavorite = useCallback(
    (materialId: string) => {
      setFavorites((prev) => {
        const newFavs = prev.includes(materialId)
          ? prev.filter((id) => id !== materialId)
          : [...prev, materialId]
        try {
          localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavs))
        } catch {
          // ignore
        }
        return newFavs
      })
    },
    []
  )

  const isFavorite = useCallback(
    (materialId: string) => favorites.includes(materialId),
    [favorites]
  )

  const clearFavorites = useCallback(() => {
    save([])
  }, [save])

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    count: favorites.length,
  }
}
