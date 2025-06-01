"use client"

import { useState } from "react"
import { Check, ChevronDown, Palette } from "lucide-react"
import { type CodeTheme, codeThemes } from "@/lib/theme-utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface CodeStyleSwitcherProps {
  onChange?: (theme: CodeTheme) => void
  defaultTheme?: CodeTheme
}

export function CodeStyleSwitcher({ onChange, defaultTheme = "default" }: CodeStyleSwitcherProps) {
  const [theme, setTheme] = useState<CodeTheme>(defaultTheme)

  const handleThemeChange = (newTheme: CodeTheme) => {
    setTheme(newTheme)
    onChange?.(newTheme)
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">Code Style:</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Palette size={16} />
            <span>{codeThemes.find((t) => t.value === theme)?.label}</span>
            <ChevronDown size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Select Theme</DropdownMenuLabel>
          {codeThemes.map((codeTheme) => (
            <DropdownMenuItem
              key={codeTheme.value}
              onClick={() => handleThemeChange(codeTheme.value)}
              className="flex items-center justify-between"
            >
              {codeTheme.label}
              {theme === codeTheme.value && <Check size={16} />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
