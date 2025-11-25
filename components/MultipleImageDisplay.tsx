// components/MultipleImageDisplay.tsx
import React, { useState } from 'react'
import Image from 'next/image'

interface MultipleImageDisplayProps {
  images: string[]
  alt: string
  className?: string
}

export default function MultipleImageDisplay({ images, alt, className = '' }: MultipleImageDisplayProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null)

  if (!images || images.length === 0) {
    return null
  }

  // Se só tem uma imagem, usar o componente simples
  if (images.length === 1) {
    return (
      <div className={`mt-4 ${className}`}>
        <div 
          className="relative cursor-pointer rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          onClick={() => setActiveImage(images[0])}
        >
          <div className="aspect-video relative">
            <Image
              src={images[0]}
              alt={alt}
              fill
              className="object-cover"
              onError={(e) => {
                console.error('Erro ao carregar imagem:', images[0], e)
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  // Múltiplas imagens - mostrar em grid
  return (
    <div className={`mt-4 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {images.map((imagePath, index) => (
          <div
            key={index}
            className="relative cursor-pointer rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            onClick={() => setActiveImage(imagePath)}
          >
            <div className="aspect-video relative">
              <Image
                src={imagePath}
                alt={`${alt} ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Modal para visualização ampliada */}
      {activeImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setActiveImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-gray-300 z-10"
              onClick={() => setActiveImage(null)}
            >
              ×
            </button>
            <Image
              src={activeImage}
              alt="Imagem ampliada"
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}
