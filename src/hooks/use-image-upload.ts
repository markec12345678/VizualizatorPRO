'use client'

import { useState, useCallback, useRef } from 'react'

interface UseImageUploadOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

interface UseImageUploadReturn {
  imagePreview: string | null
  imageBase64: string | null
  error: string | null
  isProcessing: boolean
  handleFileSelect: (file: File) => void
  handleFileInput: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleCameraCapture: (event: React.ChangeEvent<HTMLInputElement>) => void
  clearImage: () => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  cameraInputRef: React.RefObject<HTMLInputElement | null>
}

export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadReturn {
  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.85,
  } = options

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const processImage = useCallback((file: File) => {
    setError(null)
    setIsProcessing(true)

    if (!file.type.startsWith('image/')) {
      setError('Datoteka ni slika. Prosimo, izberite JPEG, PNG ali WebP.')
      setIsProcessing(false)
      return
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('Slika je prevelika. Maksimalna velikost je 15MB.')
      setIsProcessing(false)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > height && width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        } else if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          setError('Napaka pri obdelavi slike (Canvas).')
          setIsProcessing(false)
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        const compressed = canvas.toDataURL('image/jpeg', quality)
        
        setImagePreview(compressed)
        setImageBase64(compressed)
        setIsProcessing(false)
      }
      img.onerror = () => {
        setError('Napaka pri nalaganju slike.')
        setIsProcessing(false)
      }
      img.src = e.target?.result as string
    }
    reader.onerror = () => {
      setError('Napaka pri branju datoteke.')
      setIsProcessing(false)
    }
    reader.readAsDataURL(file)
  }, [maxWidth, maxHeight, quality])

  const handleFileSelect = useCallback((file: File) => {
    processImage(file)
  }, [processImage])

  const handleFileInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) processImage(file)
  }, [processImage])

  const handleCameraCapture = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) processImage(file)
  }, [processImage])

  const clearImage = useCallback(() => {
    setImagePreview(null)
    setImageBase64(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }, [])

  return {
    imagePreview,
    imageBase64,
    error,
    isProcessing,
    handleFileSelect,
    handleFileInput,
    handleCameraCapture,
    clearImage,
    fileInputRef,
    cameraInputRef,
  }
}
