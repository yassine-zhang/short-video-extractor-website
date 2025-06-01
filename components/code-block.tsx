"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { type CodeTheme, getCodeThemeClass } from "@/lib/theme-utils"
import { CodeStyleSwitcher } from "./code-style-switcher"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface CodeBlockProps {
  code: string
  language?: string
  showLineNumbers?: boolean
  title?: string
}

export function CodeBlock({ code, language = "javascript", showLineNumbers = true, title }: CodeBlockProps) {
  const [theme, setTheme] = useState<CodeTheme>("default")
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const themeClass = getCodeThemeClass(theme)

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {title && <span className="text-sm font-medium">{title}</span>}
        <div className="flex items-center gap-2">
          <CodeStyleSwitcher onChange={setTheme} defaultTheme={theme} />
          <Button variant="ghost" size="sm" onClick={handleCopy} className="flex items-center gap-1">
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </Button>
        </div>
      </div>
      <pre className={`p-4 overflow-x-auto ${themeClass}`}>
        <code className={`language-${language}`}>
          {showLineNumbers
            ? code.split("\n").map((line, i) => (
                <div key={i} className="table-row">
                  <span className="table-cell pr-4 text-gray-500 select-none text-right">{i + 1}</span>
                  <span className="table-cell">{line}</span>
                </div>
              ))
            : code}
        </code>
      </pre>
    </Card>
  )
}
