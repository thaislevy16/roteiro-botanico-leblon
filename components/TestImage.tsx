// components/TestImage.tsx
import React from 'react'
import Image from 'next/image'

export default function TestImage() {
  return (
    <div className="p-4 bg-red-100 border-2 border-red-500">
      <h3 className="text-lg font-bold mb-2">Teste de Imagem</h3>
      <div className="relative w-64 h-48">
        <Image
          src="/images/arvores/caracteristicas/arvore/coquinho-vermelho.png"
          alt="Teste"
          fill
          className="object-cover"
        />
      </div>
    </div>
  )
}











