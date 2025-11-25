// components/Layout.tsx
import React, { ReactNode } from 'react'
import BottomNav from './BottomNav'
import InstallPrompt from './InstallPrompt'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="relative flex flex-col min-h-screen bg-primary-bg text-on-primary font-body">
      <main className="flex-1 relative">
        {children}
      </main>
      <BottomNav />
      <InstallPrompt />
    </div>
  )
}
