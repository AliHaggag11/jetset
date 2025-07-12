import * as React from 'react'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children: React.ReactNode
}

export function Avatar({ className = '', children, ...props }: AvatarProps) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-full bg-gray-200 overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function AvatarFallback({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`flex items-center justify-center w-full h-full font-bold select-none ${className}`}>
      {children}
    </span>
  )
} 