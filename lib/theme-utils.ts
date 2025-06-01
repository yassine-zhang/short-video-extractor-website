import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type CodeTheme = "default" | "dark" | "light" | "github" | "dracula" | "nord" | "solarized"

export const codeThemes: { value: CodeTheme; label: string }[] = [
  { value: "default", label: "默认" },
  { value: "dark", label: "暗色" },
  { value: "light", label: "亮色" },
  { value: "github", label: "GitHub" },
  { value: "dracula", label: "Dracula" },
  { value: "nord", label: "Nord" },
  { value: "solarized", label: "Solarized" },
]

export const getCodeThemeClass = (theme: CodeTheme) => {
  switch (theme) {
    case "dark":
      return "bg-gray-900 text-gray-100"
    case "light":
      return "bg-gray-50 text-gray-900"
    case "github":
      return "bg-white text-gray-900 border border-gray-200"
    case "dracula":
      return "bg-[#282a36] text-[#f8f8f2]"
    case "nord":
      return "bg-[#2e3440] text-[#d8dee9]"
    case "solarized":
      return "bg-[#fdf6e3] text-[#657b83] dark:bg-[#002b36] dark:text-[#839496]"
    default:
      return "bg-gray-800 text-gray-100"
  }
}
