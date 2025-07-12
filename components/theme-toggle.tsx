'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/theme-provider'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getIcon = () => {
    if (theme === 'light') {
      return <Sun className="h-4 w-4" />
    } else if (theme === 'dark') {
      return <Moon className="h-4 w-4" />
    } else {
      return <Sun className="h-4 w-4" />
    }
  }

  const getLabel = () => {
    if (theme === 'light') {
      return 'Switch to dark mode'
    } else if (theme === 'dark') {
      return 'Switch to system theme'
    } else {
      return 'Switch to light mode'
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      aria-label={getLabel()}
      title={getLabel()}
    >
      {getIcon()}
    </Button>
  )
} 