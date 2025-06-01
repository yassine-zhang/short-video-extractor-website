"use client"

import { Activity, AlertTriangle, CheckCircle } from "lucide-react"
import { useEffect, useState } from "react"

type StatusType = "up" | "down" | "degraded" | "unknown"

interface StatusData {
  status: StatusType
  uptime?: string
  lastUpdatedAt?: number
  error?: string
}

export function StatusIndicator() {
  const [statusData, setStatusData] = useState<StatusData>({ status: "unknown" })
  const [isLoading, setIsLoading] = useState(true)
  const [isAnimating, setIsAnimating] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Create a pulsing animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating((prev) => !prev)
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  // Fetch status data
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsLoading(true)
        setFetchError(null)

        // Add a timestamp to prevent caching
        const response = await fetch(`/api/service-status?t=${Date.now()}`)

        if (!response.ok) {
          throw new Error(`Status API returned ${response.status}`)
        }

        const data = await response.json()

        if (data.error) {
          console.warn("Status API returned error:", data.error)
          setFetchError(data.error)
        }

        // Ensure status is lowercase for consistency
        if (data.status) {
          data.status = data.status.toLowerCase()
        }

        setStatusData(data)
      } catch (error) {
        console.error("Error fetching status:", error)
        setFetchError(error instanceof Error ? error.message : String(error))
        // Keep the previous status if available, otherwise set to unknown
        setStatusData((prev) => (prev.status !== "unknown" ? prev : { status: "unknown" }))
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatus()

    // Refresh status every 60 seconds
    const intervalId = setInterval(fetchStatus, 60000)
    return () => clearInterval(intervalId)
  }, [])

  const handleClick = () => {
    window.open("https://status.itcox.cn", "_blank", "noopener,noreferrer")
  }

  // Determine status display
  const getStatusDisplay = () => {
    if (isLoading && statusData.status === "unknown") {
      return {
        icon: <Activity className={`h-4 w-4 text-blue-500 ${isAnimating ? "opacity-100" : "opacity-50"}`} />,
        text: "检查中...",
        color: "text-blue-500",
      }
    }

    // If we have a fetch error but had a previous valid status, still show that status
    // but with the animated icon to indicate we're having trouble refreshing
    if (fetchError && statusData.status !== "unknown") {
      const baseDisplay = getStatusDisplayForStatus(statusData.status)
      return {
        ...baseDisplay,
        icon: (
          <Activity
            className={`h-4 w-4 ${baseDisplay.color.replace("text-", "text-")} ${isAnimating ? "opacity-100" : "opacity-50"}`}
          />
        ),
      }
    }

    return getStatusDisplayForStatus(statusData.status)
  }

  const getStatusDisplayForStatus = (status: StatusType) => {
    switch (status) {
      case "up":
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          text: "服务正常",
          color: "text-green-500",
        }
      case "down":
        return {
          icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
          text: "服务中断",
          color: "text-red-500",
        }
      case "degraded":
        return {
          icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
          text: "服务降级", // Changed from "服务不稳定" to "服务降级"
          color: "text-yellow-500",
        }
      default:
        return {
          icon: <Activity className={`h-4 w-4 text-gray-500 ${isAnimating ? "opacity-100" : "opacity-50"}`} />,
          text: "状态未知",
          color: "text-gray-500",
        }
    }
  }

  const { icon, text, color } = getStatusDisplay()

  return (
    <div
      className={`flex items-center gap-1 cursor-pointer hover:underline ${color}`}
      onClick={handleClick}
      title={fetchError ? `获取状态时出错: ${fetchError}` : "查看服务状态详情"}
    >
      {icon}
      <span className="text-sm">{text}</span>
    </div>
  )
}
