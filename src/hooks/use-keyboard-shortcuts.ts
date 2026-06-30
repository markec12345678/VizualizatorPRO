'use client'

import { useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

/**
 * Keyboard Shortcuts za VizualizatorPRO
 * 
 * Bližnjice:
 * - Ctrl/Cmd + K: Fokus na iskanje materialov
 * - Ctrl/Cmd + Enter: Generiraj vizualizacijo
 * - Ctrl/Cmd + S: Prenesi rezultat
 * - Ctrl/Cmd + D: Preklopi dark mode
 * - Ctrl/Cmd + ,: Odpri admin panel
 * - Escape: Zapri dialoge
 * - ?: Prikaži pomoč (shortcut help)
 * - 1/2/3: Preklopi tabove (Ograje/Keramika/Moji)
 * - G + H: Pojdi na začetek
 */

interface ShortcutHandlers {
  onSearch?: () => void
  onGenerate?: () => void
  onDownload?: () => void
  onToggleTheme?: () => void
  onAdmin?: () => void
  onTab1?: () => void
  onTab2?: () => void
  onTab3?: () => void
  onHome?: () => void
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const { toast } = useToast()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const cmd = isMac ? e.metaKey : e.ctrlKey

      // Ctrl/Cmd + K: Iskanje
      if (cmd && e.key === 'k') {
        e.preventDefault()
        const searchInput = document.querySelector('input[placeholder*="Iskanje"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
          searchInput.select()
        } else {
          handlers.onSearch?.()
        }
        return
      }

      // Ctrl/Cmd + Enter: Generiraj
      if (cmd && e.key === 'Enter') {
        e.preventDefault()
        const generateBtn = document.querySelector('button:has(svg.lucide-wand-2)') as HTMLButtonElement
        if (generateBtn && !generateBtn.disabled) {
          generateBtn.click()
          toast({ title: 'Generiram...', description: 'AI vizualizacija se obdeluje' })
        }
        return
      }

      // Ctrl/Cmd + S: Prenesi
      if (cmd && e.key === 's') {
        e.preventDefault()
        const downloadBtn = document.querySelector('button:has(svg.lucide-download)') as HTMLButtonElement
        if (downloadBtn) {
          downloadBtn.click()
        }
        return
      }

      // Ctrl/Cmd + D: Dark mode toggle
      if (cmd && e.key === 'd') {
        e.preventDefault()
        document.documentElement.classList.toggle('dark')
        const isDark = document.documentElement.classList.contains('dark')
        toast({
          title: isDark ? '🌙 Temna tema' : '☀️ Svetla tema',
          description: 'Tema je preklopljena',
        })
        return
      }

      // ?: Pomoč
      if (e.key === '?' && !cmd && !e.altKey) {
        const target = e.target as HTMLElement
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault()
          showShortcutsHelp(toast)
          return
        }
      }

      // 1/2/3: Tabovi (brez modifier)
      if (!cmd && !e.altKey && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        if (e.key === '1') {
          const tab = document.querySelector('[role="tab"]:nth-child(1)') as HTMLElement
          if (tab) tab.click()
          return
        }
        if (e.key === '2') {
          const tab = document.querySelector('[role="tab"]:nth-child(2)') as HTMLElement
          if (tab) tab.click()
          return
        }
        if (e.key === '3') {
          const tab = document.querySelector('[role="tab"]:nth-child(3)') as HTMLElement
          if (tab) tab.click()
          return
        }
      }

      // Escape: zapri dialoge
      if (e.key === 'Escape') {
        const dialog = document.querySelector('[role="dialog"]') as HTMLElement
        if (dialog) {
          const closeBtn = dialog.querySelector('button[aria-label="Close"]') as HTMLButtonElement
          if (closeBtn) closeBtn.click()
        }
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlers, toast])
}

function showShortcutsHelp(toast: any) {
  const shortcuts = [
    '⌘/Ctrl + K — Iskanje materialov',
    '⌘/Ctrl + Enter — Generiraj vizualizacijo',
    '⌘/Ctrl + S — Prenesi rezultat',
    '⌘/Ctrl + D — Preklopi dark mode',
    '1 / 2 / 3 — Preklopi tabove',
    '? — Prikaži to pomoč',
    'Esc — Zapri dialoge',
  ]

  toast({
    title: '⌨️ Bližnjice na tipkovnici',
    description: shortcuts.join('\n'),
    duration: 8000,
  })
}
