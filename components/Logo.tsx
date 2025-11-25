import React from 'react'
import Image from 'next/image'

interface LogoProps {
  showText?: boolean
  className?: string
  noBorder?: boolean
}

export default function Logo({ 
  showText = false, 
  className = '',
  noBorder = false
}: LogoProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className={`w-20 h-20 sm:w-32 sm:h-32 rounded-full overflow-hidden`}>
        <Image
          src="/images/logo-app.png"
          alt="Logo Roteiro Verde Leblon"
          width={128}
          height={128}
          className="object-cover w-full h-full"
          priority
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="text-base font-bold text-highlight">
            Roteiro Verde Leblon
          </span>
          <span className="text-xs text-gray-600">
            Botânico Digital
          </span>
        </div>
      )}
    </div>
  )
}
